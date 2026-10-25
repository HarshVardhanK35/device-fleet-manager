import dns from "dns/promises";
import http from "http";
import https from "https";
import { XMLParser } from "fast-xml-parser";

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB cap

function isPrivateIp(ip) {
  if (ip === "127.0.0.1" || ip === "::1") return true;

  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 127) return true;
  }

  if (ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) {
    return true;
  }

  return false;
}

async function assertSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed");
  }

  const { address } = await dns.lookup(parsed.hostname, { family: 4 });
  console.log("[feed] resolved", parsed.hostname, "->", address);
  if (isPrivateIp(address)) {
    throw new Error("URL resolves to a disallowed address");
  }

  return { parsed, address };
}

function pinnedRequest(parsedUrl, address) {
  const transport = parsedUrl.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CastwiseRSS/1.0)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        lookup: (hostname, options, callback) => {
          if (options.all) {
            callback(null, [{ address, family: 4 }]);
          } else {
            callback(null, address, 4);
          }
        },
        timeout: 8000,
      },
      (res) => resolve(res),
    );

    console.log(
      "[feed] connecting to",
      address,
      "port",
      parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
    );

    req.on("timeout", () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    req.end();
  });
}

async function fetchFeedFollowingRedirects(rawUrl, maxHops = 5) {
  let currentUrl = rawUrl;
  for (let hop = 0; hop <= maxHops; hop++) {
    console.log(`[feed] hop ${hop}: requesting`, currentUrl);
    const { parsed, address } = await assertSafeUrl(currentUrl);
    const upstream = await pinnedRequest(parsed, address);
    console.log(
      `[feed] hop ${hop}: status`,
      upstream.statusCode,
      upstream.headers.location ?? "",
    );

    if (upstream.statusCode >= 300 && upstream.statusCode < 400) {
      upstream.destroy();
      const location = upstream.headers.location;
      if (!location) throw new Error("Redirect with no Location header");
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }
    return upstream;
  }
  throw new Error("Too many redirects");
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function extractImage(item) {
  const media = item["media:content"] || item["media:thumbnail"];
  if (media) {
    const first = Array.isArray(media) ? media[0] : media;
    if (first?.["@_url"]) return first["@_url"];
  }

  const enclosure = item.enclosure;
  if (enclosure?.["@_url"] && String(enclosure["@_type"]).startsWith("image")) {
    return enclosure["@_url"];
  }

  const html = item["content:encoded"] || item.description || "";
  const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];

  return null;
}

function normalizeRssItem(item) {
  return {
    title: item.title ?? "",
    description: item.description ?? "",
    link: item.link ?? "",
    pubDate: item.pubDate ?? "",
    guid:
      typeof item.guid === "object" ? item.guid["#text"] : (item.guid ?? ""),
    author: item.author ?? item["dc:creator"] ?? "",
    image: extractImage(item),
    categories: toArray(item.category).map((c) =>
      typeof c === "object" ? c["#text"] : c,
    ),
    contentEncoded: item["content:encoded"] ?? "",
  };
}

function normalizeAtomEntry(entry) {
  const links = toArray(entry.link);
  const htmlLink = links.find((l) => l["@_rel"] === "alternate") || links[0];

  return {
    title: entry.title?.["#text"] ?? entry.title ?? "",
    description: entry.summary?.["#text"] ?? entry.summary ?? "",
    link: htmlLink?.["@_href"] ?? "",
    pubDate: entry.published ?? entry.updated ?? "",
    guid: entry.id ?? "",
    author: entry.author?.name ?? "",
    image: extractImage(entry),
    categories: toArray(entry.category).map((c) => c["@_term"] ?? c),
    contentEncoded: entry.content?.["#text"] ?? entry.content ?? "",
  };
}

export const fetchFeed = async (req, res) => {
  const { url } = req.query;

  if (typeof url !== "string") {
    return res.status(400).json({ message: "Missing url" });
  }

  try {
    const upstream = await fetchFeedFollowingRedirects(url);

    if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
      upstream.destroy();
      return res.status(502).json({ message: "Upstream fetch failed" });
    }

    const contentLength = upstream.headers["content-length"];
    if (contentLength && Number(contentLength) > MAX_RESPONSE_BYTES) {
      upstream.destroy();
      return res.status(413).json({ message: "Feed too large" });
    }

    const chunks = [];
    let receivedBytes = 0;

    for await (const chunk of upstream) {
      receivedBytes += chunk.byteLength;
      if (receivedBytes > MAX_RESPONSE_BYTES) {
        upstream.destroy();
        return res.status(413).json({ message: "Feed too large" });
      }
      chunks.push(chunk);
    }

    const xml = Buffer.concat(chunks).toString("utf-8");
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed2 = parser.parse(xml);

    let items = [];
    if (parsed2.rss?.channel) {
      items = toArray(parsed2.rss.channel.item).map(normalizeRssItem);
    } else if (parsed2.feed) {
      items = toArray(parsed2.feed.entry).map(normalizeAtomEntry);
    } else {
      return res.status(400).json({ message: "Unrecognized feed format" });
    }

    const sourceImage =
      parsed2.rss?.channel?.image?.url ??
      parsed2.feed?.icon ??
      parsed2.feed?.logo ??
      null;

    console.log("[feed] sending to frontend:", {
      itemCount: items.length,
      sourceImage,
      firstItem: items[0],
    });
    res.json({ items, sourceImage });
  } catch (error) {
    console.error("[feed] failed:", error.stack);
    res.status(502).json({ message: error.message });
  }
};
