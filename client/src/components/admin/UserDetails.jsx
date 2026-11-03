import { useEffect, useState } from "react";

import { getAdminUserScreens } from "../../api/admin.js";
import CancelButton from "../ui/CancelButton.jsx";
import { timeAgo } from "../../utils/timeAgo.js";
import { RoleBadge, VerifiedBadge } from "./UserBadges.jsx";
import { fullName, formatJoined } from "./userFormat.js";

function ScreenItem({ screen }) {
  const online = screen.status === "online";
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 bg-bg-primary border border-border-muted rounded-[10px]">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-text-primary">{screen.name}</div>
        <div className="text-xs text-text-muted">last seen {timeAgo(screen.lastSeenAt)}</div>
      </div>
      <span className={`flex-none inline-flex items-center gap-1.5 text-[13px] ${online ? "text-accent-green" : "text-text-muted"}`}>
        <span
          className={`w-2 h-2 rounded-full ${
            online ? "bg-accent-green shadow-[0_0_0_3px_rgba(63,185,80,0.2)]" : "bg-text-muted"
          }`}
        />
        {online ? "Online" : "Offline"}
      </span>
    </div>
  );
}

// One user's details: name, username, email, role / verified / joined and the
// screens (names and status only). `onDelete` opens the confirm dialog; the
// admin's own account can't be deleted, so its button explains why instead.
function UserDetails({ user, isSelf, fill = false, onClose, onDelete }) {
  const [screens, setScreens] = useState(null);
  const [tip, setTip] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminUserScreens(user._id)
      .then((data) => !cancelled && setScreens(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setScreens([]));
    return () => {
      cancelled = true;
    };
  }, [user._id]);

  return (
    <>
      <div className="flex justify-end px-3 pt-3">
        <CancelButton onClick={onClose} title="Close" />
      </div>

      <div className={`min-h-0 overflow-y-auto px-6 pb-6 ${fill ? "flex-1" : ""}`}>
        <h2 className="m-0 text-[22px] font-semibold leading-tight tracking-tight text-text-primary [overflow-wrap:anywhere]">
          {fullName(user)}
        </h2>
        {user.username && <div className="mt-1 text-[13px] text-text-muted">@{user.username}</div>}
        <div className="mt-1 text-sm text-text-muted [overflow-wrap:anywhere]">{user.email}</div>

        <div className="grid grid-cols-3 gap-3 mt-5 py-3.5 border-y border-border-muted">
          <div className="grid gap-1.5 justify-items-start">
            <span className="text-xs text-text-muted">Role</span>
            <RoleBadge role={user.role} />
          </div>
          <div className="grid gap-1.5 justify-items-start">
            <span className="text-xs text-text-muted">Verified</span>
            <VerifiedBadge verified={user.emailVerified} short />
          </div>
          <div className="grid gap-1.5 justify-items-start">
            <span className="text-xs text-text-muted">Joined</span>
            <span className="text-sm leading-[22px] whitespace-nowrap text-text-primary">{formatJoined(user.createdAt)}</span>
          </div>
        </div>

        <h3 className="mt-5 mb-2.5 text-sm font-semibold text-text-primary">
          Screens ({screens ? screens.length : user.screenCount})
        </h3>
        {!screens ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: Math.min(user.screenCount, 3) || 1 }, (_, i) => (
              <div key={i} className="skeleton h-[58px] rounded-[10px]" />
            ))}
          </div>
        ) : screens.length === 0 ? (
          <div className="px-3.5 py-5 text-center text-sm text-text-muted bg-bg-primary border border-border-muted rounded-[10px]">
            No screens yet
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {screens.map((s) => (
              <ScreenItem key={s._id} screen={s} />
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pt-4 pb-6">
        <div
          className="relative flex"
          onMouseEnter={() => isSelf && setTip(true)}
          onMouseLeave={() => setTip(false)}
        >
          <button
            type="button"
            aria-disabled={isSelf || undefined}
            aria-describedby={isSelf ? "self-tip" : undefined}
            onClick={() => (isSelf ? setTip(true) : onDelete())}
            onFocus={() => isSelf && setTip(true)}
            onBlur={() => setTip(false)}
            className={`w-full h-12 xl:h-10 rounded-full bg-accent-red text-white text-sm font-semibold transition-[filter,opacity] ${
              isSelf ? "opacity-45 cursor-not-allowed" : "hover:brightness-110 active:brightness-90"
            }`}
          >
            Delete user
          </button>
          {isSelf && tip && (
            <span
              id="self-tip"
              role="tooltip"
              className="absolute left-1/2 bottom-[calc(100%+10px)] -translate-x-1/2 px-3 py-[7px] rounded-lg bg-text-primary text-bg-primary text-xs whitespace-nowrap shadow-lg"
            >
              You can&apos;t delete your own account
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default UserDetails;

// Contents of the user details panel / modal (the frame is in
// pages/AdminUsers.jsx). Used by: pages/AdminUsers.jsx.
