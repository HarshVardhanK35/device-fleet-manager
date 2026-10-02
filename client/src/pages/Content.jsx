import { useState, useEffect } from "react";

import { getContent, createContent, uploadFile } from "../api/content";

function Content() {
  const [content, setContent] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("image");

  // file uploads
  const [file, setFile] = useState(null);

  const [durationInMillis, setDurationInMillis] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    async function fetchContent() {
      const data = await getContent();
      // console.log(data);
      setContent(data);
    }

    fetchContent();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    // file upload
    let mediaUrl;
    if (file) {
      const uploadResult = await uploadFile(file);
      // returns - cloudinary secure.url as a response after file-upload (req.body.file)
      mediaUrl = uploadResult.url;
    }

    const newItem = await createContent({
      name: name,
      type: type,
      mediaUrl: mediaUrl,
      durationInMillis: Number(durationInMillis),
      tags: tags.split(",").map((tag) => tag.trim()),
    });

    setContent([...content, newItem]);
    setName("");
    setType("image");
    setDurationInMillis("");
    setTags("");
    setFile(null);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="app">Application</option>
        </select>
        <input
          value={durationInMillis}
          onChange={(e) => setDurationInMillis(e.target.value)}
          placeholder="Enter duration in milliseconds"
          type="number"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags (comma-separated)"
        />
        {/* upload a file */}
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button type="submit">Create</button>
      </form>

      <ul>
        {content.map((item) => {
          return (
            <li key={item._id}>
              {item.name} — {item.type} — {item.durationInMillis}
              {item.mediaUrl && (
                <img
                  src={item.mediaUrl}
                  alt={item.name}
                  style={{ height: "60px" }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default Content;
