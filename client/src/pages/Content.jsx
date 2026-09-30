import { useState, useEffect } from "react";

import { getContent, createContent } from "../api/content";

function Content() {
  const [content, setContent] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("image");
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

    const newItem = await createContent({
      name: name,
      type: type,
      durationInMillis: Number(durationInMillis),
      tags: tags.split(",").map((tag) => tag.trim()),
    });

    setContent([...content, newItem]);
    setName("");
    setType("image");
    setDurationInMillis("");
    setTags("");
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
        <button type="submit">Create</button>
      </form>

      <ul>
        {content.map((item) => {
          return (
            <li key={item._id}>
              {item.name} — {item.type} — {item.durationInMillis}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default Content;
