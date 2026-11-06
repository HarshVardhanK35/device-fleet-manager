import ConfirmDeleteModal from "../modals/ConfirmDeleteModal.jsx";

// "Delete message" for both sides: the app's own delete dialog, with the
// wording for feedback. `admin` changes the text. Sits above the message
// details (which are full-screen on a phone).
function ConfirmDeleteFeedback({ open, admin = false, onCancel, onConfirm }) {
  return (
    <ConfirmDeleteModal
      elevated
      open={open}
      onOpenChange={(o) => !o && onCancel()}
      title="Delete message"
      items={[{ id: "feedback", name: "This message" }]}
      description={
        admin
          ? "This message will be removed from the inbox and from the user's Feedback page. This action cannot be undone."
          : "This message hasn't been read yet. Deleting it does not give your slot back. This action cannot be undone."
      }
      confirmLabel="Delete message"
      onConfirm={onConfirm}
    />
  );
}

export default ConfirmDeleteFeedback;

// Used by: pages/Feedback.jsx, pages/AdminInbox.jsx.
