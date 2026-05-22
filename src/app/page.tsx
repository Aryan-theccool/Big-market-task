'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCanvasStore } from '../store/canvasStore';
import { 
  ArrowRight, 
  Sparkles, 
  MousePointer, 
  Download, 
  Layers, 
  Grid, 
  Play, 
  Check, 
  Map, 
  Terminal, 
  Cpu 
} from 'lucide-react';

export default function LandingPage() {
  const store = useCanvasStore();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<'starter' | 'team' | 'studio'>('team');
  const [teaserNotes, setTeaserNotes] = useState([
    { id: 'tn-1', x: 80, y: 120, text: 'Drag me ✨', color: '#FEF3C7' },
    { id: 'tn-2', x: 300, y: 160, text: 'This is interactive', color: '#E0F2FE' },
  ]);
  const [dragItem, setDragItem] = useState<{ id: string; startX: number; startY: number } | null>(null);

  // Monitor scrolling for cinematic animations
  useEffect(() => {
    store.hydrate(); // Hydrate active theme settings

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Demo interactive sticky note dragging logic
  const handleTeaserPointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const item = teaserNotes.find(n => n.id === id);
    if (!item) return;
    setDragItem({
      id,
      startX: e.clientX - item.x,
      startY: e.clientY - item.y,
    });
  };

  const handleTeaserPointerMove = (e: React.PointerEvent) => {
    if (!dragItem) return;
    setTeaserNotes(prev =>
      prev.map(note =>
        note.id === dragItem.id
          ? { ...note, x: e.clientX - dragItem.startX, y: e.clientY - dragItem.startY }
          : note
      )
    );
  };

  const handleTeaserPointerUp = () => {
    setDragItem(null);
  };

  const handleAddTeaserNote = () => {
    const nextId = 'tn-' + Math.random().toString(36).substring(2, 6);
    const colors = ['#FEF3C7', '#FFE4E6', '#E0F2FE', '#DCFCE7', '#F3E8FF', '#FFEDD5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setTeaserNotes(prev => [
      ...prev,
      {
        id: nextId,
        x: 80 + Math.random() * 160,
        y: 80 + Math.random() * 120,
        text: 'New Sticky Note ideas',
        color: randomColor,
      },
    ]);
  };

  return (
    <div 
      className="min-h-screen bg-canvas text-primaryText transition-colors duration-300 relative select-none"
      onPointerMove={handleTeaserPointerMove}
      onPointerUp={handleTeaserPointerUp}
    >
      {/* Floating Header Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 transition-all duration-300 ${
          scrollY > 40
            ? 'bg-surface/85 backdrop-blur-md border-b border-borderLine shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Logo Hexagon mark */}
          <svg 
            className="w-7 h-7 filter drop-shadow-[0_8px_18px_rgba(99,102,241,0.25)] text-indigo-500" 
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" />
            <path d="M23 23 L29 29" className="text-indigo-400" />
          </svg>
          <span className="font-ui text-sm font-black tracking-widest text-primaryText uppercase">
            CANVEX
          </span>
        </div>

        {/* Navigation links & call to action buttons */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 font-ui text-[12px] text-secondaryText">
            <a href="#features" className="hover:text-primaryText transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primaryText transition-colors">Pricing</a>
            <a href="#changelog" className="hover:text-primaryText transition-colors">Changelog</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme selector pill */}
            <button
              onClick={store.toggleTheme}
              className="h-8 w-16 rounded-full p-1 bg-hover border border-borderLine relative flex items-center justify-between text-mutedText overflow-hidden"
              title="Toggle Light/Dark Theme"
            >
              <div 
                className="absolute top-1 bottom-1 w-6 rounded-full bg-surface shadow-sm transition-transform duration-300"
                style={{
                  transform: store.theme === 'dark' ? 'translateX(28px)' : 'translateX(0px)'
                }}
              />
              <span className="z-10 text-[10px] ml-1.5">☀</span>
              <span className="z-10 text-[10px] mr-1.5">🌙</span>
            </button>

            <Link href="/board">
              <button className="h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-ui text-xs font-bold shadow-md shadow-indigo-500/10 hover:scale-[1.02] active:scale-100 transition-all flex items-center gap-1.5">
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform hover:translate-x-0.5" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero Spotlight Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 overflow-hidden pt-24 pb-16">
        {/* Floating notes drifting in the background */}
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * 0.18}px)` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--dot-grid)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(circle_at_center,black_30%,transparent_70%)] opacity-80" />
          
          {/* Animated floating background cards */}
          <div className="absolute left-[8%] top-[24%] w-40 h-28 rounded-xl p-4 bg-[#FEF3C7] shadow-lg flex flex-col font-note text-xl text-black/75 -rotate-[4deg] animate-float-note border border-black/5">
            <span>Launch plan</span>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-br from-transparent to-black/10 rounded-br-xl" />
          </div>

          <div className="absolute right-[10%] top-[18%] w-40 h-28 rounded-xl p-4 bg-[#E0F2FE] shadow-lg flex flex-col font-note text-xl text-black/75 rotate-[3deg] animate-float-note border border-black/5" style={{ animationDelay: '0.6s' }}>
            <span>Map the flow</span>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-br from-transparent to-black/10 rounded-br-xl" />
          </div>

          <div className="absolute left-[14%] bottom-[20%] w-40 h-28 rounded-xl p-4 bg-[#FFE4E6] shadow-lg flex flex-col font-note text-xl text-black/75 rotate-[2deg] animate-float-note border border-black/5" style={{ animationDelay: '1.2s' }}>
            <span>Ideas live here</span>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-br from-transparent to-black/10 rounded-br-xl" />
          </div>

          <div className="absolute right-[16%] bottom-[16%] w-40 h-28 rounded-xl p-4 bg-[#DCFCE7] shadow-lg flex flex-col font-note text-xl text-black/75 -rotate-[2deg] animate-float-note border border-black/5" style={{ animationDelay: '1.8s' }}>
            <span>Ship the magic</span>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-br from-transparent to-black/10 rounded-br-xl" />
          </div>

          {/* Simulated user cursors */}
          <div className="absolute left-[20%] top-[45%] flex items-center gap-2 bg-[#F43F5E] text-white px-2.5 py-1 rounded-full font-ui text-[10px] font-bold shadow-md animate-cursor-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M4 2l15 10-7 1.5L8 21 4 2z" /></svg>
            <span>Priya</span>
          </div>

          <div className="absolute right-[22%] top-[55%] flex items-center gap-2 bg-[#10B981] text-white px-2.5 py-1 rounded-full font-ui text-[10px] font-bold shadow-md animate-cursor-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M4 2l15 10-7 1.5L8 21 4 2z" /></svg>
            <span>James</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="relative z-10 text-center max-w-[840px] px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Collaborative Spatial Thinking
          </div>

          <h1 className="font-display text-7xl md:text-9xl leading-[0.88] tracking-tight font-extrabold mb-6">
            Think in <span className="shimmer inline-block">space.</span>
          </h1>

          <p className="font-body text-base md:text-xl text-secondaryText leading-relaxed mb-8 max-w-[620px] mx-auto">
            The whiteboard that doesn't get out of your way. Notes, shapes, real-time presence, and crop region export in one cinematic canvas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/board">
              <button className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-ui text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.03] active:scale-100 transition-all flex items-center gap-2">
                <span>Start Collaborating Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            
            <a href="#demo">
              <button className="h-12 px-6 rounded-xl border border-borderLine bg-surface/50 hover:bg-hover text-primaryText font-ui text-xs font-black transition-all flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-500 fill-current" /> Watch Demo Teaser
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Social proof brand logo strip */}
      <section className="py-8 border-y border-borderLine bg-surface/30 select-none">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="font-ui text-[10px] text-mutedText uppercase tracking-widest font-black">
            Trusted by creators and product squads at
          </span>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 mt-6 font-ui font-black text-sm text-mutedText grayscale opacity-60">
            <span>NOTION</span>
            <span>LINEAR</span>
            <span>VERCEL</span>
            <span>STRIPE</span>
            <span>FIGMA</span>
          </div>
        </div>
      </section>

      {/* Story Narration Features Section */}
      <section className="py-24 max-w-6xl mx-auto px-6 flex flex-col gap-28" id="features">
        {/* Story 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col">
            <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">
              01 / Infinite Canvas
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4">
              Your canvas, infinite.
            </h2>
            <p className="font-body text-base text-secondaryText leading-relaxed">
              Pan. Zoom. Zero structural boundaries. CANVEX gives you as much space as your ideas need, with a responsive dot grid that breathes smoothly with every mouse wheel zoom.
            </p>
          </div>
          <div className="h-[320px] rounded-3xl border border-borderLine glass relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--dot-grid)_1px,transparent_1px)] bg-[size:18px_18px]" />
            <div className="absolute left-8 top-12 w-28 h-20 bg-[#FEF3C7] shadow-md border border-black/5 rounded-lg rotate-[-2deg]" />
            <div className="absolute right-12 bottom-12 w-32 h-22 bg-[#E0F2FE] shadow-md border border-black/5 rounded-lg rotate-[3deg]" />
            <svg className="w-full h-full absolute inset-0 text-indigo-500/40" viewBox="0 0 400 300">
              <path d="M 80,100 C 140,40 220,180 320,110" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 6" />
            </svg>
          </div>
        </div>

        {/* Story 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
          <div className="flex flex-col lg:order-2">
            <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">
              02 / Presence
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4">
              Collaborate in real time.
            </h2>
            <p className="font-body text-base text-secondaryText leading-relaxed">
              See your team's cursors moving along vectors. Every click and select is visible instantly with zero input lag. Every presence is felt, without turning the shared board into chaotic noise.
            </p>
          </div>
          <div className="h-[320px] rounded-3xl border border-borderLine glass relative overflow-hidden flex items-center justify-center lg:order-1">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--dot-grid)_1px,transparent_1px)] bg-[size:18px_18px]" />
            <div className="absolute left-[38%] top-[25%] flex items-center gap-1.5 bg-[#F43F5E] text-white px-2 py-0.5 rounded-full font-ui text-[9px] font-bold shadow-md">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M4 2l15 10-7 1.5L8 21 4 2z" /></svg>
              <span>Priya</span>
            </div>
            <div className="absolute left-[54%] top-[52%] flex items-center gap-1.5 bg-[#10B981] text-white px-2 py-0.5 rounded-full font-ui text-[9px] font-bold shadow-md">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M4 2l15 10-7 1.5L8 21 4 2z" /></svg>
              <span>James</span>
            </div>
            <div className="w-[180px] h-[130px] rounded-xl bg-[#FFE4E6] p-4 font-note text-lg text-black/75 shadow-md border border-black/5 select-none text-center flex items-center justify-center">
              Shared thoughts...
            </div>
          </div>
        </div>

        {/* Story 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col">
            <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">
              03 / Crop Export
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-4">
              Export exactly what you see.
            </h2>
            <p className="font-body text-base text-secondaryText leading-relaxed">
              Select any subregion crop on your canvas. Instantly download PNG or SVG vectors. Customize background transparency, scale modifiers, and download crops with satisfying page peel effects.
            </p>
          </div>
          <div className="h-[320px] rounded-3xl border border-borderLine glass relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--dot-grid)_1px,transparent_1px)] bg-[size:18px_18px]" />
            <div className="w-[260px] h-[180px] border-2 border-dashed border-indigo-500 bg-indigo-500/5 shadow-[0_0_0_9999px_rgba(0,0,0,0.15)] flex items-end justify-end p-2 z-10 rounded-sm">
              <span className="bg-panel border border-borderLine px-2 py-0.5 rounded-full font-ui text-[9px] text-primaryText font-bold">
                640 × 480 px
              </span>
            </div>
            <div className="absolute left-16 top-16 w-24 h-18 bg-[#FFE4E6] border border-black/5 shadow rounded-lg" />
            <div className="absolute right-14 bottom-14 w-28 h-20 bg-[#F3E8FF] border border-black/5 shadow rounded-lg" />
          </div>
        </div>
      </section>

      {/* Interactive live canvas demo banner */}
      <section className="py-16 bg-hover/40 border-y border-borderLine px-6" id="demo">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Interactive Canvas Teaser
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
                Touch the actual canvas.
              </h2>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddTeaserNote}
                className="h-9 px-4 rounded-xl border border-borderLine bg-surface text-primaryText hover:bg-hover font-ui text-xs font-bold transition-all"
              >
                + Add Note
              </button>
              
              <Link href="/board">
                <button className="h-9 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-ui text-xs font-bold transition-all shadow-md shadow-indigo-500/10">
                  Open full board →
                </button>
              </Link>
            </div>
          </div>

          {/* Draggable Teaser Area */}
          <div className="h-[400px] rounded-3xl border border-borderLine bg-canvas shadow-inner relative overflow-hidden bg-[radial-gradient(circle_at_center,var(--dot-grid)_1px,transparent_1px)] bg-[size:22px_22px]">
            {teaserNotes.map((note) => (
              <div
                key={note.id}
                onPointerDown={(e) => handleTeaserPointerDown(note.id, e)}
                className="absolute w-[180px] h-[140px] rounded-xl p-4 font-note text-2xl text-black/75 shadow-lg select-none cursor-grab active:cursor-grabbing flex flex-col group border border-black/5 transition-shadow duration-100 hover:shadow-xl"
                style={{
                  left: note.x,
                  top: note.y,
                  backgroundColor: note.color,
                }}
              >
                <div className="h-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-ui text-[9px] text-black/40">DRAG ME</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeaserNotes(prev => prev.filter(n => n.id !== note.id));
                    }}
                    className="ml-auto w-4.5 h-4.5 rounded flex items-center justify-center hover:bg-black/5 text-black/50"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 mt-1 outline-none">{note.text}</div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-br from-transparent to-black/10 rounded-br-xl" />
              </div>
            ))}
          </div>

          {/* Grid list of feature details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <div className="p-5 rounded-2xl glass flex flex-col border border-borderLine">
              <span className="text-2xl mb-2">✦</span>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider mb-1.5">Infinite Canvas</h3>
              <p className="font-body text-xs text-secondaryText leading-relaxed">Pan and zoom with zero viewport borders.</p>
            </div>
            <div className="p-5 rounded-2xl glass flex flex-col border border-borderLine">
              <span className="text-2xl mb-2">🗒</span>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider mb-1.5">Smart sticky notes</h3>
              <p className="font-body text-xs text-secondaryText leading-relaxed">6 soft presets, folded corner effect, text alignment.</p>
            </div>
            <div className="p-5 rounded-2xl glass flex flex-col border border-borderLine">
              <span className="text-2xl mb-2">⬡</span>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider mb-1.5">Vector shapes</h3>
              <p className="font-body text-xs text-secondaryText leading-relaxed">Rect, oval, arrow, path draw with color closes.</p>
            </div>
            <div className="p-5 rounded-2xl glass flex flex-col border border-borderLine">
              <span className="text-2xl mb-2">👥</span>
              <h3 className="font-ui text-xs font-bold uppercase tracking-wider mb-1.5">Live Presence</h3>
              <p className="font-body text-xs text-secondaryText leading-relaxed">Ghost cursors moving along paths synchronously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-24 max-w-6xl mx-auto px-6 text-center" id="pricing">
        <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest">
          Pricing Plans
        </span>
        <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-4 mt-2">
          Start free. Scale when ready.
        </h2>
        <p className="font-body text-base text-secondaryText mb-12 max-w-[560px] mx-auto">
          Tailored packages for solo brainstorming, distributed product squads, and workshop-heavy design studios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
          {/* Card 1 */}
          <div className="rounded-2xl glass p-6 border border-borderLine flex flex-col relative">
            <span className="inline-block px-3 py-1 font-ui text-[10px] font-black text-indigo-500 bg-indigo-500/10 rounded-full w-fit mb-4">
              Starter
            </span>
            <div className="font-display text-5xl font-bold mb-3">$0</div>
            <p className="font-body text-xs text-secondaryText leading-relaxed mb-6">
              Unlimited local board saves, full shapes toolkit, region crop screenshotting, and dark mode.
            </p>
            <div className="flex-1" />
            <Link href="/board" className="w-full">
              <button className="h-10 w-full rounded-xl border border-borderLine bg-surface hover:bg-hover font-ui text-xs font-bold transition-all">
                Start Free
              </button>
            </Link>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl glass p-6 border-2 border-indigo-500 shadow-lg flex flex-col relative">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-500 text-white font-ui text-[9px] font-black uppercase tracking-wider">
              Popular
            </div>
            <span className="inline-block px-3 py-1 font-ui text-[10px] font-black text-indigo-500 bg-indigo-500/10 rounded-full w-fit mb-4">
              Team
            </span>
            <div className="font-display text-5xl font-bold mb-3">$12</div>
            <p className="font-body text-xs text-secondaryText leading-relaxed mb-6">
              Collaborator shared session rooms, real-time presence, activity logs feeds, and cloud cloud sync.
            </p>
            <div className="flex-1" />
            <Link href="/board" className="w-full">
              <button className="h-10 w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-ui text-xs font-bold transition-all shadow-md shadow-indigo-500/20">
                Launch Team Board →
              </button>
            </Link>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl glass p-6 border border-borderLine flex flex-col relative">
            <span className="inline-block px-3 py-1 font-ui text-[10px] font-black text-indigo-500 bg-indigo-500/10 rounded-full w-fit mb-4">
              Studio
            </span>
            <div className="font-display text-5xl font-bold mb-3">Custom</div>
            <p className="font-body text-xs text-secondaryText leading-relaxed mb-6">
              Enterprise security retention, custom scale assets export, team single sign-on, and custom SLA.
            </p>
            <div className="flex-1" />
            <button 
              onClick={() => alert('Thanks for your interest! Enterprise Studio pipelines are opening soon.')}
              className="h-10 w-full rounded-xl border border-borderLine bg-surface hover:bg-hover font-ui text-xs font-bold transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Changelog Section */}
      <section className="py-20 border-t border-borderLine bg-surface/10 px-6" id="changelog">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              Release Log
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
              What shipped recently.
            </h2>
          </div>

          <div className="rounded-2xl border border-borderLine glass overflow-hidden divide-y divide-borderLine">
            <div className="p-6 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
              <time className="font-ui text-[11px] font-black text-indigo-500">v2.0</time>
              <div>
                <h3 className="font-ui text-xs font-black text-primaryText uppercase tracking-wider">Region Crop export</h3>
                <p className="font-body text-xs text-secondaryText leading-relaxed mt-1">
                  Spotlight crop overlays, transparency modifiers, scalable PNG/SVG downloads, and satisfying selection peels.
                </p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
              <time className="font-ui text-[11px] font-black text-indigo-500">v1.8</time>
              <div>
                <h3 className="font-ui text-xs font-black text-primaryText uppercase tracking-wider">⌘K Command Palette</h3>
                <p className="font-body text-xs text-secondaryText leading-relaxed mt-1">
                  Keyboard-first accessibility hooks for direct tools selection, viewport zoom adjustments, and layer stack alignment coordinates.
                </p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
              <time className="font-ui text-[11px] font-black text-indigo-500">v1.5</time>
              <div>
                <h3 className="font-ui text-xs font-black text-primaryText uppercase tracking-wider">Presence Drift Simulation</h3>
                <p className="font-body text-xs text-secondaryText leading-relaxed mt-1">
                  Simulated collaborator cursor drifts (James, Priya, Lena), typing overlays indicators, and activity logs alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote testimonials */}
      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass border border-borderLine flex flex-col gap-4 shadow-sm">
          <blockquote className="font-body text-xs text-secondaryText leading-relaxed">
            “Finally, a whiteboard built with actual taste. The canvas controls are smooth, and the grid doesn't feel distracting.”
          </blockquote>
          <span className="font-ui text-[10px] text-mutedText font-black uppercase tracking-wider mt-auto">
            Maya — Lead Designer
          </span>
        </div>
        <div className="p-6 rounded-2xl glass border border-borderLine flex flex-col gap-4 shadow-sm">
          <blockquote className="font-body text-xs text-secondaryText leading-relaxed">
            “The region crop selector sold me immediately. We can grab precisely the section of a workshop we want to show customers.”
          </blockquote>
          <span className="font-ui text-[10px] text-mutedText font-black uppercase tracking-wider mt-auto">
            Arjun — Product Founder
          </span>
        </div>
        <div className="p-6 rounded-2xl glass border border-borderLine flex flex-col gap-4 shadow-sm">
          <blockquote className="font-body text-xs text-secondaryText leading-relaxed">
            “The simulated collaborator cursors and logs feed are incredibly charming, but the canvas remains highly performant.”
          </blockquote>
          <span className="font-ui text-[10px] text-mutedText font-black uppercase tracking-wider mt-auto">
            Leah — Systems Engineer
          </span>
        </div>
      </section>

      {/* Final Call to Action banner */}
      <section className="py-24 border-t border-borderLine text-center relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--dot-grid)_1.1px,transparent_1.1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto px-6">
          <h2 className="font-display text-6xl md:text-8xl leading-tight font-extrabold mb-4">
            Ready to think in space?
          </h2>
          <p className="font-body text-sm text-secondaryText leading-relaxed mb-8">
            Open the infinite board session. 100% free to start. No sign-up wall required.
          </p>
          <Link href="/board">
            <button className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-ui text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.03] active:scale-100 transition-all flex items-center justify-center gap-2 mx-auto">
              <span>Open CANVEX Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="py-12 border-t border-borderLine bg-surface/30 select-none">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <svg 
              className="w-6 h-6 text-indigo-500" 
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" />
            </svg>
            <span className="font-ui text-xs font-black tracking-widest text-primaryText uppercase">
              CANVEX
            </span>
          </div>
          
          <span className="font-body text-[11px] text-mutedText">
            Think in space. The creative operating system for modern squads.
          </span>
          
          <span className="font-ui text-[10px] text-mutedText font-black tracking-wider">
            © 2026 CANVEX · MADE WITH CARE
          </span>
        </div>
      </footer>
    </div>
  );
}
