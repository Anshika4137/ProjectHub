import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const Arrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="landing-arrow">
    <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="landing-check">
    <path d="m5 10 3.1 3.1L15.5 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const ProductPreview = ({ compact = false }) => (
  <div className={`product-preview ${compact ? 'product-preview--compact' : ''}`} aria-label="Project board preview">
    <div className="preview-toolbar">
      <div className="preview-brand"><span className="preview-mark">P</span><span>ProjectHub</span></div>
      <div className="preview-toolbar-actions"><span className="preview-search">Search</span><span className="preview-avatar preview-avatar--violet">A</span></div>
    </div>
    <div className="preview-content">
      <aside className="preview-sidebar">
        <span className="preview-sidebar-label">Workspace</span>
        <span className="preview-sidebar-item preview-sidebar-item--active">Overview</span>
        <span className="preview-sidebar-item">My tasks</span>
        <span className="preview-sidebar-item">Projects</span>
        <span className="preview-sidebar-label preview-sidebar-label--space">Teams</span>
        <span className="preview-sidebar-item">Product</span>
      </aside>
      <section className="preview-main">
        <div className="preview-heading"><div><span className="preview-kicker">Product design</span><h3>Website refresh</h3></div><button type="button" className="preview-add">+ Add task</button></div>
        <div className="preview-progress"><span>Project progress</span><strong>68%</strong><div><i /></div></div>
        <div className="preview-columns">
          <div className="preview-column"><div className="preview-column-title"><span>To do</span><b>2</b></div><article className="preview-task"><span className="preview-tag preview-tag--purple">Design</span><strong>Landing page system</strong><small><span className="preview-avatar preview-avatar--small preview-avatar--peach">M</span> Due Tue</small></article><article className="preview-task preview-task--muted"><strong>Review content brief</strong><small>Due Wed</small></article></div>
          <div className="preview-column"><div className="preview-column-title"><span>In progress</span><b>3</b></div><article className="preview-task"><span className="preview-tag preview-tag--orange">Priority</span><strong>Build component library</strong><small><span className="preview-avatars"><span className="preview-avatar preview-avatar--small preview-avatar--blue">K</span><span className="preview-avatar preview-avatar--small preview-avatar--green">J</span></span> 2 collaborators</small></article><article className="preview-task preview-task--muted"><strong>Map launch flow</strong><small>Due Fri</small></article></div>
          <div className="preview-column preview-column--done"><div className="preview-column-title"><span>Done</span><b>4</b></div><article className="preview-task"><span className="preview-tag preview-tag--green">Complete</span><strong>Research user needs</strong><small>Completed today</small></article></div>
        </div>
      </section>
    </div>
  </div>
);

