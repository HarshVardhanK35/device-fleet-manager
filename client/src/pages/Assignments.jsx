import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar } from "lucide-react";

import { getDevices } from "../api/devices.js";
import { getAssignments, deleteAssignment } from "../api/assignments.js";

import { timeAgo } from "../utils/timeAgo.js";
import {
  getAssignmentStatus,
  getDeviceSummary,
  TIMELINE_DOT,
} from "../utils/assignmentStatus.js";
import Button from "../components/Button.jsx";
import AssignmentCard from "../components/AssignmentCard.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import SkeletonList from "../components/SkeletonList.jsx";
import SkeletonPanel from "../components/SkeletonPanel.jsx";

function Assignments() {
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(false), 10000);
    return () => clearInterval(interval);
  }, []);

  async function load(isInitial) {
    const [deviceData, assignmentData] = await Promise.all([
      getDevices(),
      getAssignments(),
    ]);
    const merged = deviceData.map((d) => ({
      ...d,
      assignments: assignmentData.filter((a) => a.deviceId?._id === d._id),
    }));
    setDevices(merged);
    if (isInitial && merged.length) setSelectedId(merged[0]._id);
    if (isInitial) setLoading(false);
  }

  async function handleConfirmDeleteAssignment() {
    await deleteAssignment(deleteTarget._id);
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        assignments: d.assignments.filter((a) => a._id !== deleteTarget._id),
      })),
    );
    setDeleteTarget(null);
  }

  const selectedDevice = devices.find((d) => d._id === selectedId);
  const onlineCount = devices.filter((d) => d.status === "online").length;

  function selectDevice(id) {
    setSelectedId(id);
    setMobileView("detail");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-text-primary text-xl font-bold">Assignments</h1>
      <p className="text-accent-blue text-sm mb-4">
        Choose which playlist each screen plays, and when.
      </p>

      <div className="flex gap-4">
        {/* left pane */}
        <div
          className={`w-80 flex-shrink-0 pr-4 ${
            mobileView === "detail" ? "hidden lg:block" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-bg-hover">
            <h2 className="text-text-muted text-xs font-semibold uppercase tracking-wide">
              Your Devices
            </h2>
            <span className="text-text-muted text-xs">
              {onlineCount} of {devices.length} online
            </span>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : (
            <div className="flex flex-col gap-2">
              {devices.map((device) => {
                const summary = getDeviceSummary(device);
                return (
                  <div
                    key={device._id}
                    onClick={() => selectDevice(device._id)}
                    className={`bg-bg-panel rounded-lg p-3 cursor-pointer border transition-colors transition-transform duration-100 active:scale-[0.99] ${
                      device._id === selectedId
                        ? "border-accent-blue"
                        : "border-border-muted hover:border-border-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            device.status === "online"
                              ? "bg-accent-green"
                              : "bg-bg-hover"
                          }`}
                        />
                        <p className="text-text-primary font-semibold">
                          {device.name}
                        </p>
                      </div>
                      <span className="text-text-muted text-xs">
                        {timeAgo(device.lastSeenAt)}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs mt-0.5 ml-4">
                      {device.status === "online" ? "Online" : "Offline"}
                      {device.location && ` · ${device.location}`}
                    </p>
                    <p className="text-xs mt-1 ml-4 flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${summary.color}`}
                      />
                      <span className="text-text-muted">{summary.text}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* right pane */}
        <div
          className={`flex-1 ${mobileView === "list" ? "hidden lg:block" : ""}`}
        >
          {loading ? (
            <SkeletonPanel rows={3} />
          ) : (
            selectedDevice && (
              <>
                <button
                  onClick={() => setMobileView("list")}
                  className="lg:hidden text-text-muted text-sm mb-3"
                >
                  ← Back to devices
                </button>

                <div className="bg-bg-panel border border-border-muted rounded-xl p-6 flex flex-col gap-6 max-w-3xl">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-text-primary text-lg font-bold">
                        {selectedDevice.name}
                      </h2>
                      <Button icon={Plus} onClick={() => navigate("/publish")}>
                        Schedule
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-medium ${
                          selectedDevice.status === "online"
                            ? "border-accent-green/40 text-accent-green"
                            : "border-bg-hover text-text-muted"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedDevice.status === "online"
                              ? "bg-accent-green"
                              : "bg-text-muted"
                          }`}
                        />
                        {selectedDevice.status === "online"
                          ? "Online"
                          : "Offline"}
                      </span>
                      <span className="text-text-muted">
                        Last seen {timeAgo(selectedDevice.lastSeenAt)}
                        {selectedDevice.location &&
                          ` · ${selectedDevice.location}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-bg-hover">
                      <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wide">
                        Schedule
                      </h3>
                      <span className="text-text-muted text-xs">
                        {selectedDevice.assignments.length} assignment
                        {selectedDevice.assignments.length === 1 ? "" : "s"} ·
                        device local time
                      </span>
                    </div>

                    {selectedDevice.assignments.length === 0 ? (
                      <div className="bg-bg-primary border border-dashed border-border-muted hover:border-border-hover transition-colors rounded-lg p-8 flex flex-col items-center text-center gap-2">
                        <div className="bg-bg-hover rounded-md p-2.5">
                          <Calendar size={20} className="text-accent-blue" />
                        </div>
                        <p className="text-text-primary font-bold">
                          Nothing scheduled yet
                        </p>
                        <p className="text-text-muted text-sm max-w-sm">
                          {selectedDevice.name} is{" "}
                          {selectedDevice.status === "online"
                            ? "online"
                            : "offline"}{" "}
                          but has no assignments, so it's showing its default
                          content. Schedule a playlist to take over a time
                          window.
                        </p>
                        <Button
                          icon={Plus}
                          variant="outline"
                          onClick={() => navigate("/publish")}
                        >
                          Schedule first assignment
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {selectedDevice.assignments.map(
                          (assignment, index) => (
                            <div key={assignment._id} className="flex gap-3">
                              <div className="flex flex-col items-center w-3 flex-shrink-0 pt-5">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                    TIMELINE_DOT[
                                      getAssignmentStatus(
                                        assignment,
                                        selectedDevice,
                                      )
                                    ]
                                  }`}
                                />
                                {index <
                                  selectedDevice.assignments.length - 1 && (
                                  <span className="w-px flex-1 bg-bg-hover mt-1" />
                                )}
                              </div>
                              <div className="flex-1">
                                <AssignmentCard
                                  assignment={assignment}
                                  device={selectedDevice}
                                  onDeleteRequest={setDeleteTarget}
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Assignment"
        items={
          deleteTarget
            ? [
                {
                  id: deleteTarget._id,
                  name: deleteTarget.playlistId?.name ?? "this assignment",
                },
              ]
            : []
        }
        onConfirm={handleConfirmDeleteAssignment}
      />
    </div>
  );
}

export default Assignments;
