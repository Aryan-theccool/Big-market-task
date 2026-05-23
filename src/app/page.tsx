'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const BG      = '#FFFFFF';
const BG2     = '#F7F6F3';
const BORDER  = 'rgba(0,0,0,0.08)';
const ACCENT  = '#5E5CE6';
const ACCENTL = 'rgba(94,92,230,0.1)';
const T1      = '#111111';
const T2      = 'rgba(17,17,17,0.55)';
const T3      = 'rgba(17,17,17,0.32)';
const FD      = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FM      = "'Fira Code', ui-monospace, monospace";

/* ─── Animated canvas hero preview ──────────────────────────────────────── */
function HeroCanvas() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 3600), 50);
    return () => clearInterval(id);
  }, []);

  const notes = [
    { x: 22,  y: 20,  rot: -3, bg: '#FFF9C4', text: 'User research' },
    { x: 200, y: 10,  rot: 2,  bg: '#DBEAFE', text: 'Sprint goals'  },
    { x: 400, y: 24,  rot: -1, bg: '#EDE9FE', text: 'Ship it!'      },
    { x: 28,  y: 155, rot: 1,  bg: '#DCFCE7', text: 'Brand palette' },
    { x: 285, y: 145, rot: -2, bg: '#FFE4E6', text: 'Feedback'      },
  ];

  const cursors = [
    { name: 'Priya', color: '#EF4444', bx: 185, by: 110 },
    { name: 'James', color: '#10B981', bx: 355, by: 88  },
  ];

  return (
    <div style={{
      width: '100%', height: 300, borderRadius: 20, overflow: 'hidden', position: 'relative',
      background: '#F8F8F6',
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      border: '1.5px solid rgba(0,0,0,0.1)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.12)',
    }}>
      {notes.map((n, i) => (
        <div key={i} style={{
          position: 'absolute', left: n.x, top: n.y, padding: '9px 12px',
          background: n.bg, borderRadius: 10, transform: `rotate(${n.rot}deg)`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          fontFamily: "'Caveat', cursive", fontSize: 14, color: '#1C1C1E', lineHeight: 1.3,
          userSelect: 'none', whiteSpace: 'nowrap',
        }}>{n.text}</div>
      ))}

      {/* Simple flowchart box */}
      <div style={{ position: 'absolute', left: 200, top: 155, width: 145, height: 44, background: '#fff', border: '2px solid ' + ACCENT, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FD, fontSize: 12, fontWeight: 600, color: ACCENT, boxShadow: '0 2px 8px rgba(94,92,230,0.12)' }}>
        Design System
      </div>

      {/* Connecting arrow */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          <marker id="ah1" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 L1,2.5Z" fill={ACCENT}/>
          </marker>
        </defs>
        <path d="M150 52 Q190 120 200 174" stroke={ACCENT} strokeWidth="2" fill="none" strokeDasharray="5 3" markerEnd="url(#ah1)" opacity="0.6"/>
        <path d="M348 172 Q375 165 400 50" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.5"/>
      </svg>

      {/* Code snippet */}
      <div style={{ position: 'absolute', right: 16, bottom: 16, width: 160, background: '#1C1C1E', borderRadius: 10, padding: '9px 13px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
        <div style={{ fontFamily: FM, fontSize: 10, lineHeight: 1.75 }}>
          <div><span style={{ color: '#64D2FF' }}>const</span> <span style={{ color: '#FFD60A' }}>canvas</span> = {}</div>
          <div style={{ color: '#30D158' }}>  infinite()</div>
          <div style={{ color: '#98989E' }}>  // no limits</div>
        </div>
      </div>

      {cursors.map(c => {
        const cx = c.bx + Math.sin(tick * 0.019) * 22;
        const cy = c.by + Math.cos(tick * 0.016) * 14;
        return (
          <div key={c.name} style={{ position: 'absolute', left: cx, top: cy, pointerEvents: 'none', zIndex: 20, transition: 'left 55ms linear, top 55ms linear' }}>
            <svg width="13" height="17" viewBox="0 0 13 17">
              <path d="M0 0 L10 6.5 L6 7.8 L4.5 13 Z" fill={c.color} stroke="white" strokeWidth="0.7"/>
            </svg>
            <div style={{ background: c.color, color: 'white', fontSize: 9, fontWeight: 700, fontFamily: FD, padding: '2px 7px', borderRadius: 20, marginLeft: 9, marginTop: 1, whiteSpace: 'nowrap', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>{c.name}</div>
          </div>
        );
      })}

      {/* Live badge */}
      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: 100, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, fontFamily: FD, color: T1, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}/>
        2 collaborating
      </div>

      {/* Zoom indicator */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontFamily: FD, fontWeight: 600, color: T2, display: 'flex', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <span>-</span><span>100%</span><span>+</span>
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 58,
      background: scrolled ? 'rgba(255,255,255,0.92)' : BG,
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}`,
      transition: 'background 0.25s, border-color 0.25s',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: FD, fontSize: 17, fontWeight: 700, color: T1, letterSpacing: '-0.01em' }}>Inkspace</span>
        </a>

        <div className="hidden md:flex" style={{ gap: 2 }}>
          {['Features', 'Templates', 'Pricing', 'Community'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: FD, fontSize: 14, fontWeight: 500, color: T2, padding: '6px 13px', borderRadius: 8, textDecoration: 'none', transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.background = BG2; }}
              onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.background = 'transparent'; }}>
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/boards" style={{ fontFamily: FD, fontSize: 14, fontWeight: 500, color: T2, textDecoration: 'none', padding: '7px 14px', borderRadius: 8, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = T1)}
            onMouseLeave={e => (e.currentTarget.style.color = T2)}>
            Log in
          </Link>
          <Link href="/boards" style={{ fontFamily: FD, fontSize: 14, fontWeight: 700, color: 'white', background: ACCENT, textDecoration: 'none', padding: '8px 20px', borderRadius: 10, border: 'none', display: 'inline-flex', alignItems: 'center', boxShadow: `0 2px 12px ${ACCENTL}`, transition: 'opacity 0.15s, transform 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ paddingTop: 100, paddingBottom: 80, textAlign: 'center', background: BG }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: ACCENTL, border: `1px solid rgba(94,92,230,0.2)`, borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }}/>
          <span style={{ fontFamily: FD, fontSize: 12, fontWeight: 600, color: ACCENT }}>Now with real-time collaboration</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: FD, fontSize: 'clamp(44px, 7.5vw, 80px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', lineHeight: 1.06, marginBottom: 22, animation: 'fade-slide-up 0.45s both' }}>
          Your ideas deserve<br/>
          <span style={{ color: ACCENT }}>infinite space.</span>
        </h1>

        {/* Sub */}
        <p style={{ fontFamily: FD, fontSize: 'clamp(16px, 2vw, 20px)', color: T2, lineHeight: 1.65, maxWidth: 520, margin: '0 auto 40px', animation: 'fade-slide-up 0.45s 0.1s both' }}>
          Sketch, collaborate, and brainstorm on a beautiful infinite canvas. Like Freeform and Excalidraw — but better.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 60, animation: 'fade-slide-up 0.45s 0.18s both' }}>
          <Link href="/boards" style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: 'white', background: ACCENT, textDecoration: 'none', padding: '13px 32px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 24px rgba(94,92,230,0.35)`, transition: 'transform 0.12s, box-shadow 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(94,92,230,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 24px rgba(94,92,230,0.35)`; }}>
            Start Creating
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="#features" style={{ fontFamily: FD, fontSize: 16, fontWeight: 600, color: T1, background: 'transparent', border: `1.5px solid ${BORDER}`, textDecoration: 'none', padding: '13px 28px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s, border-color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = BG2; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = BORDER; }}>
            See features
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </a>
        </div>

        {/* Canvas preview */}
        <div style={{ animation: 'fade-slide-up 0.6s 0.26s both', maxWidth: 680, margin: '0 auto' }}>
          <HeroCanvas />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 44px', marginTop: 40 }}>
          {[{ v: '12k+', l: 'Active boards' }, { v: '80ms', l: 'Sync latency' }, { v: '4.9 / 5', l: 'User rating' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FD, fontSize: 24, fontWeight: 800, color: T1, letterSpacing: '-0.03em' }}>{s.v}</div>
              <div style={{ fontFamily: FD, fontSize: 12, color: T3, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────── */
function Features() {
  const cards = [
    { icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      ), title: 'Infinite Canvas', desc: 'Pan and zoom across an unlimited workspace. No page boundaries, no limits to your ideas.' },
    { icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
      ), title: 'Real-time Collab', desc: 'See live cursors of collaborators. Share a link and start working together instantly.' },
    { icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16l4-4h10a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      ), title: 'Sticky Notes', desc: 'Post-it style notes in 7 colors. Write freely with the Caveat handwritten font.' },
    { icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
      ), title: 'Drawing Tools', desc: 'Freehand pen, shapes with hand-drawn wobble, text, arrows, frames and more.' },
    { icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      ), title: 'Export', desc: 'Export any region as PNG or JPEG at 1x, 2x, or 3x resolution. Pixel-perfect output.' },
    { icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      ), title: 'Light & Dark', desc: 'Seamless theme switching. iOS light or pure dark — your canvas, your preference.' },
  ];

  return (
    <section id="features" style={{ padding: '96px 24px', background: BG2 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, color: T1, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Everything you need to think visually
          </h2>
          <p style={{ fontFamily: FD, fontSize: 17, color: T2, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
            Built for makers, designers, and teams who think in diagrams.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {cards.map(c => (
            <div key={c.title} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '28px 26px', transition: 'box-shadow 0.2s, transform 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
              <div style={{ marginBottom: 18 }}>{c.icon}</div>
              <div style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: T1, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontFamily: FD, fontSize: 14, color: T2, lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Canvas showcase ────────────────────────────────────────────────────── */
function CanvasShowcase() {
  const points = [
    { label: 'Infinite zoom', desc: 'From bird-eye overview to pixel-level detail at 60 fps.' },
    { label: 'Hand-drawn shapes', desc: 'Rough.js gives every rect, circle, and arrow a human touch.' },
    { label: 'Keyboard-first', desc: 'Press V, H, N, T, R, C, A, D and more to switch tools instantly.' },
    { label: 'Snap & grid', desc: 'Smart snapping to grid, objects, and centers. Hold Shift to constrain.' },
  ];

  return (
    <section style={{ padding: '96px 24px', background: BG }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
        {/* Text side */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }}/>
            <span style={{ fontFamily: FD, fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Canvas</span>
          </div>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: T1, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            A canvas that grows with your thinking.
          </h2>
          <p style={{ fontFamily: FD, fontSize: 16, color: T2, lineHeight: 1.65, marginBottom: 36 }}>
            No page boundaries, no export friction. Just you and an infinite surface to explore.
          </p>
          {points.map(p => (
            <div key={p.label} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: ACCENTL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: FD, fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3 }}>{p.label}</div>
                <div style={{ fontFamily: FD, fontSize: 13, color: T2, lineHeight: 1.55 }}>{p.desc}</div>
              </div>
            </div>
          ))}
          <Link href="/boards" style={{ marginTop: 8, fontFamily: FD, fontSize: 15, fontWeight: 700, color: 'white', background: ACCENT, textDecoration: 'none', padding: '11px 24px', borderRadius: 11, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Try the canvas
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Visual side */}
        <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.09)', background: '#F8F8F6' }}>
          <div style={{ background: 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${BORDER}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }}/>)}
            </div>
            <div style={{ flex: 1, background: BG, borderRadius: 6, padding: '3px 12px', fontSize: 11, fontFamily: FM, color: T3, border: `1px solid ${BORDER}` }}>
              inkspace.app/board/abc123
            </div>
          </div>
          <div style={{ height: 280, position: 'relative',
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)',
            backgroundSize: '24px 24px' }}>
            {[
              { x: 20, y: 20, rot: -2, bg: '#FFF9C4', w: 115, h: 64, text: 'Idea #1' },
              { x: 160, y: 10, rot: 2, bg: '#DBEAFE', w: 110, h: 60, text: 'Research' },
              { x: 290, y: 25, rot: -1, bg: '#EDE9FE', w: 100, h: 58, text: 'Wireframe' },
              { x: 30, y: 120, rot: 1, bg: '#DCFCE7', w: 108, h: 62, text: 'User story' },
            ].map((n, i) => (
              <div key={i} style={{ position: 'absolute', left: n.x, top: n.y, width: n.w, height: n.h, background: n.bg, borderRadius: 10, transform: `rotate(${n.rot}deg)`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Caveat', cursive", fontSize: 15, color: '#1C1C1E' }}>
                {n.text}
              </div>
            ))}
            <div style={{ position: 'absolute', left: 165, top: 130, width: 140, height: 44, background: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FD, fontSize: 12, fontWeight: 600, color: ACCENT }}>
              Design System
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Collaboration ──────────────────────────────────────────────────────── */
function Collaboration() {
  return (
    <section style={{ padding: '96px 24px', background: BG2 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}/>
            <span style={{ fontFamily: FD, fontSize: 12, fontWeight: 700, color: '#10B981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Collaboration</span>
          </div>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: T1, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Build together in real time.
          </h2>
          <p style={{ fontFamily: FD, fontSize: 17, color: T2, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            Share a link. See everyone's cursors. Edit together without conflicts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { color: '#EF4444', title: 'Live cursors', desc: 'See named, colored cursors for every collaborator in real time. No lag.' },
            { color: '#10B981', title: 'Instant sync', desc: 'Every stroke, move, and edit syncs in under 80ms across all participants.' },
            { color: '#F59E0B', title: 'Presence avatars', desc: 'See who is on the canvas at a glance. Avatars stack in the header.' },
            { color: '#8B5CF6', title: 'No account needed', desc: 'Just share the URL. Anyone can join and collaborate, no sign-up required.' },
          ].map(f => (
            <div key={f.title} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '26px 22px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color, marginBottom: 16 }}/>
              <div style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: T1, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontFamily: FD, fontSize: 13, color: T2, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Template Previews (inline SVG whiteboards) ─────────────────────────── */
function PreviewStartup() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FFF5F5"/>
      <defs><pattern id="g1" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.8" fill="#FECDD3"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g1)"/>
      {/* Lean canvas grid */}
      <rect x="8" y="8" width="264" height="96" fill="white" rx="4" opacity="0.9"/>
      <line x1="64" y1="8" x2="64" y2="104" stroke="#FCA5A5" strokeWidth="0.7"/>
      <line x1="120" y1="8" x2="120" y2="104" stroke="#FCA5A5" strokeWidth="0.7"/>
      <line x1="176" y1="8" x2="176" y2="104" stroke="#FCA5A5" strokeWidth="0.7"/>
      <line x1="224" y1="8" x2="224" y2="104" stroke="#FCA5A5" strokeWidth="0.7"/>
      <line x1="8" y1="56" x2="272" y2="56" stroke="#FCA5A5" strokeWidth="0.7"/>
      <text x="12" y="18" fill="#F43F5E" fontSize="5" fontWeight="bold">PROBLEM</text>
      <text x="68" y="18" fill="#F43F5E" fontSize="5" fontWeight="bold">SOLUTION</text>
      <text x="124" y="18" fill="#F43F5E" fontSize="5" fontWeight="bold">UNIQUE VALUE</text>
      <text x="180" y="18" fill="#F43F5E" fontSize="5" fontWeight="bold">ADVANTAGE</text>
      <text x="228" y="18" fill="#F43F5E" fontSize="5" fontWeight="bold">SEGMENTS</text>
      <text x="12" y="62" fill="#F43F5E" fontSize="5" fontWeight="bold">CHANNELS</text>
      <text x="90" y="62" fill="#F43F5E" fontSize="5" fontWeight="bold">REVENUE STREAMS</text>
      <text x="190" y="62" fill="#F43F5E" fontSize="5" fontWeight="bold">COST STRUCTURE</text>
      <rect x="11" y="22" width="48" height="14" fill="#FFD6DB" rx="2"/>
      <text x="14" y="30" fill="#9F1239" fontSize="4.5">No collab tools</text>
      <rect x="11" y="38" width="48" height="14" fill="#FFD6DB" rx="2"/>
      <text x="14" y="46" fill="#9F1239" fontSize="4.5">Too expensive</text>
      <rect x="68" y="22" width="48" height="28" fill="#FEE2E2" rx="2"/>
      <text x="71" y="30" fill="#9F1239" fontSize="4.5">Real-time</text>
      <text x="71" y="37" fill="#9F1239" fontSize="4.5">canvas board</text>
      <text x="71" y="44" fill="#9F1239" fontSize="4.5">+ AI assist</text>
      <rect x="228" y="22" width="48" height="13" fill="#FECDD3" rx="2"/>
      <text x="231" y="30" fill="#9F1239" fontSize="4.5">Designers</text>
      <rect x="228" y="37" width="48" height="13" fill="#FECDD3" rx="2"/>
      <text x="231" y="45" fill="#9F1239" fontSize="4.5">Eng Teams</text>
      {/* SWOT below */}
      <rect x="8" y="108" width="64" height="44" fill="#FFF0F0" rx="4"/>
      <text x="12" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">STRENGTHS</text>
      <text x="12" y="128" fill="#9F1239" fontSize="4.5">Fast iteration</text>
      <text x="12" y="136" fill="#9F1239" fontSize="4.5">Low cost infra</text>
      <rect x="76" y="108" width="64" height="44" fill="#FEF3F3" rx="4"/>
      <text x="80" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">WEAKNESSES</text>
      <text x="80" y="128" fill="#9F1239" fontSize="4.5">Small team</text>
      <rect x="144" y="108" width="64" height="44" fill="#FFF5F5" rx="4"/>
      <text x="148" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">OPPORTUNITY</text>
      <text x="148" y="128" fill="#9F1239" fontSize="4.5">Remote work</text>
      <text x="148" y="136" fill="#9F1239" fontSize="4.5">boom</text>
      <rect x="212" y="108" width="60" height="44" fill="#FEE2E2" rx="4"/>
      <text x="216" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">THREATS</text>
      <text x="216" y="128" fill="#9F1239" fontSize="4.5">Miro, Figma</text>
    </svg>
  );
}

function PreviewSystemDesign() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#0F172A"/>
      <defs><pattern id="g2" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="#1E40AF" opacity="0.6"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g2)"/>
      {/* Load Balancer */}
      <rect x="112" y="8" width="56" height="22" fill="#1D4ED8" rx="4" stroke="#60A5FA" strokeWidth="1"/>
      <text x="115" y="20" fill="#BFDBFE" fontSize="5" fontWeight="bold">Load Balancer</text>
      {/* Arrows down */}
      <line x1="124" y1="30" x2="60" y2="48" stroke="#60A5FA" strokeWidth="1" markerEnd="url(#arr2)"/>
      <line x1="140" y1="30" x2="140" y2="48" stroke="#60A5FA" strokeWidth="1" markerEnd="url(#arr2)"/>
      <line x1="156" y1="30" x2="220" y2="48" stroke="#60A5FA" strokeWidth="1" markerEnd="url(#arr2)"/>
      <defs><marker id="arr2" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4Z" fill="#60A5FA"/></marker></defs>
      {/* 3 API Services */}
      <rect x="28" y="48" width="60" height="20" fill="#1E3A8A" rx="3" stroke="#3B82F6" strokeWidth="0.8"/>
      <text x="32" y="60" fill="#93C5FD" fontSize="4.8">Auth Service</text>
      <rect x="110" y="48" width="60" height="20" fill="#1E3A8A" rx="3" stroke="#3B82F6" strokeWidth="0.8"/>
      <text x="114" y="60" fill="#93C5FD" fontSize="4.8">API Gateway</text>
      <rect x="192" y="48" width="60" height="20" fill="#1E3A8A" rx="3" stroke="#3B82F6" strokeWidth="0.8"/>
      <text x="196" y="60" fill="#93C5FD" fontSize="4.8">Media Service</text>
      {/* DB cylinders */}
      <ellipse cx="58" cy="96" rx="20" ry="5" fill="#0C4A6E" stroke="#0EA5E9" strokeWidth="0.8"/>
      <rect x="38" y="96" width="40" height="20" fill="#075985" stroke="#0EA5E9" strokeWidth="0.8"/>
      <ellipse cx="58" cy="116" rx="20" ry="5" fill="#0C4A6E" stroke="#0EA5E9" strokeWidth="0.8"/>
      <text x="48" y="109" fill="#7DD3FC" fontSize="4.5">PostgreSQL</text>
      <ellipse cx="140" cy="96" rx="20" ry="5" fill="#14532D" stroke="#22C55E" strokeWidth="0.8"/>
      <rect x="120" y="96" width="40" height="20" fill="#166534" stroke="#22C55E" strokeWidth="0.8"/>
      <ellipse cx="140" cy="116" rx="20" ry="5" fill="#14532D" stroke="#22C55E" strokeWidth="0.8"/>
      <text x="131" y="109" fill="#86EFAC" fontSize="4.5">Redis</text>
      <ellipse cx="222" cy="96" rx="20" ry="5" fill="#1E1B4B" stroke="#818CF8" strokeWidth="0.8"/>
      <rect x="202" y="96" width="40" height="20" fill="#1E1B4B" stroke="#818CF8" strokeWidth="0.8"/>
      <ellipse cx="222" cy="116" rx="20" ry="5" fill="#1E1B4B" stroke="#818CF8" strokeWidth="0.8"/>
      <text x="213" y="109" fill="#C7D2FE" fontSize="4.5">S3 Blob</text>
      {/* connection lines */}
      <line x1="58" y1="68" x2="58" y2="91" stroke="#60A5FA" strokeWidth="0.7" strokeDasharray="3 2"/>
      <line x1="140" y1="68" x2="140" y2="91" stroke="#60A5FA" strokeWidth="0.7" strokeDasharray="3 2"/>
      <line x1="222" y1="68" x2="222" y2="91" stroke="#60A5FA" strokeWidth="0.7" strokeDasharray="3 2"/>
      {/* Queue */}
      <rect x="60" y="136" width="160" height="18" fill="#111827" rx="3" stroke="#F59E0B" strokeWidth="0.8"/>
      <text x="115" y="147" fill="#FCD34D" fontSize="5" fontWeight="bold">Message Queue (Kafka)</text>
      <line x1="140" y1="121" x2="140" y2="136" stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="3 2"/>
    </svg>
  );
}

function PreviewDSA() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#1C1A00"/>
      <defs><pattern id="g3" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#A16207" opacity="0.5"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g3)"/>
      {/* Binary tree */}
      <circle cx="72" cy="20" r="11" fill="#854D0E" stroke="#FDE047" strokeWidth="1.2"/>
      <text x="68" y="24" fill="#FEF08A" fontSize="8" fontWeight="bold">8</text>
      <circle cx="36" cy="50" r="10" fill="#713F12" stroke="#FACC15" strokeWidth="1"/>
      <text x="32" y="54" fill="#FDE047" fontSize="8">3</text>
      <circle cx="108" cy="50" r="10" fill="#713F12" stroke="#FACC15" strokeWidth="1"/>
      <text x="104" y="54" fill="#FDE047" fontSize="8">12</text>
      <circle cx="18" cy="82" r="9" fill="#422006" stroke="#EAB308" strokeWidth="1"/>
      <text x="14" y="86" fill="#FDE047" fontSize="8">1</text>
      <circle cx="54" cy="82" r="9" fill="#422006" stroke="#EAB308" strokeWidth="1"/>
      <text x="50" y="86" fill="#FDE047" fontSize="8">6</text>
      <circle cx="90" cy="82" r="9" fill="#422006" stroke="#EAB308" strokeWidth="1"/>
      <text x="86" y="86" fill="#FDE047" fontSize="8">9</text>
      <circle cx="126" cy="82" r="9" fill="#422006" stroke="#EAB308" strokeWidth="1"/>
      <text x="119" y="86" fill="#FDE047" fontSize="7">15</text>
      <line x1="63" y1="28" x2="44" y2="42" stroke="#FACC15" strokeWidth="1"/>
      <line x1="81" y1="28" x2="100" y2="42" stroke="#FACC15" strokeWidth="1"/>
      <line x1="28" y1="58" x2="24" y2="74" stroke="#EAB308" strokeWidth="1"/>
      <line x1="44" y1="58" x2="48" y2="74" stroke="#EAB308" strokeWidth="1"/>
      <line x1="100" y1="58" x2="96" y2="74" stroke="#EAB308" strokeWidth="1"/>
      <line x1="116" y1="58" x2="120" y2="74" stroke="#EAB308" strokeWidth="1"/>
      {/* BFS order label */}
      <rect x="8" y="100" width="136" height="14" fill="#1C1A00" rx="3" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="12" y="110" fill="#FDE047" fontSize="5">BFS: 8 → 3 → 12 → 1 → 6 → 9 → 15</text>
      {/* Complexity box */}
      <rect x="152" y="8" width="120" height="56" fill="#0C0A00" rx="4" stroke="#EAB308" strokeWidth="1"/>
      <text x="158" y="20" fill="#FDE047" fontSize="5" fontWeight="bold">Complexity Analysis</text>
      <text x="158" y="32" fill="#D97706" fontSize="5">Search: O(log n)</text>
      <text x="158" y="42" fill="#D97706" fontSize="5">Insert: O(log n)</text>
      <text x="158" y="52" fill="#D97706" fontSize="5">Space:  O(n)</text>
      {/* Linked list */}
      <rect x="152" y="72" width="24" height="16" fill="#292524" rx="2" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="158" y="82" fill="#FDE047" fontSize="6" fontWeight="bold">4</text>
      <line x1="176" y1="80" x2="184" y2="80" stroke="#EAB308" strokeWidth="1" markerEnd="url(#arrd)"/>
      <rect x="184" y="72" width="24" height="16" fill="#292524" rx="2" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="190" y="82" fill="#FDE047" fontSize="6" fontWeight="bold">8</text>
      <line x1="208" y1="80" x2="216" y2="80" stroke="#EAB308" strokeWidth="1" markerEnd="url(#arrd)"/>
      <rect x="216" y="72" width="24" height="16" fill="#292524" rx="2" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="222" y="82" fill="#FDE047" fontSize="6" fontWeight="bold">15</text>
      <line x1="240" y1="80" x2="248" y2="80" stroke="#EAB308" strokeWidth="1"/>
      <text x="249" y="83" fill="#EAB308" fontSize="9">∅</text>
      <defs><marker id="arrd" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4Z" fill="#EAB308"/></marker></defs>
      <text x="156" y="66" fill="#A16207" fontSize="4.5">Linked List:</text>
      {/* DFS note */}
      <rect x="152" y="100" width="120" height="52" fill="#111000" rx="4" stroke="#CA8A04" strokeWidth="0.8"/>
      <text x="157" y="112" fill="#FDE047" fontSize="4.8" fontWeight="bold">DFS Inorder Traversal</text>
      <text x="157" y="123" fill="#A16207" fontSize="4.5">Stack-based approach</text>
      <text x="157" y="133" fill="#A16207" fontSize="4.5">Left → Root → Right</text>
      <text x="157" y="143" fill="#D97706" fontSize="4.5">Result: 1,3,6,8,9,12,15</text>
    </svg>
  );
}

function PreviewUserJourney() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#F0FDF9"/>
      <defs><pattern id="g4" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#6EE7B7" opacity="0.5"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g4)"/>
      {/* Stage headers */}
      {[['Aware','#0D9488'],['Consider','#0891B2'],['Purchase','#0E7490'],['Retain','#0D9488'],['Advocate','#059669']].map(([s,c],i) => (
        <g key={s}>
          <rect x={8+i*54} y="6" width="50" height="18" fill={c} rx="4"/>
          <text x={11+i*54} y="18" fill="white" fontSize="5" fontWeight="bold">{s}</text>
        </g>
      ))}
      {/* Emotion curve */}
      <path d="M12 70 Q40 45 66 65 Q80 75 92 55 Q110 30 120 50 Q136 65 148 52 Q162 38 174 60 Q188 75 200 58 Q216 42 228 55 Q244 65 268 48"
        stroke="#0D9488" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="12" cy="70" r="3" fill="#14B8A6"/>
      <circle cx="66" cy="65" r="3" fill="#14B8A6"/>
      <circle cx="120" cy="50" r="3" fill="#14B8A6"/>
      <circle cx="174" cy="60" r="3" fill="#14B8A6"/>
      <circle cx="228" cy="55" r="3" fill="#14B8A6"/>
      <text x="4" y="88" fill="#0D9488" fontSize="4.5" fontWeight="bold">Emotion</text>
      <line x1="4" y1="90" x2="4" y2="30" stroke="#0D9488" strokeWidth="0.7"/>
      {/* Touchpoint cards */}
      {[
        ['Social Ad','#F0FDFA','#14B8A6'],
        ['Website','#ECFDF5','#059669'],
        ['Checkout','#F0FDF9','#0D9488'],
        ['Email','#F0FDFA','#0891B2'],
        ['Referral','#ECFDF5','#0E7490'],
      ].map(([label,bg,border],i) => (
        <g key={label}>
          <rect x={8+i*54} y="100" width="50" height="22" fill={bg} rx="3" stroke={border} strokeWidth="0.8"/>
          <text x={11+i*54} y="113" fill={border} fontSize="5">{label}</text>
        </g>
      ))}
      {/* Pain points */}
      <rect x="65" y="126" width="52" height="16" fill="#FEF2F2" rx="3" stroke="#F87171" strokeWidth="0.8"/>
      <text x="68" y="136" fill="#EF4444" fontSize="4.5">Pain: slow load</text>
      <rect x="8" y="126" width="52" height="16" fill="#F0FDF4" rx="3" stroke="#4ADE80" strokeWidth="0.8"/>
      <text x="11" y="136" fill="#16A34A" fontSize="4.5">Happy: quick</text>
      <rect x="172" y="126" width="52" height="16" fill="#FFF7ED" rx="3" stroke="#FB923C" strokeWidth="0.8"/>
      <text x="175" y="136" fill="#EA580C" fontSize="4.5">NPS survey</text>
      <rect x="228" y="126" width="44" height="16" fill="#ECFDF5" rx="3" stroke="#34D399" strokeWidth="0.8"/>
      <text x="231" y="136" fill="#059669" fontSize="4.5">Referrals</text>
    </svg>
  );
}

function PreviewRoadmap() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FAF5FF"/>
      <defs><pattern id="g5" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#C4B5FD" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g5)"/>
      {/* Quarter headers */}
      {[['Q1','#7C3AED'],['Q2','#9333EA'],['Q3','#A855F7'],['Q4','#C026D3']].map(([q,c],i) => (
        <g key={q}>
          <rect x={8+i*68} y="6" width="64" height="20" fill={c} rx="5"/>
          <text x={28+i*68} y="20" fill="white" fontSize="8" fontWeight="bold">{q}</text>
        </g>
      ))}
      {/* Feature rows */}
      {[
        { label: 'Auth', spans: [1,0,0,0], color: '#7C3AED' },
        { label: 'Dashboard', spans: [1,1,0,0], color: '#9333EA' },
        { label: 'API v2', spans: [0,1,1,0], color: '#A855F7' },
        { label: 'Mobile', spans: [0,0,1,1], color: '#C026D3' },
        { label: 'Analytics', spans: [0,0,0,1], color: '#DB2777' },
      ].map((row, ri) => (
        <g key={row.label}>
          <text x="8" y={38+ri*20} fill="#6B21A8" fontSize="5" fontWeight="600" dominantBaseline="middle">{row.label}</text>
          {row.spans.map((on, qi) => on ? (
            <g key={qi}>
              <rect x={34+qi*68} y={30+ri*20} width="56" height="12" fill={row.color} rx="3" opacity="0.8"/>
              <rect x={34+qi*68} y={30+ri*20} width={`${30+Math.random()*20}`} height="12" fill={row.color} rx="3"/>
            </g>
          ) : null)}
        </g>
      ))}
      {/* Priority tags */}
      <rect x="8" y="134" width="36" height="12" fill="#EDE9FE" rx="10"/>
      <text x="13" y="142" fill="#7C3AED" fontSize="4.5" fontWeight="600">P0 urgent</text>
      <rect x="48" y="134" width="32" height="12" fill="#F3E8FF" rx="10"/>
      <text x="53" y="142" fill="#9333EA" fontSize="4.5" fontWeight="600">P1 high</text>
      <rect x="84" y="134" width="30" height="12" fill="#FAF5FF" rx="10"/>
      <text x="89" y="142" fill="#A855F7" fontSize="4.5" fontWeight="600">P2 med</text>
      {/* Progress bars */}
      <text x="138" y="138" fill="#6B21A8" fontSize="4.5">Sprint 12 of 16</text>
      <rect x="138" y="143" width="80" height="5" fill="#EDE9FE" rx="2.5"/>
      <rect x="138" y="143" width="60" height="5" fill="#7C3AED" rx="2.5"/>
      <rect x="222" y="134" width="50" height="18" fill="#7C3AED" rx="4"/>
      <text x="228" y="145" fill="white" fontSize="5">On Track</text>
    </svg>
  );
}

function PreviewBrainstorm() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FFFBEB"/>
      <defs><pattern id="g6" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#FCD34D" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g6)"/>
      {/* Central idea */}
      <ellipse cx="140" cy="80" rx="36" ry="22" fill="#F97316" stroke="#EA580C" strokeWidth="1.5"/>
      <text x="121" y="76" fill="white" fontSize="6" fontWeight="bold">CENTRAL</text>
      <text x="125" y="86" fill="white" fontSize="6" fontWeight="bold">IDEA</text>
      {/* Surrounding notes */}
      <rect x="8" y="8" width="68" height="26" fill="#FEF9C3" rx="5" stroke="#EAB308" strokeWidth="1" transform="rotate(-5,42,21)"/>
      <text x="16" y="22" fill="#92400E" fontSize="5.5">User Research</text>
      <text x="16" y="30" fill="#B45309" fontSize="4.5">→ 20 interviews</text>
      <rect x="204" y="10" width="64" height="24" fill="#DBEAFE" rx="5" stroke="#3B82F6" strokeWidth="1" transform="rotate(4,236,22)"/>
      <text x="210" y="24" fill="#1E40AF" fontSize="5.5">Market Size</text>
      <rect x="4" y="114" width="72" height="26" fill="#DCFCE7" rx="5" stroke="#22C55E" strokeWidth="1" transform="rotate(3,40,127)"/>
      <text x="12" y="128" fill="#166534" fontSize="5.5">Tech Stack</text>
      <text x="12" y="136" fill="#166534" fontSize="4.5">Next.js + Y.js</text>
      <rect x="206" y="118" width="68" height="26" fill="#EDE9FE" rx="5" stroke="#8B5CF6" strokeWidth="1" transform="rotate(-4,240,131)"/>
      <text x="212" y="132" fill="#4C1D95" fontSize="5.5">Revenue Model</text>
      <rect x="8" y="62" width="66" height="24" fill="#FFE4E6" rx="5" stroke="#F43F5E" strokeWidth="1" transform="rotate(-3,41,74)"/>
      <text x="14" y="76" fill="#9F1239" fontSize="5.5">Competitor Gap</text>
      <rect x="208" y="65" width="66" height="24" fill="#FEF3C7" rx="5" stroke="#F59E0B" strokeWidth="1" transform="rotate(3,241,77)"/>
      <text x="213" y="79" fill="#92400E" fontSize="5.5">Growth Hacks</text>
      {/* Connecting arrows */}
      <line x1="76" y1="21" x2="108" y2="64" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="204" y1="22" x2="172" y2="63" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="76" y1="127" x2="108" y2="96" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="206" y1="131" x2="174" y2="96" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="74" y1="74" x2="104" y2="79" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="208" y1="77" x2="176" y2="79" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      {/* Vote dots */}
      {[12,16,20].map((x,i) => <circle key={i} cx={x} cy="150" r="5" fill={['#F97316','#EAB308','#22C55E'][i]}/>)}
      <text x="30" y="153" fill="#92400E" fontSize="4.5">Team voted: 3 ideas shortlisted</text>
    </svg>
  );
}

function PreviewAIWorkflow() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#0A0E1A"/>
      <defs>
        <pattern id="g7" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.6" fill="#3B82F6" opacity="0.3"/></pattern>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="280" height="160" fill="url(#g7)"/>
      {/* Nodes */}
      <circle cx="32" cy="80" r="18" fill="#0D1B3E" stroke="#3B82F6" strokeWidth="1.5" filter="url(#glow)"/>
      <text x="23" y="77" fill="#60A5FA" fontSize="4.5" fontWeight="bold">Input</text>
      <text x="22" y="85" fill="#93C5FD" fontSize="4">Prompt</text>
      <circle cx="100" cy="40" r="16" fill="#0D1B3E" stroke="#8B5CF6" strokeWidth="1.5" filter="url(#glow)"/>
      <text x="89" y="37" fill="#A78BFA" fontSize="4.5" fontWeight="bold">Claude</text>
      <text x="91" y="46" fill="#C4B5FD" fontSize="4">Opus 4</text>
      <circle cx="100" cy="120" r="16" fill="#0D1B3E" stroke="#10B981" strokeWidth="1.5" filter="url(#glow)"/>
      <text x="90" y="117" fill="#34D399" fontSize="4.5" fontWeight="bold">Tools</text>
      <text x="90" y="126" fill="#6EE7B7" fontSize="4">Web/Code</text>
      <circle cx="180" cy="80" r="18" fill="#0D1B3E" stroke="#F59E0B" strokeWidth="1.5" filter="url(#glow)"/>
      <text x="167" y="77" fill="#FBBF24" fontSize="4.5" fontWeight="bold">Decision</text>
      <text x="172" y="86" fill="#FCD34D" fontSize="4">Router</text>
      <circle cx="248" cy="50" r="14" fill="#0D1B3E" stroke="#EF4444" strokeWidth="1.5" filter="url(#glow)"/>
      <text x="239" y="47" fill="#F87171" fontSize="4.5" fontWeight="bold">Alert</text>
      <text x="239" y="56" fill="#FCA5A5" fontSize="4">Notify</text>
      <circle cx="248" cy="110" r="14" fill="#0D1B3E" stroke="#06B6D4" strokeWidth="1.5" filter="url(#glow)"/>
      <text x="238" y="107" fill="#22D3EE" fontSize="4.5" fontWeight="bold">Store</text>
      <text x="238" y="116" fill="#67E8F9" fontSize="4">Vector DB</text>
      {/* Connection lines */}
      <line x1="50" y1="72" x2="84" y2="48" stroke="#3B82F6" strokeWidth="1" opacity="0.7"/>
      <line x1="50" y1="88" x2="84" y2="112" stroke="#3B82F6" strokeWidth="1" opacity="0.7"/>
      <line x1="116" y1="46" x2="162" y2="68" stroke="#8B5CF6" strokeWidth="1" opacity="0.7"/>
      <line x1="116" y1="114" x2="162" y2="92" stroke="#10B981" strokeWidth="1" opacity="0.7"/>
      <line x1="198" y1="68" x2="234" y2="56" stroke="#F59E0B" strokeWidth="1" opacity="0.7"/>
      <line x1="198" y1="92" x2="234" y2="104" stroke="#F59E0B" strokeWidth="1" opacity="0.7"/>
      {/* Status */}
      <rect x="4" y="148" width="48" height="10" fill="#0D1B3E" rx="3" stroke="#10B981" strokeWidth="0.6"/>
      <circle cx="11" cy="153" r="2.5" fill="#10B981"/>
      <text x="16" y="156" fill="#34D399" fontSize="4">Running</text>
      <rect x="56" y="148" width="60" height="10" fill="#0D1B3E" rx="3" stroke="#3B82F6" strokeWidth="0.6"/>
      <text x="60" y="156" fill="#60A5FA" fontSize="4">Tokens: 1,247 used</text>
    </svg>
  );
}

function PreviewWireframe() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#F8FAFC"/>
      <defs><pattern id="g8" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="0.6" fill="#94A3B8" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g8)"/>
      {/* Phone 1 */}
      <rect x="10" y="8" width="72" height="130" fill="white" rx="12" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="14" y="18" width="64" height="110" fill="#F1F5F9" rx="6"/>
      <rect x="30" y="10" width="32" height="4" fill="#CBD5E1" rx="2"/>
      {/* Phone 1 content */}
      <rect x="18" y="22" width="56" height="28" fill="#E2E8F0" rx="4"/>
      <circle cx="30" cy="36" r="8" fill="#94A3B8"/>
      <rect x="42" y="29" width="28" height="5" fill="#94A3B8" rx="2"/>
      <rect x="42" y="36" width="20" height="4" fill="#CBD5E1" rx="2"/>
      <rect x="18" y="54" width="56" height="8" fill="#3B82F6" rx="4"/>
      <text x="38" y="61" fill="white" fontSize="5" fontWeight="bold">Sign In</text>
      <rect x="18" y="66" width="56" height="6" fill="#E2E8F0" rx="3"/>
      <rect x="18" y="76" width="56" height="6" fill="#E2E8F0" rx="3"/>
      {/* Bottom nav */}
      <rect x="14" y="118" width="64" height="10" fill="white" rx="3" stroke="#E2E8F0" strokeWidth="0.7"/>
      {[22,36,50,64].map((x,i) => <circle key={i} cx={x} cy="123" r="3" fill={i===0?'#3B82F6':'#CBD5E1'}/>)}
      {/* Phone 2 */}
      <rect x="104" y="8" width="72" height="130" fill="white" rx="12" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="108" y="18" width="64" height="110" fill="#F1F5F9" rx="6"/>
      <rect x="124" y="10" width="32" height="4" fill="#CBD5E1" rx="2"/>
      {/* Phone 2 content - Dashboard */}
      <rect x="112" y="22" width="56" height="12" fill="#3B82F6" rx="4"/>
      <text x="120" y="31" fill="white" fontSize="5" fontWeight="bold">Dashboard</text>
      <rect x="112" y="38" width="26" height="22" fill="#EFF6FF" rx="4" stroke="#BFDBFE" strokeWidth="0.8"/>
      <text x="117" y="47" fill="#3B82F6" fontSize="8" fontWeight="bold">24</text>
      <text x="115" y="56" fill="#93C5FD" fontSize="4">Tasks</text>
      <rect x="142" y="38" width="26" height="22" fill="#F0FDF4" rx="4" stroke="#BBF7D0" strokeWidth="0.8"/>
      <text x="150" y="47" fill="#22C55E" fontSize="8" fontWeight="bold">8</text>
      <text x="147" y="56" fill="#86EFAC" fontSize="4">Done</text>
      {[0,1,2].map(i => <rect key={i} x="112" y={64+i*14} width="56" height="10" fill="white" rx="3" stroke="#E2E8F0" strokeWidth="0.7"/>)}
      {/* Phone 3 */}
      <rect x="198" y="8" width="72" height="130" fill="white" rx="12" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="202" y="18" width="64" height="110" fill="#F1F5F9" rx="6"/>
      <rect x="218" y="10" width="32" height="4" fill="#CBD5E1" rx="2"/>
      {/* Phone 3 - Settings */}
      <rect x="206" y="22" width="56" height="10" fill="#F8FAFC" rx="3"/>
      <text x="210" y="30" fill="#475569" fontSize="5" fontWeight="bold">Settings</text>
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x="206" y={36+i*16} width="56" height="13" fill="white" rx="3" stroke="#F1F5F9" strokeWidth="0.7"/>
          <rect x="210" y={38+i*16} width="8" height="8" fill="#E2E8F0" rx="2"/>
          <rect x="222" y={40+i*16} width="24" height="4" fill="#CBD5E1" rx="2"/>
        </g>
      ))}
      {/* Flow arrows */}
      <path d="M82 68 Q93 68 104 68" stroke="#3B82F6" strokeWidth="1.5" fill="none" markerEnd="url(#arrf)"/>
      <path d="M176 68 Q187 68 198 68" stroke="#3B82F6" strokeWidth="1.5" fill="none" markerEnd="url(#arrf)"/>
      <defs><marker id="arrf" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z" fill="#3B82F6"/></marker></defs>
      <text x="85" y="65" fill="#94A3B8" fontSize="4">login</text>
      <text x="179" y="65" fill="#94A3B8" fontSize="4">home</text>
    </svg>
  );
}

function PreviewRetro() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FEFCE8"/>
      <defs><pattern id="g9" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#A3E635" opacity="0.3"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g9)"/>
      {/* 3 column headers */}
      <rect x="4" y="4" width="84" height="20" fill="#22C55E" rx="5"/>
      <text x="16" y="18" fill="white" fontSize="6" fontWeight="bold">Went Well</text>
      <rect x="98" y="4" width="84" height="20" fill="#EF4444" rx="5"/>
      <text x="108" y="18" fill="white" fontSize="6" fontWeight="bold">Needs Improvement</text>
      <rect x="192" y="4" width="84" height="20" fill="#3B82F6" rx="5"/>
      <text x="200" y="18" fill="white" fontSize="6" fontWeight="bold">Action Items</text>
      {/* Went well notes */}
      {[
        ['Fast deploys','Shipped 3 features'],
        ['Team sync','Daily standups'],
        ['Documentation','Wiki updated'],
      ].map(([t,s],i) => (
        <g key={t}>
          <rect x="4" y={28+i*38} width="84" height="32" fill="#DCFCE7" rx="4" stroke="#86EFAC" strokeWidth="0.8"/>
          <text x="9" y={41+i*38} fill="#166534" fontSize="5" fontWeight="600">{t}</text>
          <text x="9" y={51+i*38} fill="#15803D" fontSize="4.5">{s}</text>
          <circle cx="80" cy={32+i*38} r="4" fill="#22C55E" opacity="0.6"/>
          <text x="77" y={35+i*38} fill="white" fontSize="5" fontWeight="bold">+</text>
        </g>
      ))}
      {/* Needs improvement */}
      {[
        ['Review cycle','Too slow, 3+ days'],
        ['Test coverage','Only 42%'],
      ].map(([t,s],i) => (
        <g key={t}>
          <rect x="98" y={28+i*38} width="84" height="32" fill="#FEE2E2" rx="4" stroke="#FCA5A5" strokeWidth="0.8"/>
          <text x="103" y={41+i*38} fill="#991B1B" fontSize="5" fontWeight="600">{t}</text>
          <text x="103" y={51+i*38} fill="#DC2626" fontSize="4.5">{s}</text>
        </g>
      ))}
      <rect x="98" y="104" width="84" height="32" fill="#FEF2F2" rx="4" stroke="#FCA5A5" strokeWidth="0.8"/>
      <text x="103" y="117" fill="#991B1B" fontSize="5" fontWeight="600">Onboarding</text>
      <text x="103" y="127" fill="#DC2626" fontSize="4.5">2 new devs got lost</text>
      {/* Action items */}
      {[
        ['Hire QA engineer','@Alex — Q1'],
        ['PR template','@Priya — week 2'],
        ['Onboarding doc','@Team — ASAP'],
      ].map(([t,s],i) => (
        <g key={t}>
          <rect x="192" y={28+i*38} width="84" height="32" fill="#EFF6FF" rx="4" stroke="#93C5FD" strokeWidth="0.8"/>
          <rect x="196" y={32+i*38} width="6" height="6" fill="none" stroke="#3B82F6" strokeWidth="1" rx="1"/>
          <text x="205" y={38+i*38} fill="#1E40AF" fontSize="5" fontWeight="600">{t}</text>
          <text x="205" y={48+i*38} fill="#3B82F6" fontSize="4.5">{s}</text>
        </g>
      ))}
      {/* Footer vote bar */}
      <rect x="4" y="142" width="272" height="14" fill="white" rx="4" stroke="#E5E7EB" strokeWidth="0.7"/>
      <text x="10" y="152" fill="#6B7280" fontSize="5">Sprint 24 Retro &middot; 6 participants &middot; 14 items</text>
      {[0,1,2,3,4,5].map(i => <circle key={i} cx={240+i*7} cy="149" r="4" fill={['#EF4444','#F97316','#22C55E','#3B82F6','#8B5CF6','#EC4899'][i]}/>)}
    </svg>
  );
}

