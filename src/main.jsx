import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { contacts, copy, gallery, locales, services } from './data';
import logoSign from './assets/brand/logo-sign.png';
import logoEmblemHauler from './assets/brand/logo-emblem-hauler.png';
import logoBadge from './assets/brand/logo-badge.png';
import logoLockup from './assets/brand/logo-lockup.png';
import trustPhoto from './assets/sections/trust-photo.jpg';
import './styles.css';

const SITE_URL = 'https://savannah-cargo.com';

const localeFromPath = () => {
  const part = window.location.pathname.split('/').filter(Boolean)[0];
  return locales.includes(part) ? part : 'en';
};

const pageOf = (path) => {
  const clean = (path.replace(/^\/(ru|en|az)(?=\/|$)/, '') || '/').replace(/\/+$/, '') || '/';
  const serviceMatch = clean.match(/^\/service\/([^/]+)$/);
  if (serviceMatch) return { key: 'service', id: serviceMatch[1] };
  const map = { '/': 'home', '/services': 'services', '/about': 'about', '/gallery': 'gallery', '/faq': 'faq', '/contact': 'contacts', '/contacts': 'contacts', '/quote': 'quote' };
  return { key: map[clean] || 'notFound' };
};

function App() {
  const [locale, setLocale] = useState(localeFromPath());
  const [path, setPath] = useState(window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[locale];
  const page = pageOf(path);
  const service = page.key === 'service' ? services.find((s) => s.id === page.id) : null;
  const view = page.key === 'service' && !service ? 'notFound' : page.key;

  useEffect(() => {
    const onPop = () => { setPath(window.location.pathname); setMenuOpen(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const seg = window.location.pathname.split('/').filter(Boolean)[0];
    if (!locales.includes(seg)) {
      const clean = window.location.pathname.replace(/\/+$/, '');
      const target = clean ? `/en${clean}` : '/en';
      window.history.replaceState({}, '', target);
      setPath(target);
    }
  }, []);

  useEffect(() => {
    const header = document.querySelector('.header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { nodes.forEach((node) => node.classList.add('in-view')); return undefined; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [path, locale]);

  useEffect(() => {
    const meta = (selector, value) => { const el = document.head.querySelector(selector); if (el) el.setAttribute('content', value); };
    let title = t.seoHome; let desc = t.seoHomeDesc;
    if (view === 'service' && service) { title = `${service.title[locale]} — Savannah Cargo`; desc = service.text[locale]; }
    else if (view === 'services') { title = `${t.servicesTitle} — Savannah Cargo`; desc = t.servicesText; }
    else if (view === 'about') { title = `${t.nav.about} — Savannah Cargo`; desc = t.trustText; }
    else if (view === 'gallery') { title = `${t.nav.gallery} — Savannah Cargo`; desc = t.galleryTitle; }
    else if (view === 'faq') { title = 'FAQ — Savannah Cargo'; desc = t.faqText; }
    else if (view === 'contacts') { title = `${t.nav.contacts} — Savannah Cargo`; desc = t.contactsText; }
    else if (view === 'quote') { title = `${t.contactTitle} — Savannah Cargo`; desc = t.quoteText; }
    else if (view === 'notFound') { title = `${t.notFoundTitle} — Savannah Cargo`; desc = t.notFoundText; }
    const canon = view === 'contacts' ? path.replace(/\/contact\/?$/, '/contacts') : path;
    const url = `${SITE_URL}${canon === '/' ? '/' : canon}`;
    document.title = title;
    meta('meta[name="description"]', desc);
    meta('meta[property="og:title"]', title);
    meta('meta[property="og:description"]', desc);
    meta('meta[property="og:url"]', url);
    meta('meta[property="og:locale"]', locale === 'ru' ? 'ru_RU' : locale === 'en' ? 'en_US' : 'az_AZ');
    meta('meta[name="twitter:title"]', title);
    meta('meta[name="twitter:description"]', desc);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    document.documentElement.lang = locale;
  }, [path, locale, view, service, t]);

  const navigate = (to) => {
    const target = to.startsWith('/') ? `/${locale}${to}` : `/${locale}`;
    window.history.pushState({}, '', target);
    setPath(target); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const changeLocale = (next) => {
    const suffix = path.replace(/^\/(ru|en|az)/, '') || '/';
    window.history.pushState({}, '', `/${next}${suffix}`); setLocale(next); setPath(`/${next}${suffix}`);
  };

  return <>
    <Header t={t} locale={locale} changeLocale={changeLocale} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} solid={view === 'quote' || view === 'contacts' || view === 'notFound'} />
    {view === 'service' ? <ServicePage t={t} locale={locale} service={service} navigate={navigate} />
      : view === 'services' ? <ServicesPage t={t} locale={locale} navigate={navigate} />
      : view === 'about' ? <AboutPage t={t} locale={locale} navigate={navigate} />
      : view === 'gallery' ? <GalleryPage t={t} />
      : view === 'faq' ? <FaqPage t={t} />
      : view === 'contacts' ? <ContactsPage t={t} navigate={navigate} />
      : view === 'quote' ? <QuotePage t={t} />
      : view === 'notFound' ? <NotFoundPage t={t} navigate={navigate} />
      : <Home t={t} locale={locale} navigate={navigate} />}
    <Footer t={t} locale={locale} navigate={navigate} />
  </>;
}

function Header({ t, locale, changeLocale, navigate, menuOpen, setMenuOpen, solid }) {
  return <header className={solid ? 'header solid' : 'header'}><div className="container nav-wrap"><button className="brand" onClick={() => navigate('/')} aria-label="Savannah Cargo"><img src={logoSign} alt="Savannah Cargo" /></button><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /></button><nav className={menuOpen ? 'nav open' : 'nav'}>{Object.entries(t.nav).map(([key, label]) => <button key={key} onClick={() => navigate(key === 'home' ? '/' : `/${key}`)}>{label}</button>)}<div className="languages">{locales.map((item) => <button className={locale === item ? 'active' : ''} key={item} onClick={() => changeLocale(item)}>{item.toUpperCase()}</button>)}</div><button className="nav-cta" onClick={() => navigate('/quote')}>{t.primaryCta} <span>{'\u2197\uFE0E'}</span></button></nav></div></header>;
}

function Hero({ t, navigate }) {
  return <section className="hero"><div className="hero-image" /><div className="container hero-grid">
    <div className="hero-content"><h1>{t.heroTitle.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1><p>{t.heroText}</p><div className="hero-actions"><button className="button primary" onClick={() => navigate('/quote')}>{t.primaryCta} <span>{'\u2197\uFE0E'}</span></button><button className="text-button" onClick={() => navigate('/services')}>{t.secondaryCta} <span>{'\u2192\uFE0E'}</span></button></div></div>
    <div className="hero-brand"><img src={logoEmblemHauler} alt="Savannah Cargo" /></div>
  </div><div className="hero-scroll">SCROLL <span>{'\u2193\uFE0E'}</span></div></section>;
}

function Marquee({ t }) {
  const line = [...t.marqueeCountries, ...t.marqueeCountries, ...t.marqueeCountries];
  return <section className="marquee" aria-label={t.marqueeAriaLabel}><div className="marquee-track">{[0, 1].map((copyIndex) => <div className="marquee-group" key={copyIndex} aria-hidden={copyIndex === 1}>{line.map((item, i) => <span className="marquee-item" key={i}>{item}</span>)}</div>)}</div></section>;
}

function ServicesRows({ t, locale, navigate }) {
  return <section className="section services-rows-section" data-reveal><div className="container"><div className="section-heading"><div><div className="eyebrow">{t.servicesEyebrow}</div><h2>{t.servicesTitle}</h2></div><p>{t.servicesText}</p></div>
    <div className="service-rows">{services.map((service) => <a className="service-row" key={service.id} href={`/${locale}/service/${service.id}`} onClick={(e) => { e.preventDefault(); navigate(`/service/${service.id}`); }}><span className="service-row-no">{service.icon}</span><div className="service-row-body"><h3>{service.title[locale]}</h3><p>{service.text[locale]}</p></div><div className="service-row-image" style={{ backgroundImage: `url(${service.image})` }} /><span className="service-row-arrow" aria-hidden="true">{'\u2192\uFE0E'}</span></a>)}</div>
    <button className="button outline center-button" onClick={() => navigate('/services')}>{t.allServices} <span>{'\u2197\uFE0E'}</span></button>
  </div></section>;
}

function Process({ t }) {
  return <section className="process-section" data-reveal><div className="container"><div className="eyebrow">{t.processEyebrow}</div><h2>{t.processTitle}</h2>
    <div className="process-route">{t.process.map((item) => <div className="process-stop" key={item.no}><span className="process-dot" aria-hidden="true" /><span className="process-no">{item.no}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>
  </div></section>;
}

function TrustSection({ t, navigate }) {
  return <section className="trust-section" data-reveal><div className="container trust-grid">
    <div className="trust-media"><div className="trust-photo" style={{ backgroundImage: `url(${trustPhoto})` }} /><img className="trust-badge" src={logoBadge} alt="Savannah Cargo — Global Vehicle Logistics" /></div>
    <div className="trust-copy"><div className="eyebrow">{t.trustEyebrow}</div><h2>{t.trustTitle}</h2><p>{t.trustText}</p><div className="check-list">{t.trustPoints.map((item) => <div key={item}><span>✓</span>{item}</div>)}</div>
      <button className="text-button" onClick={() => navigate('/about')}>{t.nav.about} <span>{'\u2192\uFE0E'}</span></button></div>
  </div></section>;
}

function GalleryMosaic({ t, navigate }) {
  return <section className="gallery-preview" data-reveal><div className="container"><div className="section-heading"><h2>{t.galleryTitle}</h2><button className="text-button" onClick={() => navigate('/gallery')}>{t.nav.gallery} <span>{'\u2192\uFE0E'}</span></button></div>
    <div className="gallery-mosaic">{gallery.slice(0, 5).map((item, i) => <div className={`mosaic-tile mosaic-${i}`} key={item.image} style={{ backgroundImage: `url(${item.image})` }} />)}</div>
  </div></section>;
}

function QuoteSection({ t }) { return <section className="quote-section" data-reveal><div className="container quote-grid"><div><h2>{t.quoteTitle}</h2><p>{t.quoteText}</p></div><LeadForm t={t} /></div></section>; }

function LeadForm({ t }) { const [sent, setSent] = useState(false); const submit = (e) => { e.preventDefault(); setSent(true); }; if (sent) return <div className="form-success"><span>✓</span><p>{t.form.success}</p></div>; return <form className="lead-form" onSubmit={submit}><input required placeholder={t.form.name} /><input required placeholder={t.form.contact} /><input placeholder={t.form.cargo} /><textarea placeholder={t.form.message} rows="3" /><button className="button primary" type="submit">{t.form.send} <span>{'\u2197\uFE0E'}</span></button></form>; }

function Home({ t, locale, navigate }) {
  return <main><Hero t={t} navigate={navigate} /><Marquee t={t} /><ServicesRows t={t} locale={locale} navigate={navigate} /><Process t={t} /><TrustSection t={t} navigate={navigate} /><GalleryMosaic t={t} navigate={navigate} /><QuoteSection t={t} /></main>;
}

function ServicesPage({ t, locale, navigate }) { return <PageIntro eyebrow={t.servicesEyebrow} title={t.servicesTitle} text={t.servicesText}><div className="container service-page-grid">{services.map((service) => <ServiceCard key={service.id} service={service} locale={locale} t={t} navigate={navigate} />)}</div><QuoteSection t={t} /></PageIntro>; }
function ServiceCard({ service, locale, t, navigate }) { return <a className="service-card" href={`/${locale}/service/${service.id}`} onClick={(e) => { e.preventDefault(); navigate(`/service/${service.id}`); }}><div className="card-image" style={{ backgroundImage: `url(${service.image})` }}><span>{service.icon}</span></div><div className="card-content"><h3>{service.title[locale]}</h3><p>{service.text[locale]}</p><span className="arrow-link">{t.details} <span>{'\u2197\uFE0E'}</span></span></div></a>; }

function ServicePage({ t, locale, service, navigate }) { return <main><section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(21,51,42,.9), rgba(21,51,42,.35)), url(${service.image})` }}><div className="container"><button className="back-link" onClick={() => navigate('/services')}>{'\u2190\uFE0E'} {t.back}</button><h1>{service.title[locale]}</h1><p>{service.text[locale]}</p></div></section><section className="detail-content"><div><div className="eyebrow">{t.processEyebrow}</div><h2>{t.trustTitle}</h2><p>{t.trustText}</p></div><div className="detail-list">{t.trustPoints.map((point, i) => <div key={point}><b>0{i + 1}</b><span>{point}</span></div>)}</div></section><QuoteSection t={t} /></main>; }

function PageIntro({ eyebrow, title, text, children }) { return <main><section className="page-intro"><div className="container">{eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}<h1>{title}</h1>{text ? <p>{text}</p> : null}</div></section>{children}</main>; }

function AboutPage({ t, navigate }) {
  return <PageIntro eyebrow={t.trustEyebrow} title={t.trustTitle} text={t.trustText}><section className="about-body"><div className="container about-grid">
    <div className="about-media"><img src={logoLockup} alt="Savannah Cargo — Global Vehicle Logistics" /></div>
    <div className="check-list">{t.trustPoints.map((item) => <div key={item}><span>✓</span>{item}</div>)}</div>
  </div><Process t={t} /><QuoteSection t={t} /></section></PageIntro>;
}

function GalleryPage({ t }) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (active === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);
  return <PageIntro title={t.galleryTitle}><div className="container gallery-full">{gallery.map((item, i) => <button className="gallery-tile" key={item.image} style={{ backgroundImage: `url(${item.image})` }} onClick={() => setActive(i)} aria-label={`${t.nav.gallery} ${i + 1}`} />)}</div>
    {active !== null && <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setActive(null)}><img src={gallery[active].image} alt="" /><button className="lightbox-close" aria-label="Close" onClick={() => setActive(null)}>×</button><button className="lightbox-nav prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setActive((active - 1 + gallery.length) % gallery.length); }}>{'\u2190\uFE0E'}</button><button className="lightbox-nav next" aria-label="Next" onClick={(e) => { e.stopPropagation(); setActive((active + 1) % gallery.length); }}>{'\u2192\uFE0E'}</button></div>}
  </PageIntro>;
}

function FaqPage({ t }) { return <PageIntro eyebrow="FAQ" title={t.faqTitle} text={t.faqText}><div className="container faq-list">{t.faq.map((item, i) => <details key={item.q} {...(i === 0 ? { open: true } : {})}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div><QuoteSection t={t} /></PageIntro>; }

function ContactsPage({ t, navigate }) {
  return <PageIntro title={t.nav.contacts} text={t.contactsText}><section className="contact-body">
    <div className="container contact-cards">
      <a className="contact-card" href={`tel:${contacts.phone.replace(/[^+\d]/g, '')}`}><span>PHONE</span><strong>{contacts.phone}</strong></a>
      <a className="contact-card" href={`mailto:${contacts.email}`}><span>EMAIL</span><strong>{contacts.email}</strong></a>
      <a className="contact-card" href={`https://wa.me/${contacts.whatsapp}`} target="_blank" rel="noopener noreferrer"><span>WHATSAPP</span><strong>WhatsApp {'\u2197\uFE0E'}</strong></a>
      <div className="contact-card"><span>OFFICE</span><strong>{contacts.address}</strong></div>
    </div>
    <div className="container contact-map-wrap"><h2>{t.mapLabel}</h2><iframe className="contact-map" title={t.mapLabel} src="https://maps.google.com/maps?q=176+Waverly+Way,+Savannah,+GA+31407&z=15&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
    <div className="container contact-cta"><button className="button primary" onClick={() => navigate('/quote')}>{t.primaryCta} <span>{'\u2197\uFE0E'}</span></button></div>
  </section></PageIntro>;
}

function QuotePage({ t }) {
  return <main><section className="contact-page"><div className="container contact-grid">
    <div className="contact-head"><h1>{t.contactTitle}</h1><p>{t.quoteText}</p></div>
    <LeadForm t={t} />
  </div></section></main>;
}

function NotFoundPage({ t, navigate }) {
  return <main><section className="notfound-page"><div className="container notfound-inner"><img src={logoEmblemHauler} alt="Savannah Cargo" /><h1>{t.notFoundTitle}</h1><p>{t.notFoundText}</p><button className="button primary" onClick={() => navigate('/')}>{t.notFoundCta} <span>{'\u2197\uFE0E'}</span></button></div></section></main>;
}

function Footer({ t, locale, navigate }) {
  return <footer><div className="container footer-top"><button className="brand" onClick={() => navigate('/')} aria-label="Savannah Cargo"><img src={logoSign} alt="Savannah Cargo" /></button><nav className="footer-nav">{Object.entries(t.nav).slice(1).map(([key, label]) => <button key={key} onClick={() => navigate(`/${key}`)}>{label}</button>)}</nav><button className="button outline" onClick={() => navigate('/quote')}>{t.primaryCta} <span>{'\u2197\uFE0E'}</span></button></div><div className="container footer-bottom"><span>© 2026 Savannah Cargo</span><div className="footer-contacts"><a href={`tel:${contacts.phone.replace(/[^+\d]/g, '')}`}>{contacts.phone}</a><a href={`mailto:${contacts.email}`}>{contacts.email}</a><a href={`https://wa.me/${contacts.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></div><span>{locale.toUpperCase()}</span></div></footer>;
}

createRoot(document.getElementById('root')).render(<App />);