// Three small dots that light up one at a time, over and over: "still trying".
// Takes the colour of the surrounding text. Keyframes in index.css; it keeps
// moving even with reduced motion, because it is feedback that work continues.
// Used by: error/ConnectionBanner.jsx.
function ThreeDots({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="cw-dot h-1.5 w-1.5 rounded-full bg-current"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
    </span>
  );
}

export default ThreeDots;
