import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getAdminUsers, deleteAdminUser } from "../api/admin.js";
import { useAuth } from "../context/useAuth.js";
import { useMediaQuery } from "../hooks/useCompactLayout.js";
import ContentSearchInput from "../components/content/ContentSearchInput.jsx";
import DeleteUserDialog from "../components/admin/DeleteUserDialog.jsx";
import UserDetails from "../components/admin/UserDetails.jsx";
import UserList from "../components/admin/UserList.jsx";
import RefreshButton from "../components/ui/RefreshButton.jsx";

const PAGE_SIZE = 20;

async function requestUsers({ page, search }) {
  const res = await getAdminUsers({ page, limit: PAGE_SIZE, search });
  if (!Array.isArray(res?.users)) throw new Error(res?.message || "Could not load users");
  return res;
}

// Static placeholder rows (no shimmer) while a page loads.
function SkeletonRows() {
  return (
    <div className="flex flex-col gap-1.5" aria-label="Loading users">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="grid content-center gap-2 min-h-[108px] @xl:min-h-[60px] px-4 bg-bg-panel rounded-xl @xl:rounded-[10px]">
          <span className="h-[11px] rounded-md bg-border-muted/70" style={{ width: 110 + ((i * 37) % 90) }} />
          <span className="h-[9px] rounded-md bg-border-muted/70" style={{ width: 170 + ((i * 53) % 110) }} />
        </div>
      ))}
    </div>
  );
}

function Message({ title, body, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="text-lg font-semibold text-text-primary [overflow-wrap:anywhere]">{title}</div>
      <div className="max-w-[340px] text-sm text-text-muted">{body}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 h-11 xl:h-9 px-5 rounded-full bg-[#1f6feb] text-white text-sm font-semibold hover:brightness-110"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function PagerButton({ disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 h-11 xl:h-9 px-3.5 rounded-full border border-border-muted text-[13px] text-text-primary hover:bg-bg-panel disabled:opacity-45 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

function AdminUsers() {
  const { user: me } = useAuth();
  const sidePanel = useMediaQuery("(min-width: 1280px)");
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search waits for a pause in typing and always starts again at page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // Fetch the current page (again whenever `reload` is bumped: Retry, delete).
  useEffect(() => {
    let cancelled = false;
    requestUsers({ page, search })
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, search, reload]);

  function retry() {
    setLoading(true);
    setReload((n) => n + 1);
  }

  async function refresh() {
    try {
      setData(await requestUsers({ page, search }));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }

  const openUser = data.users.find((u) => u?._id === openId) || null;
  const openUserId = openUser?._id;

  async function deleteUser() {
    if (!openUserId) return;
    const res = await deleteAdminUser(openUserId);
    if (res?.message && !/deleted/i.test(res.message)) throw new Error(res.message);
    setDeleting(false);
    setOpenId(null);
    // Last user on a later page gone: step back a page.
    if (data.users.length === 1 && page > 1) setPage((p) => p - 1);
    setReload((n) => n + 1);
  }

  const showList = !loading && !failed && data.users.length > 0;

  const details = openUser && (
    <UserDetails
      key={openUserId}
      user={openUser}
      fill={sidePanel}
      isSelf={openUserId === me?.id}
      onClose={() => setOpenId(null)}
      onDelete={() => setDeleting(true)}
    />
  );

  return (
    <div className="@container mx-auto max-w-[1400px]">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="m-0 flex items-baseline gap-2.5 text-2xl @xl:text-[28px] font-semibold leading-tight tracking-tight text-text-primary">
                Users
                {!loading && !failed && (
                  <span className="text-base font-medium tabular-nums text-text-muted">{data.total}</span>
                )}
              </h1>
              <p className="mt-1 mb-0 text-sm text-text-muted">Everyone with a CastWise account</p>
            </div>
            <RefreshButton onRefresh={refresh} />
          </div>

          <div className="flex my-5">
            <ContentSearchInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name or email"
              alwaysBar
              className="md:flex-none md:w-1/2"
            />
          </div>

          {loading ? (
            <SkeletonRows />
          ) : failed ? (
            <Message
              title="Couldn't load users"
              body="Something went wrong while fetching accounts. Try again."
              onRetry={retry}
            />
          ) : data.users.length === 0 ? (
            search ? (
              <Message title={`No users match '${search}'`} body="Try a different name or email." />
            ) : (
              <Message title="No users yet" body="Accounts appear here as soon as someone signs up." />
            )
          ) : (
            <UserList users={data.users} selfId={me?.id} selectedId={openId} onOpen={(u) => setOpenId(u._id)} />
          )}

          {showList && (
            <div className="flex items-center gap-3 pt-3.5 pb-2">
              <span className="flex-1" />
              <PagerButton disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={14} />
                Prev
              </PagerButton>
              <span className="text-[13px] whitespace-nowrap text-text-primary">
                Page {data.page} of {data.pages}
              </span>
              <PagerButton disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Next
                <ChevronRight size={14} />
              </PagerButton>
            </div>
          )}
        </div>

      </div>

      {sidePanel && openUser && (
        <>
          <div aria-hidden="true" onClick={() => setOpenId(null)} className="fixed inset-0 z-20" />
          <aside className="cw-panel-in fixed top-[72px] right-4 bottom-4 z-30 w-[400px] flex flex-col overflow-hidden bg-bg-panel border border-border-muted rounded-2xl shadow-2xl">
            {details}
          </aside>
        </>
      )}

      {/* Below that: a centred modal over a dimmed, blurred page. */}
      {!sidePanel && openUser && (
        <>
          <div aria-hidden="true" onClick={() => setOpenId(null)} className="cw-scrim-in fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" />
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
            <div
              role="dialog"
              aria-label="User details"
              className="cw-pop-in pointer-events-auto w-full max-w-[480px] max-h-full flex flex-col overflow-hidden bg-bg-panel border border-border-muted rounded-2xl shadow-2xl"
            >
              {details}
            </div>
          </div>
        </>
      )}

      {deleting && openUser && (
        <DeleteUserDialog user={openUser} onCancel={() => setDeleting(false)} onConfirm={deleteUser} />
      )}
    </div>
  );
}

export default AdminUsers;

// Admin-only Users page (/admin/users), from the Claude Design "Index"
// package: searchable, paginated list of every account (20 per page); clicking
// one opens its details and screens (names and status only) in a side panel
// (xl and up) or a modal, with Delete user behind a type-the-email confirm.
// Used by: App.jsx (AdminPage).
