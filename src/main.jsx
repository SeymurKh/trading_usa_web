import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { copy, getService, gallery, locales, services } from './data';
import './styles.css';

const localeFromPath = () => {
  const part = window.location.pathname.split('/').filter(Boolean)[0];
  return locales.includes(part) ? part : 'ru';
};

function App() {
  const [locale, setLocale] = useState(localeFromPath());
  const [path, setPath] = useState(window.location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[locale];

  useEffect(() => {
    const onPop = () => { setPath(window.location.pathname); setMenuOpen(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to) => {
    const target = to.startsWith('/') ? `/${locale}${to}` : `/${locale}`;
    window.history.pushState({}, '', target);
    setPath(target); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const changeLocale = (next) => {
    const suffix = path.replace(/^\/(ru|en|az)/, '') || '/';
    window.history.pushState({}, '', `/${next}${suffix}`); setLocale(next); setPath(`/${next}${suffix}`);
  };

  const serviceMatch = path.match(/\/service\/([^/]+)/);
  return <>
    <Header t={t} locale={locale} changeLocale={changeLocale} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    {serviceMatch ? <ServicePage t={t} locale={locale} service={getService(serviceMatch[1])} navigate={navigate} /> : path.endsWith('/services') ? <ServicesPage t={t} locale={locale} navigate={navigate} /> : path.endsWith('/about') ? <AboutPage t={t} locale={locale} navigate={navigate} /> : path.endsWith('/gallery') ? <GalleryPage t={t} locale={locale} navigate={navigate} /> : path.endsWith('/faq') ? <FaqPage t={t} locale={locale} /> : path.endsWith('/contact') ? <ContactPage t={t} locale={locale} /> : <Home t={t} locale={locale} navigate={navigate} />}
    <Footer t={t} locale={locale} navigate={navigate} />
  </>;
}

function Header({ t, locale, changeLocale, navigate, menuOpen, setMenuOpen }) {
  return <header className="header"><div className="container nav-wrap"><button className="brand" onClick={() => navigate('/')}><span className="brand-mark">N</span><span>northline<span className="brand-dot">.</span></span></button><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /></button><nav className={menuOpen ? 'nav open' : 'nav'}>{Object.entries(t.nav).map(([key, label]) => <button key={key} onClick={() => navigate(key === 'home' ? '/' : `/${key}`)}>{label}</button>)}<div className="languages">{locales.map((item) => <button className={locale === item ? 'active' : ''} key={item} onClick={() => changeLocale(item)}>{item.toUpperCase()}</button>)}</div><button className="nav-cta" onClick={() => navigate('/contact')}>{t.primaryCta} <span>↗</span></button></nav></div></header>;
}

function Home({ t, locale, navigate }) {
  return <main><section className="hero"><div className="hero-image" /><div className="container hero-content"><div className="eyebrow">{t.heroEyebrow}</div><h1>{t.heroTitle.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1><p>{t.heroText}</p><div className="hero-actions"><button className="button primary" onClick={() => navigate('/contact')}>{t.primaryCta} <span>↗</span></button><button className="text-button" onClick={() => navigate('/services')}>{t.secondaryCta} <span>→</span></button></div></div><div className="hero-scroll">SCROLL <span>↓</span></div></section><section className="stats"><div className="container stats-grid">{t.stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></section><ServicesPreview t={t} locale={locale} navigate={navigate} /><Process t={t} /><section className="split-section"><div className="split-image warehouse" /><div className="split-copy"><div className="eyebrow">{t.trustEyebrow}</div><h2>{t.trustTitle}</h2><p>{t.trustText}</p><div className="check-list">{t.trustPoints.map((item) => <div key={item}><span>✓</span>{item}</div>)}</div><button className="text-button" onClick={() => navigate('/about')}>{t.nav.about} <span>→</span></button></div></section><GalleryPreview t={t} locale={locale} navigate={navigate} /><QuoteSection t={t} /></main>;
}

function ServicesPreview({ t, locale, navigate }) { return <section className="section"><div className="container"><div className="section-heading"><div><div className="eyebrow">{t.servicesEyebrow}</div><h2>{t.servicesTitle}</h2></div><p>{t.servicesText}</p></div><div className="service-grid">{services.map((service) => <ServiceCard key={service.id} service={service} locale={locale} t={t} navigate={navigate} />)}</div><button className="button outline center-button" onClick={() => navigate('/services')}>{t.allServices} <span>↗</span></button></div></section>; }
function ServiceCard({ service, locale, t, navigate }) { return <article className="service-card" onClick={() => navigate(`/service/${service.id}`)}><div className="card-image" style={{ backgroundImage: `url(${service.image})` }}><span>{service.icon}</span></div><div className="card-content"><h3>{service.title[locale]}</h3><p>{service.text[locale]}</p><button className="arrow-link">{t.details} <span>↗</span></button></div></article>; }
function Process({ t }) { return <section className="process-section"><div className="container"><div className="eyebrow">{t.processEyebrow}</div><h2>{t.processTitle}</h2><div className="process-grid">{t.process.map((item) => <div className="process-item" key={item.no}><span className="process-no">{item.no}</span><h3>{item.title}</h3><p>{item.text}</p></div>)}</div></div></section>; }
function GalleryPreview({ t, locale, navigate }) { return <section className="gallery-preview"><div className="container"><div className="section-heading"><div><div className="eyebrow">{t.galleryEyebrow}</div><h2>{t.galleryTitle}</h2></div><button className="text-button" onClick={() => navigate('/gallery')}>{t.galleryCta} <span>↗</span></button></div><div className="gallery-grid">{gallery.slice(0, 3).map((item, i) => <div className={`gallery-tile tile-${i}`} key={item.title.ru} style={{ backgroundImage: `url(${item.image})` }}><span>{item.title[locale]}</span></div>)}</div></div></section>; }
function QuoteSection({ t }) { return <section className="quote-section"><div className="container quote-grid"><div><div className="eyebrow">{t.quoteEyebrow}</div><h2>{t.quoteTitle}</h2><p>{t.quoteText}</p></div><LeadForm t={t} /></div></section>; }
function LeadForm({ t }) { const [sent, setSent] = useState(false); const submit = (e) => { e.preventDefault(); setSent(true); }; if (sent) return <div className="form-success"><span>✓</span><p>{t.form.success}</p></div>; return <form className="lead-form" onSubmit={submit}><input required placeholder={t.form.name} /><input required placeholder={t.form.contact} /><input placeholder={t.form.cargo} /><textarea placeholder={t.form.message} rows="3" /><button className="button primary" type="submit">{t.form.send} <span>↗</span></button></form>; }

function ServicesPage({ t, locale, navigate }) { return <PageIntro eyebrow={t.servicesEyebrow} title={t.servicesTitle} text={t.servicesText}><div className="container service-page-grid">{services.map((service) => <ServiceCard key={service.id} service={service} locale={locale} t={t} navigate={navigate} />)}</div></PageIntro>; }
function ServicePage({ t, locale, service, navigate }) { return <main><section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(11,20,23,.9), rgba(11,20,23,.35)), url(${service.image})` }}><div className="container"><button className="back-link" onClick={() => navigate('/services')}>← {t.back}</button><div className="eyebrow">{service.icon} / {t.nav.services}</div><h1>{service.title[locale]}</h1><p>{service.text[locale]}</p></div></section><section className="detail-content"><div><div className="eyebrow">{t.processEyebrow}</div><h2>{t.trustTitle}</h2><p>{t.trustText}</p></div><div className="detail-list">{t.trustPoints.map((point, i) => <div key={point}><b>0{i + 1}</b><span>{point}</span></div>)}</div></section><QuoteSection t={t} /></main>; }
function PageIntro({ eyebrow, title, text, children }) { return <main><section className="page-intro"><div className="container"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div></section>{children}</main>; }
function AboutPage({ t }) { return <PageIntro eyebrow={t.trustEyebrow} title={t.trustTitle} text={t.trustText}><section className="about-body"><div className="container about-grid"><div className="split-image warehouse" /><div className="check-list">{t.trustPoints.map((item) => <div key={item}><span>✓</span>{item}</div>)}</div></div><Process t={t} /></section></PageIntro>; }
function GalleryPage({ t, locale }) { return <PageIntro eyebrow={t.galleryEyebrow} title={t.galleryTitle} text={t.galleryCta}><div className="container gallery-full">{gallery.map((item) => <div className="gallery-tile" key={item.title.ru} style={{ backgroundImage: `url(${item.image})` }}><span>{item.title[locale]}</span></div>)}</div></PageIntro>; }
function FaqPage({ t }) { const questions = [t.nav.services, t.process[0].title, t.process[1].title, t.form.contact, t.trustEyebrow]; return <PageIntro eyebrow="FAQ" title={t.contactTitle} text={t.quoteText}><div className="container faq-list">{questions.map((question, i) => <details key={question} open={i === 0}><summary>{question}<span>+</span></summary><p>{t.trustText}</p></details>)}</div></PageIntro>; }
function ContactPage({ t }) { return <main><section className="contact-page"><div className="container contact-grid"><div><div className="eyebrow">{t.nav.contacts}</div><h1>{t.contactTitle}</h1><p>{t.quoteText}</p><div className="contact-details"><span>EMAIL</span><strong>hello@northline.example</strong><span>PHONE</span><strong>+1 (000) 000-0000</strong><span>OFFICE</span><strong>USA · Placeholder address</strong></div></div><LeadForm t={t} /></div></section></main>; }
function Footer({ t, locale, navigate }) { return <footer><div className="container footer-top"><button className="brand" onClick={() => navigate('/')}><span className="brand-mark">N</span><span>northline<span className="brand-dot">.</span></span></button><p>{t.footerText}</p><button className="button outline" onClick={() => navigate('/contact')}>{t.primaryCta} <span>↗</span></button></div><div className="container footer-bottom"><span>© 2026 Northline Logistics · FILLER CONTENT</span><div>{Object.entries(t.nav).slice(1, 5).map(([key, label]) => <button key={key} onClick={() => navigate(`/${key}`)}>{label}</button>)}</div><span>{locale.toUpperCase()} / PRIVACY</span></div></footer>; }

createRoot(document.getElementById('root')).render(<App />);
