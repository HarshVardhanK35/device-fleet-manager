import { RoleBadge, VerifiedBadge } from "./UserBadges.jsx";
import { displayUsername, formatJoined } from "./userFormat.js";

// Table columns by the page's own width (it sits beside the side navbar, so
// container widths, not the window, decide): cards below 36rem, a compact
// table from there, the roomy table from 56rem.
const COLUMNS =
  "@xl:grid-cols-[minmax(0,1fr)_72px_124px_104px_52px] @4xl:grid-cols-[minmax(0,1fr)_100px_136px_128px_80px]";

function screensLabel(n) {
  return n === 0 ? "None" : String(n);
}

function UserRow({ user, isSelf, selected, onOpen }) {
  const n = user.screenCount;
  return (
    <button
      type="button"
      onClick={() => onOpen(user)}
      aria-selected={selected}
      className={`hidden @xl:grid ${COLUMNS} items-center gap-4 min-h-16 @4xl:min-h-[60px] px-4 py-2 text-left bg-bg-panel border rounded-[10px] transition-[border-color,transform] duration-150 hover:translate-x-0.5 ${
        selected ? "border-accent-blue" : "border-transparent hover:border-border-muted"
      }`}
    >
      <span className="min-w-0">
        <span className="flex items-baseline gap-1.5 min-w-0">
          <span className="text-[15px] font-semibold truncate text-text-primary">{displayUsername(user)}</span>
          {isSelf && <span className="text-xs text-text-muted flex-none">· you</span>}
        </span>
        <span className="block text-[13px] text-text-muted [overflow-wrap:anywhere]">{user.email}</span>
      </span>
      <span><RoleBadge role={user.role} /></span>
      <span><VerifiedBadge verified={user.emailVerified} /></span>
      <span className="text-[13px] text-text-muted whitespace-nowrap">{formatJoined(user.createdAt)}</span>
      <span className={`text-[13px] text-right whitespace-nowrap ${n ? "text-text-primary" : "text-text-muted"}`}>
        {screensLabel(n)}
      </span>
    </button>
  );
}

function UserCard({ user, isSelf, selected, onOpen }) {
  const n = user.screenCount;
  return (
    <button
      type="button"
      onClick={() => onOpen(user)}
      aria-selected={selected}
      className={`@xl:hidden grid gap-3 p-4 text-left bg-bg-panel border rounded-xl active:scale-[.99] transition-transform ${
        selected ? "border-accent-blue" : "border-border-muted"
      }`}
    >
      <span className="flex items-start gap-3">
        <span className="flex-1 min-w-0">
          <span className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base font-semibold truncate text-text-primary">{displayUsername(user)}</span>
            {isSelf && <span className="text-xs text-text-muted flex-none">· you</span>}
          </span>
          <span className="block text-[13px] text-text-muted [overflow-wrap:anywhere]">{user.email}</span>
        </span>
        <span className={`flex-none text-[13px] ${n ? "text-text-primary" : "text-text-muted"}`}>
          {n === 1 ? "1 screen" : `${n} screens`}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <RoleBadge role={user.role} />
        <VerifiedBadge verified={user.emailVerified} />
        <span className="ml-auto text-xs text-text-muted whitespace-nowrap">Joined {formatJoined(user.createdAt)}</span>
      </span>
    </button>
  );
}

function UserList({ users, selfId, selectedId, onOpen }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`hidden @xl:grid ${COLUMNS} gap-4 px-[17px] pb-2 text-xs text-text-muted`}>
        <span>Username</span>
        <span>Role</span>
        <span>Verified</span>
        <span>Joined</span>
        <span className="text-right">Screens</span>
      </div>
      {users.map((u) => (
        <div key={u._id} className="contents">
          <UserRow user={u} isSelf={u._id === selfId} selected={u._id === selectedId} onOpen={onOpen} />
          <UserCard user={u} isSelf={u._id === selfId} selected={u._id === selectedId} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
}

export default UserList;

// The users list: row cards on a wide page, stacked cards on a narrow one.
// Used by: pages/AdminUsers.jsx.
