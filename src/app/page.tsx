'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

/* ─── Mini Canvas Preview ─────────────────────────────────────────── */
function MiniCanvas() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  const notes = [
    { x: 30,  y: 24,  rot: -2, bg: '#FFF59D', text: 'User research ✦',   w: 138 },
    { x: 194, y: 12,  rot: 2,  bg: '#E3F2FD', text: 'Sprint planning 🎯', w: 128 },
    { x: 350, y: 30,  rot: -1, bg: '#E8F5E9', text: 'Ship it! 🚀',        w: 106 },
    { x: 44,  y: 140, rot: 1,  bg: '#FCE4EC', text: 'Brand palette',      w: 116 },
    { x: 225, y: 135, rot: -2, bg: '#F3E5F5', text: 'Wireframe v3',       w: 112 },
  ];

  const cursors = [
    { name: 'Priya', color: '#FF2D55', baseX: 175, baseY: 108, ox: Math.sin(tick * 0.018) * 20, oy: Math.cos(tick * 0.023) * 13 },
    { name: 'James', color: '#34C759', baseX: 315, baseY: 88,  ox: Math.cos(tick * 0.021) * 17, oy: Math.sin(tick * 0.016) * 11 },
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-[20px]"
      style={{
        height: 240,
        background: '#F2F2F7',
        backgroundImage: 'radial-gradient(circle, rgba(60,60,67,0.14) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        border: '0.5px solid rgba(60,60,67,0.13)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
      }}
    >
      {notes.map((n, i) => (
        <div
          key={i}
          className="absolute rounded-[10px]"
          style={{
            left: n.x, top: n.y, width: n.w,
            background: n.bg,
            padding: '9px 11px',
            transform: `rotate(${n.rot}deg)`,
            fontFamily: 'Caveat, cursive',
            fontSize: 13,
            color: '#1C1C1E',
            lineHeight: 1.3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.09)',
            animation: `note-drop 0.5s ${i * 0.08}s both`,
            userSelect: 'none',
          }}
        >
          {n.text}
        </div>
      ))}

      {cursors.map((c) => (
        <div
          key={c.name}
          className="absolute pointer-events-none"
          style={{ left: c.baseX + c.ox, top: c.baseY + c.oy, transition: 'left 80ms linear, top 80ms linear' }}
        >
          <svg width="16" height="20" viewBox="0 0 20 20" fill={c.color} stroke="white" strokeWidth="1.2">
            <path d="M4 2L16 10L10 11.5L7.5 17L4 2Z" />
          </svg>
          <div style={{ background: c.color, fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, color: 'white', padding: '2px 7px', borderRadius: 20, marginTop: 2, marginLeft: 14, whiteSpace: 'nowrap', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {c.name}
          </div>
        </div>
      ))}

      <div
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
        style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(60,60,67,0.13)', fontSize: 11, fontFamily: 'var(--font-ui)', color: 'rgba(60,60,67,0.6)' }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34C759' }} />
        Live collaboration
      </div>
    </div>
  );
}

