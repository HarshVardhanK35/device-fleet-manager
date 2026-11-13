import { useEffect } from "react";
import { Link } from "react-router-dom";

// Inter is self-hosted (only the weights the page uses) and loads with this page.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./help/help.css";
import HelpAnswer from "./help/HelpAnswer.jsx";
import { PageFooter, PageHeader } from "./help/PageChrome.jsx";
import { usePageTheme } from "./help/usePageTheme.js";
import { useLegalSections } from "./legal/useLegalSections.js";
import { LEGAL_DOCS, LEGAL_ORDER, LEGAL_UPDATED } from "./legal/legalContent.js";

// The Terms of Use, the Acceptable Use rules and the Privacy Policy (/terms, /acceptable-use, /privacy):
// one page for everyone, signed in or out, in the Help page's style. The text is in legal/legalContent.js.
//   doc  "terms" | "acceptable-use" | "privacy"
// Used by: App.jsx.
function Legal({ doc }) {
  const [theme, toggleTheme] = usePageTheme();
  const page = LEGAL_DOCS[doc];
  const sections = useLegalSections(doc);

  // arriving from a footer link keeps the scroll position of the page you came from
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [doc]);

  return (
    <div className="hp-root" data-theme={theme}>
      <PageHeader suffix={page.short} theme={theme} onToggleTheme={toggleTheme} />

      <div className="hp-container hp-hero">
        <h1 className="hp-hero__title">{page.title}</h1>
        <p className="hp-hero__intro hp-legal__intro">{page.intro}</p>
        <p className="hp-legal__updated">Last updated {LEGAL_UPDATED}</p>
        <nav className="hp-legal__tabs" aria-label="Legal pages">
          {LEGAL_ORDER.map((id) => (
            <Link
              key={id}
              to={LEGAL_DOCS[id].path}
              className={`hp-legal__tab${id === doc ? " is-active" : ""}`}
              aria-current={id === doc ? "page" : undefined}
            >
              {LEGAL_DOCS[id].title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="hp-container hp-body">
        <nav className="hp-toc" aria-label="On this page">
          <div className="hp-toc__label">On this page</div>
          {page.sections.map((section, index) => (
            <button
              key={section.heading}
              type="button"
              className={`hp-toc__item${sections.active === index ? " is-active" : ""}`}
              aria-current={sections.active === index ? "true" : undefined}
              onClick={() => sections.goTo(index)}
            >
              <span>
                {index + 1}. {section.heading}
              </span>
            </button>
          ))}
        </nav>

        <main className="hp-main hp-legal">
          {page.sections.map((section, index) => (
            <section key={section.heading} data-legal-sec={index} aria-labelledby={`legal-${index}`}>
              <h2 className="hp-legal__heading" id={`legal-${index}`}>
                <span className="hp-legal__number">{index + 1}.</span>
                {section.heading}
              </h2>
              <div className="hp-legal__body">
                <HelpAnswer blocks={section.blocks} />
              </div>
            </section>
          ))}
        </main>
      </div>

      <PageFooter />
    </div>
  );
}

export default Legal;
