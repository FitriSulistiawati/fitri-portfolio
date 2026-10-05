import { useEffect, useRef, useState } from "react";
import {
  FaCode,
  FaLightbulb,
  FaMicrophone,
  FaUsers,
} from "react-icons/fa";
import {
  SiFlask,
  SiGit,
  SiJavascript,
  SiMikrotik,
  SiMysql,
  SiOpenjdk,
  SiPython,
  SiReact,
} from "react-icons/si";
import { profile as p, projects, experience, skills, certs, publications } from "./data.js";

const skillIcons = {
  Python: SiPython,
  Java: SiOpenjdk,
  JavaScript: SiJavascript,
  Flask: SiFlask,
  React: SiReact,
  MySQL: SiMysql,
  Git: SiGit,
  MikroTik: SiMikrotik,
  Teamwork: FaUsers,
  "Public Speaking": FaMicrophone,
  "Problem Solving": FaLightbulb,
};

function useTyping(value, speed = 55, startImmediately = false) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(startImmediately);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (startImmediately || !ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startImmediately]);

  useEffect(() => {
    if (reducedMotion) {
      setCount(value.length);
      return undefined;
    }
    if (!started) return undefined;
    if (count >= value.length) return undefined;
    const timer = window.setTimeout(() => setCount((current) => current + 1), speed);
    return () => window.clearTimeout(timer);
  }, [count, reducedMotion, speed, started, value.length]);

  return { ref, text: reducedMotion ? value : value.slice(0, count), done: reducedMotion || count >= value.length };
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const tip = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let x = 0, y = 0, rx = 0, ry = 0, raf;
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      dot.current.style.transform = `translate(${x}px,${y}px)`;
      const target = e.target.closest?.("[data-tip]");
      ring.current.classList.toggle("big", !!target || !!e.target.closest?.("a,button"));
      tip.current.textContent = target ? target.dataset.tip : "";
      tip.current.classList.toggle("show", !!target);
      tip.current.style.transform = `translate(${x + 18}px,${y + 18}px)`;
    };
    const loop = () => {
      rx += (x - rx) * 0.15;
      ry += (y - ry) * 0.15;
      ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    loop();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <><div className="c-dot" ref={dot} /><div className="c-ring" ref={ring} /><div className="c-tip" ref={tip} /></>;
}

function Device({ web, mobile, title, delay = 0 }) {
  const img = (src) => src ? <img src={src} alt={`${title} preview`} /> : <div className="ph">{title}</div>;
  return (
    <div className="devices" data-tip="Web and mobile preview">
      <div className="laptop zoom-in motion" style={{ "--d": `${delay}s` }}><div className="screen">{img(web)}</div><div className="base" /></div>
      <div className="phone from-bottom motion" style={{ "--d": `${delay + 0.3}s` }}><div className="screen">{img(mobile)}</div></div>
    </div>
  );
}

const Head = ({ label, title }) => (
  <div className="head motion">
    <small className="fade-in motion">{label}</small>
    <h2 className="clip-reveal motion">{title}</h2>
  </div>
);

function AnimatedGpa({ value }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = Number.parseFloat(value);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches || !Number.isFinite(target)) {
      setCount(target);
      return undefined;
    }
    let frame;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / 1000, 1);
        setCount(target * progress);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return <i ref={ref} className="gpa-count">{Number.isFinite(count) ? count.toFixed(2) : value.slice(0, value.indexOf(" "))} / 4.00</i>;
}

