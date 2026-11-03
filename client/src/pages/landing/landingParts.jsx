import Logo from "../../components/layout/Logo.jsx";

// Small pieces shared by the landing sections.
// Used by: LandingHeader.jsx, LandingFooter.jsx, LandingSections.jsx.

export function BrandMark({ size = 28 }) {
  return <Logo size={size} />;
}

export function SectionHead({ eyebrow, title, id, lead, wide }) {
  return (
    <div className={`section-head${wide ? " section-head--wide" : ""}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="h2" id={id}>
        {title}
      </h2>
      <p className="lead">{lead}</p>
    </div>
  );
}