/* ─── Feature Card ────────────────────────────────────────────────── */
function FeatureCard({ title, desc, icon, color, wide = false }: { title: string; desc: string; icon: React.ReactNode; color: string; wide?: boolean }) {
  return (
    <div
      className={`card p-6 transition-shadow hover:shadow-lg ${wide ? 'md:col-span-2' : ''}`}
      style={{ cursor: 'default' }}
    >
      <div className="flex items-center justify-center rounded-[12px] mb-4" style={{ width: 40, height: 40, background: color }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{desc}</p>
    </div>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[9999] glass-panel"
      style={{
        borderRadius: 0,
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: scrolled ? '0.5px solid var(--border)' : '0.5px solid transparent',
        background: scrolled ? 'var(--bg-panel)' : 'transparent',
        backdropFilter: scrolled ? 'var(--blur-panel)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="mx-auto flex items-center justify-between px-5" style={{ maxWidth: 960, height: 52 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div className="flex items-center justify-center rounded-[8px]" style={{ width: 28, height: 28, background: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', letterSpacing: '-0.01em' }}>Inkspace</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {['Features', 'Collaborate'].map((item) => (
            <a key={item} href="#"
              className="ghost-button"
              style={{ fontSize: 15, color: 'var(--text-secondary)', textDecoration: 'none', padding: '6px 12px' }}
            >{item}</a>
          ))}
        </div>

        <Link href="/board" className="primary-button" style={{ fontSize: 15, textDecoration: 'none', borderRadius: 'var(--radius-md)', padding: '8px 18px' }}>
          Open canvas
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </nav>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg-canvas)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-5" style={{ minHeight: '100vh', paddingTop: 52 }}>
        {/* Live badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5"
          style={{
            border: '0.5px solid var(--border)',
            background: 'var(--bg-secondary)',
            fontSize: 13,
            fontFamily: 'var(--font-ui)',
            color: 'var(--text-secondary)',
            animation: 'fade-slide-up 0.4s both',
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)', display: 'inline-block' }} />
          Now with real-time collaboration
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 7vw, 72px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.07,
            maxWidth: 700,
            marginBottom: 20,
            animation: 'fade-slide-up 0.4s 0.07s both',
          }}
        >
          Your thoughts,{' '}
          <span style={{ color: 'var(--accent)' }}>unfiltered.</span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 19,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 480,
            marginBottom: 36,
            animation: 'fade-slide-up 0.4s 0.14s both',
          }}
        >
          The infinite canvas that gets out of your way.
          Draw, write, collaborate.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col items-center gap-3 sm:flex-row"
          style={{ animation: 'fade-slide-up 0.4s 0.21s both', marginBottom: 56 }}
        >
          <Link href="/board" className="primary-button" style={{ height: 50, padding: '0 24px', fontSize: 17, fontWeight: 600, borderRadius: 14, textDecoration: 'none' }}>
            Open canvas — it&apos;s free
          </Link>
          <a href="#features" className="secondary-button" style={{ height: 50, padding: '0 24px', fontSize: 17, borderRadius: 14, textDecoration: 'none' }}>
            See features ↓
          </a>
        </div>

        {/* Mini canvas */}
        <div style={{ width: '100%', maxWidth: 580, animation: 'fade-slide-up 0.5s 0.28s both' }}>
          <MiniCanvas />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10 mt-10" style={{ animation: 'fade-slide-up 0.4s 0.35s both' }}>
          {[{ v: '12k+', l: 'active boards' }, { v: '99ms', l: 'sync latency' }, { v: '4.9★', l: 'Product Hunt' }].map((s) => (
            <div key={s.l} className="text-center">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="px-5 pb-28" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: 12 }}>
            Everything you need to think visually
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 17, color: 'var(--text-secondary)' }}>
            Built for makers, designers, and teams who think in diagrams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            wide
            title="Handwriting Mode"
            desc="Type naturally in Caveat — a handwritten font. Keep your canvas human. W to activate."
            color="rgba(0,122,255,0.12)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>}
          />
          <FeatureCard
            title="Rough.js Shapes"
            desc="Every rect, circle, and arrow has a hand-drawn wobble. Feels alive."
            color="rgba(52,199,89,0.12)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>}
          />
          <FeatureCard
            title="Region Export"
            desc="Draw a box, pick 1×/2×/3× scale, download PNG or JPEG. Pixel-perfect."
            color="rgba(255,149,0,0.12)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
          />
          <FeatureCard
            title="Sticky Notes"
            desc="Seven Post-it colors, Caveat font, folded corners. Organize chaos beautifully."
            color="rgba(255,45,85,0.10)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF2D55" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          />
          <FeatureCard
            title="Live Collab"
            desc="Real-time cursors, 80ms sync, presence avatars. Open a URL together."
            color="rgba(175,82,222,0.10)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AF52DE" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
          />
          <FeatureCard
            title="Two Themes"
            desc="iOS light (#F2F2F7) or pure dark (#000). Auto-smoothed fonts everywhere."
            color="rgba(0,122,255,0.08)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>}
          />
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────────── */}
      <section
        className="mx-4 mb-24 rounded-[24px] overflow-hidden text-center relative"
        style={{
          background: 'linear-gradient(135deg, #1C1C1E 0%, #000000 100%)',
          padding: '72px 48px',
          maxWidth: 960,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,122,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: 40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(52,199,89,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(0,122,255,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, position: 'relative' }}>✦ For teams</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 20, position: 'relative' }}>
          Where great teams<br />do their best thinking
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 17, color: 'rgba(235,235,245,0.6)', maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.6, position: 'relative' }}>
          Infinite canvas, real-time cursors, zero setup. Share a link and start building — right now.
        </p>
        <Link
          href="/board"
          className="primary-button"
          style={{ fontSize: 17, padding: '14px 28px', borderRadius: 14, textDecoration: 'none', position: 'relative' }}
        >
          Open Inkspace — it&apos;s free
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="px-8 py-12" style={{ borderTop: '0.5px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8" style={{ maxWidth: 960, margin: '0 auto' }}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center rounded-[7px]" style={{ width: 24, height: 24, background: 'var(--accent)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Inkspace</span>
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', maxWidth: 220 }}>Your thoughts, unfiltered.</p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              { label: 'Product', links: ['Features', 'Pricing', 'Changelog'] },
              { label: 'Company', links: ['About', 'Blog', 'Careers'] },
              { label: 'Legal',   links: ['Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.label}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{col.label}</div>
                <div className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <a key={l} href="#" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 pt-6 text-center" style={{ borderTop: '0.5px solid var(--border)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 Inkspace. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
