// Proxies a fetch of an app's built bundle (zip) from GitHub Releases —
// browsers can't fetch these cross-origin directly, GitHub doesn't send
// CORS headers on release asset downloads. This only ever forwards
// requests to a tightly allowlisted pattern (our own GitHub account's
// release-download URLs), never an arbitrary URL, to avoid becoming an
// open SSRF proxy.

const ALLOWED_URL_PATTERN =
  /^https:\/\/github\.com\/HarshVardhanK35\/[^/]+\/releases\/download\/[^/]+\/[^/]+$/;

export const fetchAppBundle = async (req, res) => {
  const { url } = req.query;

  if (typeof url !== "string" || !ALLOWED_URL_PATTERN.test(url)) {
    return res
      .status(400)
      .json({ message: "Invalid or disallowed bundle URL" });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(502).json({ message: "Upstream fetch failed" });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", "application/zip");
    res.send(buffer);
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};