function PreviewResearch() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FEFDF7"/>
      <defs><pattern id="g10" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#D6C5A0" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#g10)"/>
      {/* Central cluster */}
      <circle cx="140" cy="80" r="28" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" opacity="0.9"/>
      <text x="122" y="76" fill="#92400E" fontSize="5.5" fontWeight="bold">Research</text>
      <text x="128" y="86" fill="#92400E" fontSize="5.5" fontWeight="bold">Hub</text>
      {/* Satellite notes */}
      <rect x="4" y="4" width="88" height="38" fill="#FFFBEB" rx="6" stroke="#D97706" strokeWidth="0.8"/>
      <text x="9" y="16" fill="#92400E" fontSize="5" fontWeight="bold">User Interviews</text>
      <text x="9" y="26" fill="#A16207" fontSize="4">20 participants</text>
      <text x="9" y="34" fill="#A16207" fontSize="4">Key insight: speed matters</text>
      <line x1="92" y1="23" x2="114" y2="60" stroke="#D97706" strokeWidth="0.8" strokeDasharray="4 2"/>
      <rect x="188" y="4" width="88" height="38" fill="#FFF7ED" rx="6" stroke="#EA580C" strokeWidth="0.8"/>
      <text x="193" y="16" fill="#9A3412" fontSize="5" fontWeight="bold">Competitor Study</text>
      <text x="193" y="26" fill="#C2410C" fontSize="4">Miro, FigJam, Notion</text>
      <text x="193" y="34" fill="#C2410C" fontSize="4">Gap: real-time canvas</text>
      <line x1="188" y1="23" x2="168" y2="60" stroke="#EA580C" strokeWidth="0.8" strokeDasharray="4 2"/>
      <rect x="4" y="116" width="88" height="38" fill="#F0FDF4" rx="6" stroke="#16A34A" strokeWidth="0.8"/>
      <text x="9" y="128" fill="#14532D" fontSize="5" fontWeight="bold">Survey Results</text>
      <text x="9" y="138" fill="#166534" fontSize="4">n=240 responses</text>
      <text x="9" y="146" fill="#166534" fontSize="4">87% want collab</text>
      <line x1="92" y1="135" x2="114" y2="100" stroke="#16A34A" strokeWidth="0.8" strokeDasharray="4 2"/>
      <rect x="188" y="116" width="88" height="38" fill="#EFF6FF" rx="6" stroke="#2563EB" strokeWidth="0.8"/>
      <text x="193" y="128" fill="#1E3A8A" fontSize="5" fontWeight="bold">Literature Review</text>
      <text x="193" y="138" fill="#1D4ED8" fontSize="4">12 papers cited</text>
      <text x="193" y="146" fill="#1D4ED8" fontSize="4">CSCW, CHI 2024</text>
      <line x1="188" y1="135" x2="168" y2="100" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="4 2"/>
      {/* Tags */}
      {['#ux','#research','#qual','#quant','#synthesis'].map((tag,i) => (
        <g key={tag}>
          <rect x={4+i*54} y="52" width={tag.length*4+6} height="11" fill="#FEF9C3" rx="10" stroke="#EAB308" strokeWidth="0.6"/>
          <text x={7+i*54} y="60" fill="#92400E" fontSize="4.5">{tag}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Templates Gallery ──────────────────────────────────────────────────── */
function Templates() {
  const [hovered, setHovered] = useState<number | null>(null);

  const templates = [
    {
      title: 'Startup Planning',
      desc: 'Lean canvas, SWOT analysis, and investor pitch flow for early-stage founders.',
      tag: 'Strategy',
      tagColor: '#F43F5E',
      tagBg: '#FFF1F2',
      glow: 'rgba(244,63,94,0.12)',
      preview: PreviewStartup,
      avatars: ['#F43F5E','#FB923C'],
    },
    {
      title: 'System Design',
      desc: 'AWS architecture, microservices, databases and API gateway all wired up.',
      tag: 'Engineering',
      tagColor: '#3B82F6',
      tagBg: '#EFF6FF',
      glow: 'rgba(59,130,246,0.12)',
      preview: PreviewSystemDesign,
      avatars: ['#3B82F6','#6366F1'],
    },
    {
      title: 'DSA Flowchart',
      desc: 'Trees, graphs, linked lists and algorithm flows with complexity analysis.',
      tag: 'CS / Interview',
      tagColor: '#EAB308',
      tagBg: '#FEFCE8',
      glow: 'rgba(234,179,8,0.12)',
      preview: PreviewDSA,
      avatars: ['#EAB308','#F97316'],
    },
    {
      title: 'User Journey Map',
      desc: 'Customer stages, emotion curve, pain points and touchpoints visualized.',
      tag: 'UX Research',
      tagColor: '#0D9488',
      tagBg: '#F0FDF9',
      glow: 'rgba(13,148,136,0.12)',
      preview: PreviewUserJourney,
      avatars: ['#0D9488','#22C55E'],
    },
    {
      title: 'Product Roadmap',
      desc: 'Q1–Q4 lanes, feature cards, sprint tracking and priority badges.',
      tag: 'Product',
      tagColor: '#7C3AED',
      tagBg: '#FAF5FF',
      glow: 'rgba(124,58,237,0.12)',
      preview: PreviewRoadmap,
      avatars: ['#7C3AED','#C026D3'],
    },
    {
      title: 'Brainstorming',
      desc: 'Central idea with satellite sticky notes, arrows and team voting dots.',
      tag: 'Ideation',
      tagColor: '#F97316',
      tagBg: '#FFF7ED',
      glow: 'rgba(249,115,22,0.12)',
      preview: PreviewBrainstorm,
      avatars: ['#F97316','#EAB308'],
    },
    {
      title: 'AI Workflow Builder',
      desc: 'Agent nodes, prompt chains, decision routers and tool integrations.',
      tag: 'Automation',
      tagColor: '#60A5FA',
      tagBg: '#EFF6FF',
      glow: 'rgba(96,165,250,0.18)',
      preview: PreviewAIWorkflow,
      avatars: ['#3B82F6','#8B5CF6'],
    },
    {
      title: 'Mobile Wireframe',
      desc: 'iPhone screens with user flows, UI sketches and interaction mapping.',
      tag: 'Design',
      tagColor: '#3B82F6',
      tagBg: '#F8FAFC',
      glow: 'rgba(59,130,246,0.1)',
      preview: PreviewWireframe,
      avatars: ['#64748B','#3B82F6'],
    },
    {
      title: 'Team Retrospective',
      desc: 'Went Well, Needs Improvement, Action Items — full sprint retro board.',
      tag: 'Agile',
      tagColor: '#22C55E',
      tagBg: '#F0FDF4',
      glow: 'rgba(34,197,94,0.12)',
      preview: PreviewRetro,
      avatars: ['#22C55E','#EF4444','#3B82F6'],
    },
    {
      title: 'Research & Notes Hub',
      desc: 'Linked note clusters, interview insights, surveys and literature tags.',
      tag: 'Research',
      tagColor: '#D97706',
      tagBg: '#FFFBEB',
      glow: 'rgba(217,119,6,0.12)',
      preview: PreviewResearch,
      avatars: ['#D97706','#16A34A'],
    },
  ];

  return (
    <section id="templates" style={{ padding: '100px 24px', background: BG2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: ACCENTL, border: `1px solid rgba(94,92,230,0.15)`, borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }}/>
            <span style={{ fontFamily: FD, fontSize: 12, fontWeight: 600, color: ACCENT }}>Templates</span>
          </div>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 800, color: T1, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 16 }}>
            Start from a real workspace,<br/>not a blank page.
          </h2>
          <p style={{ fontFamily: FD, fontSize: 18, color: T2, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Every template is built like an actual team would use it &mdash; detailed, opinionated, and ready to edit.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
          {templates.map((tpl, i) => {
            const Preview = tpl.preview;
            const isHovered = hovered === i;
            return (
              <Link key={tpl.title} href="/boards" style={{ textDecoration: 'none' }}>
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderRadius: 24, overflow: 'hidden', background: BG,
                    border: `1.5px solid ${isHovered ? tpl.tagColor + '44' : BORDER}`,
                    boxShadow: isHovered
                      ? `0 12px 48px ${tpl.glow}, 0 2px 8px rgba(0,0,0,0.06)`
                      : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.22s ease',
                    transform: isHovered ? 'translateY(-5px)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {/* Preview area */}
                  <div style={{ height: 180, overflow: 'hidden', position: 'relative', borderBottom: `1px solid ${BORDER}` }}>
                    <Preview />
                    {/* Hover overlay with "Use Template" */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(to bottom, transparent 40%, ${tpl.glow.replace('0.12','0.85').replace('0.18','0.92').replace('0.1','0.8')} 100%)`,
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      paddingBottom: 16, opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s',
                    }}>
                      <div style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: 'white', background: tpl.tagColor, padding: '7px 20px', borderRadius: 100, boxShadow: `0 4px 16px ${tpl.glow}` }}>
                        Use Template
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <div style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: T1, lineHeight: 1.3 }}>{tpl.title}</div>
                      <div style={{ flexShrink: 0, background: tpl.tagBg, border: `1px solid ${tpl.tagColor}22`, borderRadius: 100, padding: '3px 10px', fontFamily: FD, fontSize: 11, fontWeight: 600, color: tpl.tagColor, whiteSpace: 'nowrap' }}>
                        {tpl.tag}
                      </div>
                    </div>
                    <p style={{ fontFamily: FD, fontSize: 13, color: T2, lineHeight: 1.6, margin: '0 0 14px' }}>{tpl.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Avatars */}
                      <div style={{ display: 'flex' }}>
                        {tpl.avatars.map((c, ai) => (
                          <div key={ai} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: ai > 0 ? -6 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'white' }}>
                            {String.fromCharCode(65 + ai)}
                          </div>
                        ))}
                        <div style={{ fontFamily: FD, fontSize: 11, color: T3, marginLeft: 8, alignSelf: 'center' }}>Free</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tpl.tagColor} strokeWidth="2.5" strokeLinecap="round" style={{ opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.2s' }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <Link href="/boards" style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: 'white', background: ACCENT, textDecoration: 'none', padding: '12px 28px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 4px 20px ${ACCENTL}`, transition: 'transform 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            Browse all templates
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Integrations ───────────────────────────────────────────────────────── */
function Integrations() {
  const integrations = ['GitHub', 'Notion', 'Figma', 'Slack', 'Google Drive', 'VS Code'];

  return (
    <section id="pricing" style={{ padding: '80px 24px', background: BG2, textAlign: 'center' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <p style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: T3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28 }}>
          Works with your tools
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {integrations.map(name => (
            <div key={name} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 100, padding: '8px 20px', fontFamily: FD, fontSize: 14, fontWeight: 600, color: T2 }}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ padding: '96px 24px', background: BG }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '72px 40px', background: ACCENT, borderRadius: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }}/>
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: FD, fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 18 }}>
            Turn chaos into clarity.
          </h2>
          <p style={{ fontFamily: FD, fontSize: 17, color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 36px' }}>
            Open your first board and start building. No sign-up, no setup, no friction.
          </p>
          <Link href="/boards" style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: ACCENT, background: '#fff', textDecoration: 'none', padding: '13px 32px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', transition: 'transform 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
            Open Inkspace — it&apos;s free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { label: 'Product', links: ['Features', 'Templates', 'Changelog', 'Roadmap'] },
    { label: 'Company', links: ['About', 'Blog', 'Careers'] },
    { label: 'Legal',   links: ['Privacy', 'Terms'] },
  ];
  return (
    <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '56px 24px 36px', background: BG }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, auto)', justifyContent: 'space-between', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{ fontFamily: FD, fontSize: 16, fontWeight: 700, color: T1 }}>Inkspace</span>
            </div>
            <p style={{ fontFamily: FD, fontSize: 13, color: T3, maxWidth: 200, lineHeight: 1.6 }}>The infinite canvas for thinking and building together.</p>
          </div>
          {cols.map(col => (
            <div key={col.label}>
              <div style={{ fontFamily: FD, fontSize: 11, fontWeight: 700, color: T3, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>{col.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ fontFamily: FD, fontSize: 14, color: T2, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = T1)}
                    onMouseLeave={e => (e.currentTarget.style.color = T2)}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <p style={{ fontFamily: FD, fontSize: 13, color: T3, margin: 0 }}>&copy; 2026 Inkspace. All rights reserved.</p>
          <a
            href="https://github.com/Aryan-theccool"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '7px 16px', borderRadius: 100, border: `1px solid ${BORDER}`, background: BG2, transition: 'background 0.15s, border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f0ee'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = BG2; (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={T2}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span style={{ fontFamily: FD, fontSize: 13, color: T2, fontWeight: 500 }}>
              Developed by <strong style={{ color: T1, fontWeight: 700 }}>Aryan Singh bhadoria</strong>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main style={{ background: BG, minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <Features />
      <CanvasShowcase />
      <Collaboration />
      <Templates />
      <Integrations />
      <FinalCTA />
      <Footer />
    </main>
  );
}
