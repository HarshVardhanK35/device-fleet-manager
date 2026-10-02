import { useState, useEffect } from "react";

import {
  X,
  Sliders,
  ArrowDownUp,
  Trash2,
  Plus,
  ChevronDown,
  Upload,
  LayoutGrid,
} from "lucide-react";

import {
  getContent,
  createContent,
  uploadFile,
  updateContent,
} from "../api/content";

function Content() {
  const [content, setContent] = useState([]);
  // for selecting content
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // "media" | "app" | null

  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [appName, setAppName] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [settingsName, setSettingsName] = useState("");
  const [settingsDurationSec, setSettingsDurationSec] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const data = await getContent();
    setContent(data);
  }

  async function handleMediaSubmit(e) {
    e.preventDefault();

    const uploadResult = await uploadFile(mediaFile);
    const type = mediaFile.type.startsWith("video") ? "video" : "image";

    await createContent({
      name: mediaName,
      type: type,
      mediaUrl: uploadResult.url,
    });

    setMediaName("");
    setMediaFile("");
    setActiveForm(null);
    fetchContent();
  }

  async function handleAppSubmit(e) {
    e.preventDefault();

    const newItem = await createContent({
      name: appName,
      type: "app",
    });

    setAppName("");
    setActiveForm(null);
    fetchContent();

    if (newItem && newItem._id) {
      openSettings(newItem);
    }
  }

  function openSettings(item) {
    setSelectedId(item._id);
    setSettingsName(item.name);
    setSettingsDurationSec(
      item.durationInMillis ? item.durationInMillis / 1000 : "",
    );
  }

  async function handleSettingsSave() {
    await updateContent(selectedId, {
      name: settingsName,
      durationInMillis: Number(settingsDurationSec) * 1000,
    });

    setSelectedId(null);
    fetchContent();
  }

  function toggleSelectAll() {
    if (selectedIds.size === content.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(content.map((item) => item._id)));
    }
  }

  const selectedItem = content.find((item) => item._id === selectedId);

  return (
    <>
      <div className="flex">
        <div className="flex-1">
          {/* <div className="relative flex">
            <button
              onClick={() => {
                setActiveForm("media");
                setUploadMenuOpen(false);
              }}
              className="flex items-center gap-2 bg-[#50cd89] hover:bg-[#45b87a] text-white font-semibold text-sm px-4 py-2 rounded-l-md"
            >
              <Plus size={16} />
              Upload
            </button>
            <button
              onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
              className="flex items-center justify-center bg-[#50cd89] hover:bg-[#45b87a] text-white px-2 rounded-r-md border-l border-black/10"
            >
              <ChevronDown size={14} />
            </button>

            {uploadMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-bg-panel rounded-lg shadow-lg py-2 z-20">
                <button
                  onClick={() => {
                    setActiveForm("media");
                    setUploadMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary"
                >
                  <Upload size={16} /> Image/Video
                </button>
                <button
                  onClick={() => {
                    setActiveForm("app");
                    setUploadMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary"
                >
                  <LayoutGrid size={16} /> Add an App
                </button>
              </div>
            )}
          </div> */}

          {activeForm === "media" && (
            <form onSubmit={handleMediaSubmit}>
              <input
                value={mediaName}
                onChange={(e) => setMediaName(e.target.value)}
                placeholder="name"
                required
              />
              <input
                type="file"
                onChange={(e) => setMediaFile(e.target.files[0])}
                required
              />
              <button type="submit">Create</button>
            </form>
          )}

          {activeForm === "app" && (
            <form onSubmit={handleAppSubmit}>
              <input
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="name"
                required
              />
              <button type="submit">Create</button>
            </form>
          )}

          {/* upload bar */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={
                  selectedIds.size > 0 && selectedIds.size === content.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-accent-blue"
              />
              {selectedIds.size > 0 && (
                <span className="text-text-muted text-sm">
                  Selected {selectedIds.size} of {content.length} media files
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex">
                <button
                  onClick={() => {
                    setActiveForm("media");
                    setUploadMenuOpen(false);
                  }}
                  className="flex items-center gap-2 bg-[#50cd89] hover:bg-[#45b87a] text-white font-semibold text-sm px-4 py-2 rounded-l-md"
                >
                  <Plus size={16} />
                  Upload
                </button>
                <button
                  onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                  className="flex items-center justify-center bg-[#50cd89] hover:bg-[#45b87a] text-white px-2 rounded-r-md border-l border-black/10"
                >
                  <ChevronDown size={14} />
                </button>

                {uploadMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-bg-panel rounded-lg shadow-lg py-2 z-20">
                    <button
                      onClick={() => {
                        setActiveForm("media");
                        setUploadMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary"
                    >
                      <Upload size={16} /> Image/Video
                    </button>
                    <button
                      onClick={() => {
                        setActiveForm("app");
                        setUploadMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary"
                    >
                      <LayoutGrid size={16} /> Add an App
                    </button>
                  </div>
                )}
              </div>

              <button
                className="text-text-muted hover:text-text-primary p-2"
                title="Sort"
              >
                <ArrowDownUp size={16} />
              </button>
              <button
                disabled={selectedIds.size === 0}
                className="text-text-muted hover:text-accent-red disabled:opacity-40 disabled:hover:text-text-muted p-2"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* content mapping */}
          <div className="flex flex-wrap gap-4 mt-4">
            {content.map((item) => {
              return (
                <div
                  key={item._id}
                  className="relative group cursor-pointer w-[218px] rounded-[10px] overflow-hidden bg-bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)]"
                >
                  {/* preview area — 16:9, not square */}
                  <div className="relative aspect-video bg-[#201e1e] flex items-center justify-center">
                    {item.type === "app" ? (
                      <span className="text-text-muted text-sm">App</span>
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}

                    {/* duration badge */}
                    {item.durationInMillis && (
                      <span className="absolute right-1.5 bottom-1.5 bg-black/78 text-white text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[5px] leading-[15px] min-h-[15px]">
                        {item.durationInMillis / 1000}s
                      </span>
                    )}

                    {/* hover manage icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openSettings(item)}
                        className="bg-white text-black rounded-full p-2"
                        title="Manage"
                      >
                        <Sliders size={18} />
                      </button>
                    </div>
                  </div>

                  {/* footer */}
                  <div className="flex flex-col gap-1.5 px-2.5 pt-2 pb-2.5">
                    <p className="font-bold text-[0.7rem] leading-[1.35] text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.name}
                    </p>
                    <span className="inline-flex items-center justify-center w-fit text-[10px] font-bold px-[6px] py-[2px] rounded-[5px] text-[rgb(214,220,227)] bg-[rgb(39,45,55)]">
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedItem && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30"
            onClick={() => setSelectedId(null)}
          >
            <div
              className="bg-bg-panel p-6 rounded-lg w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-text-primary font-bold">
                  Settings — {selectedItem.type}
                </h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-text-muted"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                value={settingsName}
                onChange={(e) => setSettingsName(e.target.value)}
                className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full mb-3"
              />

              {selectedItem.type !== "video" && (
                <input
                  type="number"
                  value={settingsDurationSec}
                  onChange={(e) => setSettingsDurationSec(e.target.value)}
                  placeholder="duration (seconds)"
                  className="bg-bg-hover text-text-primary px-2 py-1 rounded w-full mb-4"
                />
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-text-muted px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSettingsSave}
                  className="bg-accent-blue text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Content;