const features = [
  { number: '01', title: 'Projects with clarity', text: 'Bring goals, context, and the people doing the work into one focused home.', accent: 'purple' },
  { number: '02', title: 'Tasks that move work forward', text: 'Turn intent into momentum with clear ownership, due dates, priorities, and a board your team understands at a glance.', accent: 'orange' },
  { number: '03', title: 'Collaboration in the flow', text: 'Keep conversations attached to the work, so decisions stay visible and everyone can move with confidence.', accent: 'blue' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({ x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 });
  };

  return (
    <main className="landing-shell">
      <header className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <Link to="/" className="landing-logo" aria-label="ProjectHub home"><span className="landing-logo-mark">P</span><span>ProjectHub</span></Link>
        <button type="button" className="landing-menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav className={`landing-links ${menuOpen ? 'landing-links--open' : ''}`} aria-label="Main navigation">
          <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="landing-nav-cta" onClick={() => setMenuOpen(false)}>Get started <Arrow /></Link>
        </nav>
      </header>

      <section className="landing-hero" onPointerMove={handlePointerMove} onPointerLeave={() => setPointer({ x: 0, y: 0 })}>
        <div className="landing-orb landing-orb--violet" /><div className="landing-orb landing-orb--peach" /><div className="landing-grid" />
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> A more focused way to work</p>
          <h1>Plan together.<br /><em>Ship with clarity.</em></h1>
          <p className="landing-lede">ProjectHub gives your team one calm, connected place to turn ambitious ideas into finished work.</p>
          <div className="landing-hero-actions"><Link to="/register" className="landing-primary-button">Get started free <Arrow /></Link><a href="#product" className="landing-secondary-button">Explore ProjectHub <span>↓</span></a></div>
          <div className="landing-proof"><div className="landing-proof-avatars"><span>J</span><span>M</span><span>A</span><span>R</span></div><p>Designed for teams that want less status-chasing and more progress.</p></div>
        </div>
        <div className="landing-hero-visual" style={{ '--tilt-x': `${pointer.x * 3}deg`, '--tilt-y': `${pointer.y * -3}deg` }}>
          <div className="landing-float-card landing-float-card--progress"><span>Weekly progress</span><strong>+24%</strong><svg viewBox="0 0 120 36" aria-hidden="true"><path d="M1 31C20 31 19 25 34 25s11-12 28-12 14 12 28 7 17-16 29-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></div>
          <div className="landing-float-card landing-float-card--team"><div className="landing-mini-avatars"><span>A</span><span>J</span><span>K</span></div><p><b>3 teammates</b><br />in sync today</p></div>
          <ProductPreview />
          <div className="landing-float-card landing-float-card--done"><span className="landing-done-icon"><Check /></span><p><b>Launch checklist</b><br />7 tasks completed</p></div>
        </div>
      </section>

      <section id="product" className="landing-intro landing-section">
        <p className="landing-section-label">ONE PLACE, REAL MOMENTUM</p>
        <div className="landing-section-heading"><h2>Everything your team needs to make meaningful progress.</h2><p>ProjectHub keeps the important work visible, the next step obvious, and your team connected without adding noise.</p></div>
        <div className="landing-intro-preview"><ProductPreview compact /><div className="landing-preview-note"><span className="landing-note-dot" /><p><b>Built around real work.</b> Projects, tasks, people, and progress are designed to live together.</p></div></div>
      </section>

      <section id="features" className="landing-features landing-section">
        <div className="landing-feature-header"><div><p className="landing-section-label">BUILT FOR FOCUS</p><h2>Make every project<br />feel more manageable.</h2></div><p>Thoughtful tools and a clear visual system give your team the confidence to move from plans to done.</p></div>
        <div className="landing-feature-grid">{features.map((feature) => <article className={`landing-feature-card landing-feature-card--${feature.accent}`} key={feature.number}><span className="landing-feature-number">{feature.number}</span><div className="landing-feature-icon">{feature.number === '01' ? '◫' : feature.number === '02' ? '✓' : '↗'}</div><h3>{feature.title}</h3><p>{feature.text}</p><span className="landing-feature-line" /></article>)}</div>
      </section>

      <section id="how-it-works" className="landing-steps landing-section">
        <div className="landing-steps-copy"><p className="landing-section-label">HOW IT WORKS</p><h2>Less overhead.<br /><em>More of the work.</em></h2><p>ProjectHub is intentionally simple to adopt, so your team can settle into a better rhythm from day one.</p><Link to="/register" className="landing-text-link">Start your workspace <Arrow /></Link></div>
        <ol className="landing-step-list"><li><span>01</span><div><h3>Create a project</h3><p>Give your work a clear home with the right context.</p></div></li><li><span>02</span><div><h3>Organize the next steps</h3><p>Turn big goals into visible, owned tasks.</p></div></li><li><span>03</span><div><h3>Collaborate and deliver</h3><p>Keep updates, decisions, and progress together.</p></div></li></ol>
      </section>

      <section className="landing-metrics"><div><strong>One shared view</strong><span>of the work that matters</span></div><div><strong>Three simple stages</strong><span>from to-do to done</span></div><div><strong>Built for teams</strong><span>that value clarity</span></div></section>

      <section className="landing-final-cta"><div className="landing-final-glow" /><p className="landing-section-label">READY WHEN YOU ARE</p><h2>Bring your projects<br />together.</h2><p>Start organizing the work your team is ready to ship.</p><Link to="/register" className="landing-primary-button landing-primary-button--light">Get started free <Arrow /></Link></section>

      <footer className="landing-footer"><Link to="/" className="landing-logo"><span className="landing-logo-mark">P</span><span>ProjectHub</span></Link><div className="landing-footer-links"><a href="#product">Product</a><a href="#features">Features</a><Link to="/login">Login</Link><Link to="/register">Register</Link></div><p>© {new Date().getFullYear()} ProjectHub. Built for better teamwork.</p></footer>
    </main>
  );
}
