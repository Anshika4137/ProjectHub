import { useEffect, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import ProjectHubBrand from '../components/ProjectHubBrand';
import dashboardDemo from '../assets/projecthub-dashboard-demo.png';
import commentsDemo from '../assets/projecthub-comments-demo.png';
import boardDemo from '../assets/projecthub-board-scroll-demo.png';
import '../styles/landing.css';
import '../styles/landing-art.css';

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

const ProductPreview = ({ compact = false, source, alt }) => (
  <figure className={`product-preview product-preview--screenshot ${compact ? 'product-preview--compact' : ''}`}>
    <img src={source} alt={alt} />
  </figure>
);

const features = [
  { number: '01', title: 'Projects with clarity', text: 'Bring goals, context, and the people doing the work into one focused home.', accent: 'purple' },
  { number: '02', title: 'Tasks that move work forward', text: 'Turn intent into momentum with clear ownership, due dates, priorities, and a board your team understands at a glance.', accent: 'orange' },
  { number: '03', title: 'Collaboration in the flow', text: 'Keep conversations attached to the work, so decisions stay visible and everyone can move with confidence.', accent: 'blue' },
];

const progressWords = [
  { text: 'Everything', className: 'landing-progress-word--one' },
  { text: 'your team', className: 'landing-progress-word--two' },
  { text: 'needs to make', className: 'landing-progress-word--three' },
  { text: 'meaningful progress.', className: 'landing-progress-word--four' },
];

const boardWords = ['A board', 'that makes', 'progress visible.'];
const technologies = ['React', 'Vite', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'JWT'];

function FloatingFeatureCard({ feature, index, progress, reduceMotion }) {
  const y = useTransform(progress, [0, 0.5, 1], [26 - index * 10, 0, -22 + index * 10]);
  const x = useTransform(progress, [0, 1], [index === 1 ? 0 : index === 0 ? -10 : 10, index === 1 ? 0 : index === 0 ? 9 : -9]);
  const rotate = useTransform(progress, [0, 1], [index === 1 ? 0 : index === 0 ? -1.4 : 1.4, index === 1 ? 0 : index === 0 ? 1.2 : -1.2]);

  return <Motion.article className={`landing-feature-card landing-feature-card--${feature.accent}`} whileHover={reduceMotion ? undefined : { y: -9, scale: 1.025, rotateX: -2, rotateY: 2, transition: { duration: 0.22, ease: 'easeOut' } }} style={reduceMotion ? undefined : { y, x, rotate }} variants={{ hidden: { opacity: 0, scale: 0.88, rotateX: 9, rotateY: -5 }, visible: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, transition: { duration: reduceMotion ? 0.01 : 0.62, ease: [0.22, 1, 0.36, 1] } } }}><span className="landing-feature-number">{feature.number}</span><div className="landing-feature-icon">{feature.number === '01' ? '◫' : feature.number === '02' ? '✓' : '↗'}</div><h3>{feature.title}</h3><p>{feature.text}</p><span className="landing-feature-line" /></Motion.article>;
}

function FloatingStep({ number, title, text, index, progress, reduceMotion }) {
  const y = useTransform(progress, [0, 0.5, 1], [22 - index * 8, 0, -15 + index * 8]);
  const x = useTransform(progress, [0, 1], [index === 1 ? 0 : index === 0 ? -9 : 9, index === 1 ? 0 : index === 0 ? 7 : -7]);
  const rotate = useTransform(progress, [0, 1], [index === 1 ? 0 : index === 0 ? -1 : 1, index === 1 ? 0 : index === 0 ? 1 : -1]);

  return <Motion.li style={reduceMotion ? undefined : { y, x, rotate }}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></Motion.li>;
}

