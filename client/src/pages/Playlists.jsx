import { useState, useEffect, useRef } from "react";
import { getPlaylists, createPlaylist } from "../api/playlists";
import { getContent } from "../api/content";

function Playlists() {
  const [isOpen, setIsOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [content, setContent] = useState([]);
  const [name, setName] = useState("");
  const [selectedContentItems, setSelectedContentItems] = useState([]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function getPlaylist() {
      const playlistData = await getPlaylists();
      const contentData = await getContent();

      setPlaylists(playlistData);
      setContent(contentData);
    }

    getPlaylist();
  }, []);

  function toggleContentItem(id) {
    setSelectedContentItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newPlaylist = await createPlaylist({
      name: name,
      contentItems: selectedContentItems,
    });

    setPlaylists([...playlists, newPlaylist]);
    setName("");
    setSelectedContentItems([]);
    setIsOpen(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter playlist name"
          required
        />

        <div
          ref={dropdownRef}
          style={{ position: "relative", display: "inline-block" }}
        >
          <button type="button" onClick={() => setIsOpen(!isOpen)}>
            {selectedContentItems.length > 0
              ? `${selectedContentItems.length} items selected`
              : "Select content ▾"}
          </button>

          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                width: "100%",
                left: 0,
                background: "white",
                border: "1px solid #ccc",
                padding: "8px",
                zIndex: 1,
              }}
            >
              {content.map((item) => (
                <label key={item._id} style={{ display: "block" }}>
                  <input
                    type="checkbox"
                    checked={selectedContentItems.includes(item._id)}
                    onChange={() => toggleContentItem(item._id)}
                  />
                  {item.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit">Create</button>
      </form>

      <ul>
        {playlists.map((playlist) => {
          return (
            <li key={playlist._id}>
              {playlist.name} — {playlist.contentItems.length}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default Playlists;
