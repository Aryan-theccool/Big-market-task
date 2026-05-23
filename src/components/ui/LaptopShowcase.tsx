'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

/* ─── Apple Neo Palette Constants ────────────────────────────────────────── */
const ACCENT = '#0071e3'; /* Azure accent */
const BORDER = '#e8e8ed'; /* Silver Mist */
const T1 = '#1d1d1f';     /* Ink primary text */
const T2 = '#707070';     /* Graphite secondary text */

export default function LaptopShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Parallax 3D Spring Motion ────────────────────────────────────────── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.6 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const xVal = (e.clientX - rect.left) / width - 0.5;
    const yVal = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(xVal);
    mouseY.set(yVal);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  /* ─── Live Animation Sequence Step Engine ───────────────────────────────── */
  const [seqStep, setSeqStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { step: 0, delay: 2500 },  /* Initial view */
      { step: 1, delay: 4000 },  /* Draw flowchart rectangle & circle with connecting arrow */
      { step: 2, delay: 3500 },  /* Sticky notes spring drop & text typing */
      { step: 3, delay: 3500 },  /* Smooth zoom out / scale transformation */
      { step: 4, delay: 4000 },  /* Handwriting vector scribble */
      { step: 5, delay: 3000 },  /* Node drag & magnetic alignment snapping guides */
      { step: 6, delay: 4500 },  /* Collaborative cursor glides & Priya typing */
      { step: 7, delay: 3500 },  /* Toolbar expand & inspector panel adjust */
      { step: 8, delay: 5000 },  /* Perfect final mindmap view */
    ];

    let current = 0;
    const runStep = () => {
      const currentConfig = sequence[current];
      setSeqStep(currentConfig.step);
      
      const timer = setTimeout(() => {
        current = (current + 1) % sequence.length;
        runStep();
      }, currentConfig.delay);
      return timer;
    };

    const timer = runStep();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        maxWidth: 1024,
        margin: '0 auto',
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px',
        overflow: 'visible',
      }}
    >
      <style>{`
        @keyframes breathingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; filter: blur(36px); }
          50% { transform: scale(0.92); opacity: 0.18; filter: blur(48px); }
        }
        @keyframes pulseGuide {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* ─── 3D Laptop Body Container ─── */}
      <motion.div
        style={{
          width: '100%',
          maxWidth: 780,
          position: 'relative',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          animation: 'breathingFloat 6s ease-in-out infinite',
        }}
      >
        {/* ─── Laptop Lid (Retina Screen) ─── */}
        <div
          style={{
            background: '#0d0d0f',
            borderRadius: '24px 24px 0 0',
            padding: '12px',
            border: '2px solid #515154',
            borderBottom: 'none',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 -4px 20px rgba(0,0,0,0.1)',
            transformStyle: 'preserve-3d',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Bezel Camera & Notch */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 12,
              background: '#0d0d0f',
              borderRadius: '0 0 8px 8px',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1c1c1f' }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#0a84ff', opacity: 0.6 }} />
          </div>

          {/* Screen Content Viewport (16:10 aspect ratio) */}
          <div
            style={{
              width: '100%',
              paddingBottom: '62.5%', /* 16:10 Ratio */
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8)',
            }}
          >
            {/* Screen Glass Reflection Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)',
                pointerEvents: 'none',
                zIndex: 25,
              }}
            />

            {/* Inner Live App Showcase */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                userSelect: 'none',
              }}
            >
              {/* Whiteboard Chrome Editor Header */}
              <div
                style={{
                  height: 32,
                  background: '#f5f5f7',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  zIndex: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
                    <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  ))}
                  <div style={{ height: 12, width: 1, background: '#d2d2d7', marginLeft: 6 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'sans-serif', color: T1, letterSpacing: '-0.1px', marginLeft: 4 }}>
                    Untitled Workshop
                  </span>
                </div>

                {/* Simulated Avatars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex', marginRight: 6 }}>
                    {['P', 'J'].map((initial, i) => (
                      <div
                        key={i}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: i === 0 ? '#ff453a' : '#30d158',
                          border: '1.5px solid white',
                          marginLeft: i > 0 ? -4 : 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 6,
                          fontWeight: 900,
                          color: 'white',
                        }}
                      >
                        {initial}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: ACCENT, color: 'white', fontSize: 8, padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                    Share
                  </div>
                </div>
              </div>

              {/* Whiteboard Screen Canvas Workspace */}
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                  background: '#f5f5f7',
                  backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  overflow: 'hidden',
                }}
              >
                {/* ─── LIVE EDITOR TIMELINE GRAPHICS ─── */}
                <motion.div
                  animate={{
                    scale: seqStep >= 3 ? 0.72 : 1,
                    x: seqStep === 3 ? -30 : seqStep === 5 ? 40 : 0,
                    y: seqStep === 3 ? -10 : seqStep === 5 ? 20 : 0,
                  }}
                  transition={{ type: 'spring', damping: 24, stiffness: 80 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transformOrigin: 'center center',
                  }}
                >
                  {/* SVG Layer for Arrows and Drawing Elements */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', zIndex: 5 }}>
                    <defs>
                      <marker id="arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={ACCENT} />
                      </marker>
                    </defs>

                    {/* Step 1 Flowchart Connecting Arrow */}
                    {seqStep >= 1 && (
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        d="M 190 100 Q 230 70 280 115"
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        markerEnd="url(#arrowhead)"
                      />
                    )}

                    {/* Step 4 Dynamic Handwriting Doodle */}
                    {seqStep >= 4 && (
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.4, ease: 'easeInOut' }}
                        d="M 90 200 C 130 180, 180 230, 240 185 C 280 155, 340 210, 390 170"
                        fill="none"
                        stroke="#8e44ad"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Snap Guide Alignment Lines (Step 5) */}
                    {seqStep === 5 && (
                      <>
                        {/* Horizontal Snap line */}
                        <motion.line
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.8, 0.3, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          x1="0" y1="120" x2="600" y2="120"
                          stroke="#0a84ff"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        {/* Vertical Snap line */}
                        <motion.line
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.8, 0.3, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          x1="320" y1="0" x2="320" y2="400"
                          stroke="#0a84ff"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                      </>
                    )}
                  </svg>

                  {/* Flowchart Box 1 (Step 1) */}
                  {seqStep >= 1 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      style={{
                        position: 'absolute',
                        left: 90,
                        top: 80,
                        width: 100,
                        height: 40,
                        background: '#ffffff',
                        border: `1.5px solid ${BORDER}`,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        fontFamily: 'sans-serif',
                        color: T1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      Ideation Hub
                    </motion.div>
                  )}

                  {/* Flowchart Circle 2 (Step 1) */}
                  {seqStep >= 1 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, delay: 0.4 }}
                      style={{
                        position: 'absolute',
                        left: 280,
                        top: 100,
                        width: 70,
                        height: 70,
                        background: '#ffffff',
                        border: `1.5px solid ${ACCENT}`,
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 8,
                        fontWeight: 700,
                        fontFamily: 'sans-serif',
                        color: ACCENT,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <span>Product</span>
                      <span>Roadmap</span>
                    </motion.div>
                  )}

                  {/* ─── Step 2: Elastic Sticky Notes Drop ─── */}
                  {seqStep >= 2 && (
                    <>
                      {/* Sticky Note 1 (Rose) */}
                      <motion.div
                        initial={{ scale: 0, y: -50, rotate: 15 }}
                        animate={{ scale: 1, y: 0, rotate: -3 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.1 }}
                        style={{
                          position: 'absolute',
                          left: 110,
                          top: 150,
                          width: 84,
                          height: 84,
                          background: '#FFE4E6',
                          border: '1px solid rgba(0,0,0,0.04)',
                          borderRadius: 6,
                          padding: 8,
                          fontSize: 12,
                          color: '#2b2230',
                          lineHeight: 1.1,
                          transformOrigin: 'center center',
                        }}
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                        >
                          Refine UI Bezel Outlines
                        </motion.span>
                      </motion.div>

                      {/* Sticky Note 2 (Sun) */}
                      <motion.div
                        initial={{ scale: 0, y: -50, rotate: -10 }}
                        animate={{ scale: 1, y: 0, rotate: 2.2 }}
                        transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.3 }}
                        style={{
                          position: 'absolute',
                          left: 215,
                          top: 180,
                          width: 80,
                          height: 80,
                          background: '#FEF3C7',
                          border: '1px solid rgba(0,0,0,0.04)',
                          borderRadius: 6,
                          padding: 8,
                          fontSize: 12,
                          color: '#2b2230',
                          lineHeight: 1.1,
                        }}
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9, duration: 0.5 }}
                        >
                          Ship it in Q3! 🚀
                        </motion.span>
                      </motion.div>
                    </>
                  )}

                  {/* ─── Step 3: Secondary Frames Zoom Showcase ─── */}
                  {seqStep >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.45, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: 'absolute',
                        left: -130,
                        top: 20,
                        width: 180,
                        height: 220,
                        border: '1.5px dashed rgba(0,113,227,0.3)',
                        borderRadius: 14,
                        background: 'rgba(0,113,227,0.02)',
                        padding: 10,
                      }}
                    >
                      <div style={{ fontSize: 9, fontWeight: 700, color: ACCENT, fontFamily: 'sans-serif' }}>
                        Archived Frames
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
                        {[1, 2, 3, 4].map(x => (
                          <div key={x} style={{ height: 36, background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 4 }} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── Step 6 & 7: Multiple Collaborative Presence Cursors ─── */}
                  {/* Priya Cursor */}
                  {seqStep >= 6 && (
                    <motion.div
                      animate={{
                        x: seqStep === 6 ? [350, 160, 240] : 350,
                        y: seqStep === 6 ? [90, 180, 120] : 90,
                      }}
                      transition={{ duration: 4.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 40,
                        pointerEvents: 'none',
                      }}
                    >
                      <svg width="10" height="13" viewBox="0 0 13 17">
                        <path d="M0 0 L10 6.5 L6 7.8 L4.5 13 Z" fill="#ff453a" stroke="white" strokeWidth="0.6" />
                      </svg>
                      <div style={{ background: '#ff453a', color: 'white', fontSize: 6, fontWeight: 900, padding: '1px 5px', borderRadius: 20, marginLeft: 6, marginTop: -2, whiteSpace: 'nowrap' }}>
                        Priya
                      </div>
                    </motion.div>
                  )}

                  {/* James Cursor */}
                  {seqStep >= 6 && (
                    <motion.div
                      animate={{
                        x: seqStep === 6 ? [120, 310, 190] : 120,
                        y: seqStep === 6 ? [220, 130, 240] : 220,
                      }}
                      transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.5 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 40,
                        pointerEvents: 'none',
                      }}
                    >
                      <svg width="10" height="13" viewBox="0 0 13 17">
                        <path d="M0 0 L10 6.5 L6 7.8 L4.5 13 Z" fill="#30d158" stroke="white" strokeWidth="0.6" />
                      </svg>
                      <div style={{ background: '#30d158', color: 'white', fontSize: 6, fontWeight: 900, padding: '1px 5px', borderRadius: 20, marginLeft: 6, marginTop: -2, whiteSpace: 'nowrap' }}>
                        James
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* ─── VIRTUAL MAIN USER CURSOR ─── */}
                <motion.div
                  animate={{
                    /* Dynamic coordinates sequence for the main user action cursor */
                    x: seqStep === 0 ? 240
                     : seqStep === 1 ? [240, 12, 140, 315] /* Moves to Left Tool rail to select rectangular tool, then draws */
                     : seqStep === 2 ? [315, 230]
                     : seqStep === 3 ? [230, 260]
                     : seqStep === 4 ? [260, 90, 240, 390] /* Scribbles */
                     : seqStep === 5 ? [390, 280, 320] /* Drags node */
                     : seqStep === 7 ? [320, 12, 450] /* Expand menu coordinates */
                     : 240,
                    y: seqStep === 0 ? 140
                     : seqStep === 1 ? [140, 96, 100, 135]
                     : seqStep === 2 ? [135, 190]
                     : seqStep === 3 ? [190, 160]
                     : seqStep === 4 ? [160, 200, 230, 170]
                     : seqStep === 5 ? [170, 100, 120]
                     : seqStep === 7 ? [120, 210, 80]
                     : 140,
                  }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 99,
                    pointerEvents: 'none',
                  }}
                >
                  <svg width="12" height="15" viewBox="0 0 13 17" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                    <path
                      d="M0 0 L10 6.5 L6 7.8 L4.5 13 Z"
                      fill={seqStep === 4 ? '#8e44ad' : ACCENT}
                      stroke="white"
                      strokeWidth="0.8"
                    />
                  </svg>
                  {seqStep === 4 && (
                    <div style={{ background: '#8e44ad', color: 'white', fontSize: 5, padding: '1px 4px', borderRadius: 4, marginLeft: 8 }}>
                      Pen
                    </div>
                  )}
                </motion.div>

                {/* ─── LEFT FLOATING TOOL RAIL ─── */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    zIndex: 20,
                  }}
                >
                  {['select', 'hand', 'note', 'rect', 'draw', 'text'].map((tool) => {
                    const isActive =
                      (tool === 'select' && (seqStep === 0 || seqStep === 3 || seqStep === 5 || seqStep === 6 || seqStep === 8)) ||
                      (tool === 'rect' && seqStep === 1) ||
                      (tool === 'note' && seqStep === 2) ||
                      (tool === 'draw' && seqStep === 4) ||
                      (tool === 'text' && seqStep === 7);

                    return (
                      <div
                        key={tool}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          display: 'grid',
                          placeItems: 'center',
                          background: isActive ? 'rgba(0, 113, 227, 0.08)' : 'transparent',
                          color: isActive ? ACCENT : '#86868b',
                          fontSize: 8,
                          fontWeight: 700,
                          transition: 'all 0.15s',
                        }}
                      >
                        {tool === 'select' && 'V'}
                        {tool === 'hand' && 'H'}
                        {tool === 'note' && 'N'}
                        {tool === 'rect' && '□'}
                        {tool === 'draw' && '✎'}
                        {tool === 'text' && 'T'}
                      </div>
                    );
                  })}
                </motion.div>

                {/* ─── RIGHT INSPECTOR PANEL ─── */}
                <AnimatePresence>
                  {seqStep >= 7 && (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ type: 'spring', damping: 20 }}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 40,
                        bottom: 8,
                        width: 96,
                        background: 'rgba(255, 255, 255, 0.88)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        padding: 8,
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 7, fontWeight: 800, color: T2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Properties
                      </div>
                      
                      <div style={{ height: 1, background: BORDER }} />
                      
                      {/* Stroke selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: 6, fontWeight: 700, color: T2 }}>Border Width</div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3].map(w => (
                            <div
                              key={w}
                              style={{
                                flex: 1,
                                height: 12,
                                borderRadius: 3,
                                background: w === 2 ? ACCENT : '#f5f5f7',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 5,
                                color: w === 2 ? 'white' : T2,
                                fontWeight: 700,
                              }}
                            >
                              {w}px
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Opacity slider */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ fontSize: 6, fontWeight: 700, color: T2 }}>Opacity</div>
                        <div style={{ height: 4, background: '#f5f5f7', borderRadius: 2, position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '85%', background: ACCENT, borderRadius: 2 }} />
                          <div style={{ position: 'absolute', left: '85%', top: -2, width: 8, height: 8, borderRadius: '50%', background: 'white', border: `1.5px solid ${ACCENT}` }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── BOTTOM STATUS BAR ─── */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 18,
                    background: '#f5f5f7',
                    borderTop: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    zIndex: 20,
                  }}
                >
                  <span style={{ fontSize: 7, color: T2, fontFamily: 'sans-serif' }}>
                    Canvas size: Infinite
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 7, color: T2 }}>Grid: On</span>
                    <div style={{ width: 1, height: 8, background: '#d2d2d7' }} />
                    <span style={{ fontSize: 7, color: ACCENT, fontWeight: 700 }}>
                      {seqStep >= 3 ? '72%' : '100%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Laptop Base (Aluminium Body Tray & Keyboard) ─── */}
        <div
          style={{
            height: 12,
            background: 'linear-gradient(to bottom, #d2d2d7 0%, #a2a2a7 100%)',
            borderRadius: '0 0 16px 16px',
            border: '1.5px solid #8e8e93',
            borderTop: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            transform: 'rotateX(-12deg)',
            transformOrigin: 'top center',
            position: 'relative',
            zIndex: 1,
            transformStyle: 'preserve-3d',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Top Edge Silver highlight line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 4,
              right: 4,
              height: 1,
              background: '#ffffff',
              opacity: 0.6,
            }}
          />

          {/* Front Notch indent to open laptop */}
          <div
            style={{
              width: 80,
              height: 4,
              background: '#1c1c1f',
              borderRadius: '0 0 6px 6px',
              position: 'absolute',
              top: 0,
            }}
          />
        </div>
      </motion.div>

      {/* ─── Floating Shadow Under Laptop ─── */}
      <div
        style={{
          width: '80%',
          maxWidth: 580,
          height: 16,
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '50%',
          margin: '28px auto 0',
          animation: 'shadowPulse 6s ease-in-out infinite',
        }}
      />
    </div>
  );
}