export default function Landing() {
  const { user, token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const featureGridRef = useRef(null);
  const stepsRef = useRef(null);
  const isAuthenticated = Boolean(user && token);
  const primaryDestination = isAuthenticated ? '/dashboard' : '/register';
  const primaryLabel = isAuthenticated ? 'Get back to work' : 'Get started free';
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: featureScrollProgress } = useScroll({ target: featureGridRef, offset: ['start end', 'end start'] });
  const { scrollYProgress: stepsScrollProgress } = useScroll({ target: stepsRef, offset: ['start end', 'end start'] });
  const wordContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.14 } },
  };
  const wordMotion = (index) => ({
    hidden: { opacity: 0, y: index === 1 ? 12 : 22, x: index === 2 ? -12 : index === 3 ? 10 : 0, filter: 'blur(7px)' },
    visible: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transition: { duration: reduceMotion ? 0.01 : 0.64, ease: [0.22, 1, 0.36, 1] } },
  });

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
        <ProjectHubBrand className="landing-logo" />
        <button type="button" className="landing-menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <nav className={`landing-links ${menuOpen ? 'landing-links--open' : ''}`} aria-label="Main navigation">
          <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          {isAuthenticated ? (
            <Link to="/dashboard" className="landing-nav-cta" onClick={() => setMenuOpen(false)}>Get back to work <Arrow /></Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="landing-nav-cta" onClick={() => setMenuOpen(false)}>Get started <Arrow /></Link>
            </>
          )}
        </nav>
      </header>

      <section className="landing-hero" onPointerMove={handlePointerMove} onPointerLeave={() => setPointer({ x: 0, y: 0 })}>
        <div className="landing-orb landing-orb--violet" /><div className="landing-orb landing-orb--peach" /><div className="landing-grid" />
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span /> A more focused way to work</p>
          <Motion.div
            className="landing-hero-brand-pop"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.82, filter: 'blur(10px)' }}
            animate={reduceMotion ? undefined : { opacity: 1, y: [18, -3, 0], scale: [0.82, 1.035, 1], filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], times: [0, 0.82, 1] }}
          >
            <ProjectHubBrand hero />
          </Motion.div>
          <h1>Plan together.<br /><em>Ship with clarity.</em></h1>
          <p className="landing-lede">ProjectHub gives your team one calm, connected place to turn ambitious ideas into finished work.</p>
          <div className="landing-hero-actions"><Link to={primaryDestination} className="landing-primary-button">{primaryLabel} <Arrow /></Link><a href="#product" className="landing-secondary-button">Explore ProjectHub <span>↓</span></a></div>
          <div className="landing-proof"><div className="landing-proof-avatars"><span>J</span><span>M</span><span>A</span><span>R</span></div><p>Designed for teams that want less status-chasing and more progress.</p></div>
        </div>
        <div className="landing-hero-visual" style={{ '--tilt-x': `${pointer.x * 3}deg`, '--tilt-y': `${pointer.y * -3}deg` }}>
          <div className="landing-float-card landing-float-card--progress"><span>Weekly progress</span><strong>+24%</strong><svg viewBox="0 0 120 36" aria-hidden="true"><path d="M1 31C20 31 19 25 34 25s11-12 28-12 14 12 28 7 17-16 29-16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></div>
          <div className="landing-float-card landing-float-card--team"><div className="landing-mini-avatars"><span>A</span><span>J</span><span>K</span></div><p><b>3 teammates</b><br />in sync today</p></div>
          <ProductPreview source={dashboardDemo} alt="ProjectHub dashboard showing a team's projects" />
          <div className="landing-float-card landing-float-card--done"><span className="landing-done-icon"><Check /></span><p><b>Launch checklist</b><br />7 tasks completed</p></div>
        </div>
      </section>

      <section id="product" className="landing-intro landing-section">
        <p className="landing-section-label">ONE PLACE, REAL MOMENTUM</p>
        <div className="landing-section-heading"><Motion.h2 className="landing-progress-heading" variants={wordContainer} initial="hidden" whileInView="visible" viewport={{ amount: 0.55 }}>{progressWords.map((word, index) => <Motion.span className={`landing-progress-word ${word.className}`} variants={wordMotion(index)} key={word.text}>{word.text}</Motion.span>)}</Motion.h2><p>ProjectHub keeps the important work visible, the next step obvious, and your team connected without adding noise.</p></div>
        <div className="landing-intro-preview"><ProductPreview compact source={dashboardDemo} alt="ProjectHub project dashboard" /><div className="landing-preview-note"><span className="landing-note-dot" /><p><b>Built around real work.</b> Projects, tasks, people, and progress are designed to live together.</p></div></div>
      </section>

      <section id="features" className="landing-features landing-section">
        <div className="landing-feature-header"><div><p className="landing-section-label">BUILT FOR FOCUS</p><h2>Make every project<br />feel more manageable.</h2></div><p>Thoughtful tools and a clear visual system give your team the confidence to move from plans to done.</p></div>
        <Motion.div ref={featureGridRef} className="landing-feature-grid" initial="hidden" whileInView="visible" viewport={{ amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.13 } } }}>{features.map((feature, index) => <FloatingFeatureCard feature={feature} index={index} progress={featureScrollProgress} reduceMotion={reduceMotion} key={feature.number} />)}</Motion.div>
      </section>

      <section className="landing-kanban-story landing-section">
        <div className="landing-story-header"><p className="landing-section-label">THE WORK, IN MOTION</p><Motion.h2 className="landing-board-heading" variants={wordContainer} initial="hidden" whileInView="visible" viewport={{ amount: 0.55 }}>{boardWords.map((word, index) => <Motion.span variants={wordMotion(index)} key={word}>{word}</Motion.span>)}</Motion.h2><p>Move from a rough first thought to a finished task without losing the context, owners, or next step along the way.</p></div>
        <div className="landing-kanban-stage" aria-label="ProjectHub Kanban board"><ProductPreview source={boardDemo} alt="ProjectHub Kanban board showing To do, In progress, and Done columns" /><div className="landing-stage-label landing-stage-label--one">To do</div><div className="landing-stage-label landing-stage-label--two">In progress</div><div className="landing-stage-label landing-stage-label--three">Done <Check /></div></div>
      </section>

      <section className="landing-collaboration landing-section">
        <div className="landing-collab-visual"><ProductPreview source={commentsDemo} alt="ProjectHub task comments showing real-time collaboration" /><div className="landing-collab-card landing-collab-card--comment"><span className="preview-avatar preview-avatar--peach">M</span><p><b>Comments stay with the work</b><br />Keep decisions clear for the whole team.</p></div><div className="landing-collab-card landing-collab-card--assignment"><span className="landing-done-icon"><Check /></span><p><b>Task assigned</b><br />The next step is always clear.</p></div></div>
        <div className="landing-collab-copy"><p className="landing-section-label">STAY IN THE LOOP</p><h2>Collaboration that<br />keeps the work human.</h2><p>Assign the right person, leave useful context, and use real-time updates to keep a project moving—without adding another meeting.</p><Motion.div className="landing-collab-points" initial="hidden" whileInView="visible" viewport={{ amount: 0.5 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } } }}>{['Comments stay with the task', 'Assignments are always clear', 'Project updates appear in real time'].map((point) => <Motion.span key={point} variants={{ hidden: { opacity: 0, y: 14, scale: 0.88 }, visible: { opacity: 1, y: 0, scale: [0.88, 1.04, 1], transition: { duration: reduceMotion ? 0.01 : 0.48, ease: [0.22, 1, 0.36, 1] } } }}><Motion.i variants={{ hidden: { scale: 0.5 }, visible: { scale: [0.5, 1.12, 1], transition: { duration: reduceMotion ? 0.01 : 0.38 } } }}><Check /></Motion.i>{point}</Motion.span>)}</Motion.div></div>
      </section>

      <section id="how-it-works" className="landing-steps landing-section">
        <div className="landing-steps-copy"><p className="landing-section-label">HOW IT WORKS</p><h2>Less overhead.<br /><em>More of the work.</em></h2><p>ProjectHub is intentionally simple to adopt, so your team can settle into a better rhythm from day one.</p><Link to={primaryDestination} className="landing-text-link">{isAuthenticated ? 'Get back to work' : 'Start your workspace'} <Arrow /></Link></div>
        <ol ref={stepsRef} className="landing-step-list"><FloatingStep number="01" title="Create a project" text="Give your work a clear home with the right context." index={0} progress={stepsScrollProgress} reduceMotion={reduceMotion} /><FloatingStep number="02" title="Organize the next steps" text="Turn big goals into visible, owned tasks." index={1} progress={stepsScrollProgress} reduceMotion={reduceMotion} /><FloatingStep number="03" title="Collaborate and deliver" text="Keep updates, decisions, and progress together." index={2} progress={stepsScrollProgress} reduceMotion={reduceMotion} /></ol>
      </section>

      <section className="landing-metrics"><div><strong>One shared view</strong><span>of the work that matters</span></div><div><strong>Three simple stages</strong><span>from to-do to done</span></div><div><strong>Built for teams</strong><span>that value clarity</span></div></section>

      <section className="landing-tech landing-section"><p className="landing-section-label">DESIGNED AND BUILT WITH CARE</p><div><h2>A modern project,<br />from interface to infrastructure.</h2><p>ProjectHub is a full-stack MERN application with a responsive React client, Express API, MongoDB data model, JWT authentication, and Socket.io collaboration events.</p></div><div className="landing-tech-marquee" aria-label="Technology stack"><div className="landing-tech-marquee-track">{[...technologies, ...technologies].map((technology, index) => <span key={`${technology}-${index}`}>{technology}</span>)}</div></div></section>

      <section className="landing-final-cta"><div className="landing-final-glow" /><p className="landing-section-label">READY WHEN YOU ARE</p><h2>Bring your projects<br />together.</h2><p>Start organizing the work your team is ready to ship.</p><Link to={primaryDestination} className="landing-primary-button landing-primary-button--light">{primaryLabel} <Arrow /></Link></section>

      <footer className="landing-footer"><ProjectHubBrand className="landing-logo" /><div className="landing-footer-links"><a href="#product">Product</a><a href="#features">Features</a>{isAuthenticated ? <Link to="/dashboard">Get back to work</Link> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}</div><p>© {new Date().getFullYear()} ProjectHub. Built for better teamwork.</p></footer>
    </main>
  );
}
