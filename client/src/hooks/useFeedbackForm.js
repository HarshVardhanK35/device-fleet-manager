import { useState } from "react";

import { createFeedback } from "../api/feedback.js";
import { useAsyncAction } from "./useAsyncAction.js";
import { notifyFeedbackChanged } from "./useFeedbackIndicator.js";
import { FEEDBACK_MESSAGE_MAX } from "../utils/feedback/feedbackMeta.js";
import { useToast } from "../context/useToast.js";

// The state and the Send action of the New feedback form, shared by the modal
// (tablet and phone) and the inline card on desktop. Both draw their fields
// with components/feedback/FeedbackFields.jsx.
//   remaining / limit  how many of the account's messages are left (from the server)
//   onSent             called after a message was saved
export function useFeedbackForm({ remaining, limit, onSent }) {
  const toast = useToast();
  const [type, setTypeValue] = useState("");
  const [message, setMessageValue] = useState("");
  const [typeErr, setTypeErr] = useState(false);
  const [msgErr, setMsgErr] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [justSent, setJustSent] = useState(false);

  const blocked = remaining <= 0;
  const atLimit = message.length >= FEEDBACK_MESSAGE_MAX;
  const note = atLimit ? "You've reached the 500 character limit." : msgErr ? "Write a message." : "";

  function setType(value) {
    setTypeValue(value);
    setTypeErr(false);
    setJustSent(false);
  }

  function setMessage(value) {
    setMessageValue(value);
    setMsgErr(false);
    setJustSent(false);
  }

  function reset() {
    setTypeValue("");
    setMessageValue("");
    setTypeErr(false);
    setMsgErr(false);
    setServerErr("");
  }

  const [send, sending] = useAsyncAction(async () => {
    if (blocked) return;
    const noType = !type;
    const noMessage = !message.trim();
    setTypeErr(noType);
    setMsgErr(noMessage);
    if (noType || noMessage) return;
    setServerErr("");
    const res = await createFeedback({ type, message: message.trim() });
    if (!res?._id) {
      setServerErr(res?.message || "Couldn't send your message. Try again.");
      return;
    }
    reset();
    setJustSent(true);
    notifyFeedbackChanged();
    onSent();
    toast("Feedback sent");
  });

  return {
    type, setType, message, setMessage, typeErr, msgErr, serverErr,
    blocked, atLimit, note, remaining, limit, justSent, reset, send, sending,
  };
}
