import { useState, useEffect, useRef } from "react";

import * as Dialog from "@radix-ui/react-dialog";

import {
  X,
  Sliders,
  ArrowDownUp,
  Trash2,
  Plus,
  ChevronDown,
  Upload,
  LayoutGrid,
  Check,
} from "lucide-react";

import {
  getContent,
  createContent,
  uploadFile,
  updateContent,
  deleteContent,
} from "../api/content";

import ContentTile from "../components/ContentTile.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import Button from "../components/Button.jsx";

function Content() {
  const [content, setContent] = useState([]);
  // for selecting content
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // "media" | "app" | null

  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [appName, setAppName] = useState("");

  // a single id - tracks which tile's settings panel is currently open!
  const [selectedId, setSelectedId] = useState(null);
  const [settingsName, setSettingsName] = useState("");
  const [settingsDurationSec, setSettingsDurationSec] = useState("");

  // delete modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    const data = await getContent();
    setContent(data);
  }

  async function handleMediaSubmit(e) {
    e.preventDefault();

    if (
      !mediaFile.type.startsWith("image/") &&
      !mediaFile.type.startsWith("video/")
    ) {
      alert("Only image or video files are allowed.");
      return;
    }

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

  async function handleBulkDeleteContent() {
    await Promise.all(Array.from(checkedIds).map((id) => deleteContent(id)));
    setContent((prev) => prev.filter((item) => !checkedIds.has(item._id)));
    setCheckedIds(new Set());
    setDeleteConfirmOpen(false);
  }

  function toggleSelectAll() {
    if (checkedIds.size === content.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(content.map((item) => item._id)));
    }
  }

  function toggleSelect(id, e) {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedItem = content.find((item) => item._id === selectedId);

  return (
    <>
      <div className="flex">
        <div className="flex-1">
          <Dialog.Root
            open={activeForm === "media"}
            onOpenChange={(open) => !open && setActiveForm(null)}
          >
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel p-6 rounded-lg w-96 z-40">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-text-primary font-bold">
                    Upload Image/Video
                  </Dialog.Title>
                  <Dialog.Close className="text-text-muted hover:text-accent-red transition-colors">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <form
                  onSubmit={handleMediaSubmit}
                  className="flex flex-col gap-3"
                >
                  <input
                    value={mediaName}
                    onChange={(e) => setMediaName(e.target.value)}
                    placeholder="Enter file name"
                    required
                    className="bg-bg-hover text-text-primary px-2 py-1 rounded"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        setMediaFile(selectedFile);
                        if (selectedFile) {
                          const nameWithoutExtension =
                            selectedFile.name.replace(/\.[^/.]+$/, "");
                          setMediaName(nameWithoutExtension);
                        }
                      }}
                      required
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 bg-accent-blue hover:opacity-90 text-white font-semibold text-sm px-4 py-2 rounded-full shrink-0"
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                    {mediaFile && (
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          title={mediaFile.name}
                          className="text-text-muted text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                          style={{ minWidth: "10ch" }}
                        >
                          {mediaFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaFile(null);
                            setMediaName("");
                            fileInputRef.current.value = "";
                          }}
                          className="text-text-muted hover:text-accent-red shrink-0"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <Dialog.Close
                      className="text-text-muted px-3 py-1"
                      onClick={() => {
                        setMediaFile(null);
                        setMediaName("");
                        fileInputRef.current.value = "";
                      }}
                    >
                      Cancel
                    </Dialog.Close>
                    <Button type="submit">Add File</Button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          <Dialog.Root
            open={activeForm === "app"}
            onOpenChange={(open) => !open && setActiveForm(null)}
          >
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-panel p-6 rounded-lg w-96 z-40">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-text-primary font-bold">
                    Add an App
                  </Dialog.Title>
                  <Dialog.Close className="text-text-muted hover:text-accent-red transition-colors">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <form
                  onSubmit={handleAppSubmit}
                  className="flex flex-col gap-3"
                >
                  <input
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="App"
                    required
                    className="bg-bg-hover text-text-primary px-2 py-1 rounded"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Dialog.Close className="text-text-muted px-3 py-1">
                      Cancel
                    </Dialog.Close>
                    <Button type="submit">Add App</Button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* upload bar */}
          <div className="flex items-center justify-between py-2 pb-4 mb-2 border-b border-bg-hover">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={
                  checkedIds.size > 0 && checkedIds.size === content.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-accent-blue"
                title="Select all"
              />
              {checkedIds.size === 0 && (
                <span className="text-text-muted text-sm">Select all</span>
              )}
              {checkedIds.size > 0 && (
                <span className="text-text-muted text-sm">
                  Selected {checkedIds.size} of {content.length} media files
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
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={checkedIds.size === 0}
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
                <ContentTile
                  key={item._id}
                  item={item}
                  className={
                    checkedIds.has(item._id)
                      ? "border-2 border-accent-blue -translate-y-0.5"
                      : ""
                  }
                >
                  <button
                    onClick={(e) => toggleSelect(item._id, e)}
                    className={`absolute left-2 top-2 z-10 w-[21px] h-[21px] rounded-full flex items-center justify-center border-[1.5px] border-accent-blue shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-opacity ${
                      checkedIds.has(item._id)
                        ? "bg-accent-blue opacity-100"
                        : "bg-white/95 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {checkedIds.has(item._id) && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </button>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openSettings(item)}
                      className="bg-white text-black rounded-full p-2"
                      title="Manage"
                    >
                      <Sliders size={18} />
                    </button>
                  </div>
                </ContentTile>
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
                <Button onClick={handleSettingsSave}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* confirm delete modal */}
        <ConfirmDeleteModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Content"
          items={content
            .filter((item) => checkedIds.has(item._id))
            .map((item) => ({ id: item._id, name: item.name }))}
          onConfirm={handleBulkDeleteContent}
        />
      </div>
    </>
  );
}

export default Content;
