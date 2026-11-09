import { useStageCss } from "../../../utils/screens/stageCss.js";

// The small "Unpair this screen" link under the tap and stopped screens.
function UnpairLink({ onClick }) {
  const css = useStageCss();
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        fontSize: css("clamp(13px,2.4cqmin,120px)"),
        color: "var(--color-neutral-400)",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    >
      Unpair this screen
    </button>
  );
}

export default UnpairLink;

// Used by: components/screens/stage/TapScreen.jsx, StoppedScreen.jsx.