function DetailModal({ item, onClose, onPrevious, onNext, hasNavigation }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [item.image]);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (hasNavigation && event.key === "ArrowLeft") onPrevious();
      if (hasNavigation && event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hasNavigation, onClose, onNext, onPrevious]);

  const hasImage = item.image && !imageFailed;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" aria-label="Close dialog" onClick={onClose}>×</button>
        {hasNavigation && <button className="modal-arrow previous" type="button" aria-label="Previous certificate" onClick={onPrevious}>‹</button>}
        <div className="modal-image">
          {hasImage
            ? <img src={item.image} alt={`${item.title} document`} onError={() => setImageFailed(true)} />
            : <div className="modal-placeholder"><span>Document image</span><small>Add an image path in src/data.js to display this document.</small></div>}
        </div>
        <div className="modal-content">
          <small>{item.by}{item.year ? ` / ${item.year}` : ""}</small>
          <h2 id="modal-title">{item.title}</h2>
          {item.authors && <p><b>Authors</b>{item.authors}</p>}
          {item.journal && <p><b>Journal</b>{item.journal}{item.volume ? ` / ${item.volume}` : ""}{item.year ? ` / ${item.year}` : ""}</p>}
          {item.abstract && <p><b>Abstract</b>{item.abstract}</p>}
          {item.link && <a className="btn" href={item.link} target="_blank" rel="noreferrer">{item.linkLabel || "Verify Credential"}</a>}
          {item.demo && <a className="btn modal-secondary" href={item.demo} target="_blank" rel="noreferrer">View Project</a>}
        </div>
        {hasNavigation && <button className="modal-arrow next" type="button" aria-label="Next certificate" onClick={onNext}>›</button>}
      </section>
    </div>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [activePublication, setActivePublication] = useState(null);
  const [activeSection, setActiveSection] = useState("about");
  const progressRef = useRef(null);
  const heroTyping = useTyping(p.name, 65, true);
  const contactTyping = useTyping("Discuss a\nprofessional opportunity.", 48);

  useEffect(() => {
    const motionElements = [...document.querySelectorAll(".motion")];
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        motionObserver.unobserve(entry.target);
      });
    }, { threshold: 0.01 });
    motionElements.forEach((element) => motionObserver.observe(element));

    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) {
        const current = visible.reduce((best, entry) => entry.intersectionRatio > best.intersectionRatio ? entry : best);
        setActiveSection(current.target.id);
      }
    }, { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    ["about", "projects", "experience", "skills", "publication", "certifications", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((element) => sectionObserver.observe(element));

    const revealVisible = () => {
      motionElements.forEach((element) => {
        if (element.classList.contains("in")) return;
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth) {
          element.classList.add("in");
          motionObserver.unobserve(element);
        }
      });
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
      revealVisible();
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", revealVisible);
    return () => {
      motionObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", revealVisible);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const mail = p.email && `mailto:${p.email}`;
  const closeModal = () => {
    setActiveCertificate(null);
    setActivePublication(null);
  };
  const certificateItem = activeCertificate === null ? null : certs[activeCertificate];
  const publicationItem = activePublication === null ? null : publications[activePublication];
  const modalItem = certificateItem
    ? { title: certificateItem.name, by: certificateItem.by, year: certificateItem.year, image: certificateItem.image, link: certificateItem.link }
    : publicationItem && {
      title: publicationItem.title,
      by: publicationItem.authors,
      year: publicationItem.year,
      image: publicationItem.cover,
      link: publicationItem.link,
      linkLabel: "Read Publication",
      demo: publicationItem.demo,
      authors: publicationItem.authors,
      journal: publicationItem.journal,
      volume: publicationItem.volume,
      abstract: publicationItem.abstract,
    };
  const previousCertificate = () => setActiveCertificate((index) => (index - 1 + certs.length) % certs.length);
  const nextCertificate = () => setActiveCertificate((index) => (index + 1) % certs.length);
  const openCertificate = (certificate, index) => {
    if (certificate.image) setActiveCertificate(index);
    else if (certificate.link) window.open(certificate.link, "_blank", "noopener,noreferrer");
    else setActiveCertificate(index);
  };

  return (
    <>
      <Cursor />
      <div className="scroll-progress" aria-hidden="true"><span ref={progressRef} /></div>
      <header className={"nav from-top motion" + (scrolled ? " solid" : "")}>
        <a href="#top" className="logo" onClick={() => setMenuOpen(false)}>Fitri</a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span /><span /><span />
        </button>
        <nav className={menuOpen ? "menu-open" : ""} aria-label="Main navigation">
          {["about", "projects", "experience", "skills", "publication", "certifications", "contact"].map((section) => <a key={section} className={activeSection === section ? "active" : ""} href={`#${section}`} onClick={() => setMenuOpen(false)} data-tip={`Go to ${section}`}>{section === "publication" ? "Publication" : section}</a>)}
          {p.cv && <a className="btn sm" href={p.cv} download data-tip="Download curriculum vitae" onClick={() => setMenuOpen(false)}>Download CV</a>}
        </nav>
      </header>

      <section id="top" className="hero">
        <div className="orb" />
        <small className="fade-in motion" style={{ "--d": ".1s" }}>{p.headline}</small>
        <h1 className="hero-name">
          <span className="typing-reserve" aria-hidden="true">{p.name}</span>
          <span className={`typing-live${heroTyping.done ? " typing-done" : ""}`} aria-label={p.name}>{heroTyping.text}<i className="typing-caret" aria-hidden="true" /></span>
        </h1>
        <em className="fade-in motion" style={{ "--d": ".45s" }}>{p.tagline}</em>
        <p className="from-bottom motion" style={{ "--d": ".12s" }}>{p.summary}</p>
        <span className="meta from-bottom motion" style={{ "--d": ".22s" }}>{p.location} / {p.status}</span>
        <a href="#projects" className="btn from-bottom motion" style={{ "--d": ".32s" }} data-tip="Explore selected projects">View Projects ↓</a>
      </section>

      <section id="about" className="wrap about">
        <div className="photo clip-reveal motion" data-tip="Profile photograph">{p.photo ? <img src={p.photo} alt={p.name} /> : <span>{p.name}</span>}</div>
        <div className="from-right motion" style={{ "--d": ".1s" }}>
          <h2>{p.about}</h2>
          <div className="cards">
            <div className="card from-bottom motion" style={{ "--d": ".16s" }} data-tip="Education"><small>Education</small><b>{p.education.degree}</b><span>{p.education.school}</span><span>{p.education.period}</span><AnimatedGpa value={p.education.gpa} /></div>
            <div className="card from-bottom motion" style={{ "--d": ".26s" }} data-tip="Contact details"><small>Contact</small><span>{p.email || "Email address to be added"}</span><span>{p.phone || "Phone number to be added"}</span><span>{p.location}</span></div>
          </div>
        </div>
      </section>

      <section id="projects" className="wrap">
        <Head label="Selected work" title="Projects" />
        {projects.map((project, index) => (
          <article key={project.title} className="project">
            <div className={`info ${index % 2 === 0 ? "from-left" : "from-right"} motion`} style={{ "--d": `${(index % 2) * 0.08}s` }}>
              <h3>{project.title}</h3><small>{project.meta}</small>
              {[["Problem", project.problem], ["Role", project.role], ["Key feature", project.feature], ["Outcome", project.outcome]].map(([label, value]) => <div className="row" key={label} data-tip={label}><small>{label}</small><span>{value}</span></div>)}
              <div className="tags">{project.tools.map((tool, toolIndex) => <span className="zoom-in motion" style={{ "--d": `${toolIndex * 0.08}s` }} key={tool} data-tip={`Technology: ${tool}`}>{tool}</span>)}</div>
              {project.demo && <a className="btn" href={project.demo} target="_blank" rel="noreferrer">View Live Demo</a>}
            </div>
            <div className={`${index % 2 === 0 ? "from-right" : "from-left"} motion`} style={{ "--d": ".08s" }}>
              <Device web={project.web} mobile={project.mobile} title={project.title} delay={0.08} />
            </div>
          </article>
        ))}
      </section>

      <section id="experience" className="wrap">
        <Head label="Professional and organizational experience" title="Experience" />
        {experience.map((item, index) => (
          <div className="exp motion experience-row" key={item.org} style={{ "--d": `${index * 0.1}s` }}>
            <small className="from-bottom motion" style={{ "--d": `${index * 0.1}s` }}>{item.period}</small>
            <div className="from-bottom motion" style={{ "--d": `${index * 0.1 + 0.08}s` }}><h3>{item.role}</h3><span>{item.org}</span></div>
            <div><ul>{item.points.map((point, pointIndex) => <li className="from-bottom motion" style={{ "--d": `${pointIndex * 0.09}s` }} key={point}>{point}</li>)}</ul><div className="tags">{item.tags.map((tag, tagIndex) => <span className="zoom-in motion" style={{ "--d": `${tagIndex * 0.08}s` }} key={tag}>{tag}</span>)}</div></div>
          </div>
        ))}
      </section>

      <section id="skills" className="wrap">
        <Head label="Technical and professional capabilities" title="Skills" />
        <div className="skills">
          {Object.entries(skills).map(([group, list], groupIndex) => (
            <div className="skill-category from-bottom motion" style={{ "--d": `${groupIndex * 0.1}s` }} key={group}><small>{group}</small>{list.map((skill, skillIndex) => {
              const Icon = skillIcons[skill] || FaCode;
              return <div className="skill zoom-in motion" style={{ "--d": `${skillIndex * 0.08}s` }} key={skill} data-tip={`${skill} skill`}><Icon aria-hidden="true" /><span>{skill}</span></div>;
            })}</div>
          ))}
        </div>
      </section>

      <section id="publication" className="wrap">
        <Head label="Research" title="Research & Publication" />
        {publications.map((publication, index) => (
          <article className="publication" key={`${publication.title}-${index}`}>
            <div className="publication-info from-left motion">
              <h3>{publication.title}</h3>
              <p className="publication-authors">{publication.authors}</p>
              <p className="publication-journal">{publication.journal}{publication.volume ? ` / ${publication.volume}` : ""}{publication.year ? ` / ${publication.year}` : ""}</p>
              <p>{publication.abstract}</p>
              <div className="publication-actions">
                {publication.link && <a className="btn" href={publication.link} target="_blank" rel="noreferrer">Read Publication</a>}
                {publication.demo && <a className="btn btn-outline" href={publication.demo} target="_blank" rel="noreferrer">View Project</a>}
              </div>
            </div>
            <button className="publication-cover blur-in motion" style={{ "--d": ".12s" }} type="button" aria-label={`View ${publication.title}`} onClick={() => setActivePublication(index)}>
              {publication.cover
                ? <img src={publication.cover} alt={`${publication.title} cover`} />
                : <span><b>Publication cover</b><small>Add a cover image path in src/data.js</small></span>}
            </button>
          </article>
        ))}
      </section>

      <section id="certifications" className="wrap">
        <Head label="Professional development" title="Certifications" />
        <div className="certs">
          {certs.map((certificate, index) => (
            <button className="cert from-bottom motion" type="button" key={certificate.name} onClick={() => openCertificate(certificate, index)} style={{ "--d": `${(index % 3) * 0.1 + Math.floor(index / 3) * 0.12}s` }} data-tip={certificate.link && !certificate.image ? "Open credential verification" : "View credential details"}>
              <small>{certificate.by} / {certificate.year}</small><b>{certificate.name}</b>
            </button>
          ))}
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="wrap">
          <h2 className="contact-title">
            <span className="typing-reserve" aria-hidden="true">Discuss a<br />professional opportunity.</span>
            <span ref={contactTyping.ref} className={`typing-live${contactTyping.done ? " typing-done" : ""}`} aria-label="Discuss a professional opportunity.">
              {contactTyping.text.split("\n").map((line, index) => <span className="typing-line" key={index}>{line}{index === 0 && <br />}</span>)}
              <i className="typing-caret" aria-hidden="true" />
            </span>
          </h2>
          <div className="links">
            {mail && <a className="btn dark from-bottom motion" style={{ "--d": "1.1s" }} href={mail}>Send an Email</a>}
            {p.linkedin && <a className="btn ghost from-bottom motion" style={{ "--d": "1.2s" }} href={p.linkedin} target="_blank" rel="noreferrer" data-tip="Open LinkedIn profile">LinkedIn</a>}
            {p.github && <a className="btn ghost from-bottom motion" style={{ "--d": "1.3s" }} href={p.github} target="_blank" rel="noreferrer" data-tip="Open GitHub profile">GitHub</a>}
          </div>
        </div>
      </section>
      {modalItem && <DetailModal key={certificateItem ? `certificate-${activeCertificate}` : `publication-${activePublication}`} item={modalItem} onClose={closeModal} onPrevious={previousCertificate} onNext={nextCertificate} hasNavigation={!!certificateItem && certs.length > 1} />}
    </>
  );
}
