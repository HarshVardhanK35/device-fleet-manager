import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Moon, Search, Sun, X } from "lucide-react";

// Inter is self-hosted (only the weights the page uses) and loads with this page.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./help/help.css";
import Logo from "../components/layout/Logo.jsx";
import { useAuth } from "../context/useAuth.js";
import HelpQuestion from "./help/HelpQuestion.jsx";
import { CopyEmail, RichText } from "./help/HelpAnswer.jsx";
import { HELP_CONTENT, HELP_EMAIL, answerText } from "./help/helpContent.js";
import { HELP_ICONS } from "./help/helpIcons.js";
import { useHelpPage } from "./help/useHelpPage.js";
import { useLandingTheme } from "./landing/useLandingTheme.js";

const BODY_BG = { dark: "#0d1117", light: "#ffffff" };

// The questions and answers as FAQPage data, so a search engine can show them.
const FAQ_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HELP_CONTENT.flatMap((section) => section.questions).map((question) => ({
    "@type": "Question",
    name: question.q,
    acceptedAnswer: { "@type": "Answer", text: answerText(question) },
  })),
});

function SectionIcon({ name, size }) {
  const Icon = HELP_ICONS[name];
  return <Icon size={size} aria-hidden="true" />;
}

// The Help page at /help: one page for everyone, signed in or out, with its own slim header and
// footer (no app shell). Reference: z-CastWise-Help (SPEC.md, design A "Calm cards"). Dark or light:
// the landing page's saved choice, with its own switch in the header.
// Used by: App.jsx.
function Help() {
  const { token } = useAuth();
  const help = useHelpPage();
  // The same saved choice as the landing page's switch (else the system's), so the two match.
  const [theme, toggleTheme] = useLandingTheme();
  const searching = help.words.length > 0;

  // The page background under the overscroll follows the theme; undone on leave.
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = BODY_BG[theme];
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, [theme]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = FAQ_JSON_LD;
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="hp-root" data-theme={theme}>
      <header className="hp-header">
        <div className="hp-container hp-header__inner">
          <Link className="hp-brand" to="/">
            <Logo size={28} />
            <span>CastWise</span>
            <span className="hp-brand__suffix">Help</span>
          </Link>
          <nav className="hp-header__nav" aria-label="Account">
            <button
              type="button"
              className="hp-icon-btn"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
            <Link className="hp-back" to="/">
              <ArrowLeft size={15} aria-hidden="true" />
              <span className="hp-back__long">Back to CastWise</span>
              <span className="hp-back__short">Back</span>
            </Link>
            {!token && (
              <Link className="hp-signin" to="/login">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="hp-container hp-hero">
        <h1 className="hp-hero__title">How can we help?</h1>
        <p className="hp-hero__intro">
          Answers about pairing screens, uploading content, building playlists and publishing them on a schedule.
        </p>
        <div className="hp-search">
          <Search className="hp-search__icon" size={18} aria-hidden="true" />
          <input
            className="hp-search__input"
            type="text"
            autoComplete="off"
            placeholder="Search questions and answers"
            aria-label="Search help"
            aria-describedby="hp-count"
            value={help.query}
            onChange={(e) => help.changeQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && help.query) {
                e.preventDefault();
                help.changeQuery("");
              }
            }}
          />
          {searching && (
            <button
              type="button"
              className="hp-search__clear"
              aria-label="Clear search"
              onClick={() => help.changeQuery("")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="hp-search__count" id="hp-count" aria-live="polite" hidden={!searching}>
          {help.total === 0
            ? "No matches"
            : `${help.total} ${help.total === 1 ? "answer matches" : "answers match"} “${help.query.trim()}”`}
        </p>
      </div>

      <div className="hp-container hp-body">
        <nav className="hp-toc" aria-label="Sections">
          <div className="hp-toc__label">Sections</div>
          {HELP_CONTENT.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`hp-toc__item${help.active === section.id ? " is-active" : ""}`}
              aria-current={help.active === section.id ? "true" : undefined}
              onClick={() => help.goTo(section.id)}
            >
              <SectionIcon name={section.icon} size={16} />
              <span>{section.title}</span>
            </button>
          ))}
        </nav>

        <main className="hp-main">
          <div className="hp-chips">
            <nav className="hp-chips__row" aria-label="Sections">
              {HELP_CONTENT.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`hp-chip${help.active === section.id ? " is-active" : ""}`}
                  aria-current={help.active === section.id ? "true" : undefined}
                  onClick={() => help.goTo(section.id)}
                >
                  <SectionIcon name={section.icon} size={14} />
                  {section.title}
                </button>
              ))}
            </nav>
          </div>

          {HELP_CONTENT.map((section) => (
            <section
              key={section.id}
              className="hp-section"
              data-hp-sec={section.id}
              aria-labelledby={`sec-${section.id}`}
              hidden={!section.questions.some((q) => help.shown.has(q.id))}
            >
              <div className="hp-section__head">
                <span className="hp-section__icon" aria-hidden="true">
                  <SectionIcon name={section.icon} size={17} />
                </span>
                <h2 className="hp-section__title" id={`sec-${section.id}`}>
                  {section.title}
                </h2>
              </div>
              <div className="hp-qlist">
                {section.questions.map((question) => (
                  <div key={question.id} hidden={!help.shown.has(question.id)}>
                    <HelpQuestion
                      question={question}
                      open={help.openId === question.id}
                      linked={help.linkedId === question.id}
                      copied={help.copiedId === question.id}
                      onToggle={() => help.toggle(question.id)}
                      onCopy={() => help.copyLink(question.id)}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="hp-empty" hidden={help.total > 0}>
            <span className="hp-empty__icon" aria-hidden="true">
              <Search size={20} />
            </span>
            <h2 className="hp-empty__title">No answers found</h2>
            <p className="hp-empty__text">
              Try other words, or email <RichText text={HELP_EMAIL} />. We are here every day, 8 AM to 6 PM IST.
            </p>
            <button type="button" className="hp-btn-secondary" onClick={() => help.changeQuery("")}>
              Clear search
            </button>
          </div>

          <div className="hp-stuck">
            <div className="hp-stuck__main">
              <span className="hp-stuck__icon" aria-hidden="true">
                <Mail size={21} />
              </span>
              <div>
                <h2 className="hp-stuck__title">Still stuck?</h2>
                <p className="hp-stuck__line">
                  Email <RichText text={HELP_EMAIL} />. We are here every day, 8 AM to 6 PM IST.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="hp-footer">
        <div className="hp-container hp-footer__inner">
          <span className="hp-footer__brand">
            <Logo size={18} />
            &copy; {new Date().getFullYear()} CastWise
          </span>
          <nav className="hp-footer__links" aria-label="Footer">
            <Link to="/">Home</Link>
            <CopyEmail />
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default Help;
