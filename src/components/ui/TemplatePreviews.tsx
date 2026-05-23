'use client';

import React from 'react';
import { CanvasElement } from '../../store/canvasStore';

/* ─── SVG Miniature Previews ─────────────────────────────────────────────── */

export function PreviewStartup() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FFF5F5"/>
      <defs><pattern id="ps1" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.8" fill="#FECDD3"/></pattern></defs>
      <rect width="280" height="160" fill="url(#ps1)"/>
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
      <text x="14" y="31" fill="#9F1239" fontSize="4.5">No collab tools</text>
      <rect x="11" y="38" width="48" height="14" fill="#FFD6DB" rx="2"/>
      <text x="14" y="47" fill="#9F1239" fontSize="4.5">Too expensive</text>
      <rect x="68" y="22" width="48" height="28" fill="#FEE2E2" rx="2"/>
      <text x="71" y="30" fill="#9F1239" fontSize="4.5">Real-time</text>
      <text x="71" y="37" fill="#9F1239" fontSize="4.5">canvas board</text>
      <text x="71" y="44" fill="#9F1239" fontSize="4.5">+ AI assist</text>
      <rect x="228" y="22" width="48" height="13" fill="#FECDD3" rx="2"/>
      <text x="231" y="31" fill="#9F1239" fontSize="4.5">Designers</text>
      <rect x="228" y="37" width="48" height="13" fill="#FECDD3" rx="2"/>
      <text x="231" y="46" fill="#9F1239" fontSize="4.5">Eng Teams</text>
      <rect x="8" y="108" width="64" height="44" fill="#FFF0F0" rx="4"/>
      <text x="12" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">STRENGTHS</text>
      <text x="12" y="128" fill="#9F1239" fontSize="4.5">Fast iteration</text>
      <text x="12" y="136" fill="#9F1239" fontSize="4.5">Low cost infra</text>
      <rect x="76" y="108" width="64" height="44" fill="#FEF3F3" rx="4"/>
      <text x="80" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">WEAKNESSES</text>
      <text x="80" y="128" fill="#9F1239" fontSize="4.5">Small team</text>
      <rect x="144" y="108" width="64" height="44" fill="#FFF5F5" rx="4"/>
      <text x="148" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">OPPORTUNITY</text>
      <text x="148" y="128" fill="#9F1239" fontSize="4.5">Remote boom</text>
      <rect x="212" y="108" width="60" height="44" fill="#FEE2E2" rx="4"/>
      <text x="216" y="118" fill="#F43F5E" fontSize="5" fontWeight="bold">THREATS</text>
      <text x="216" y="128" fill="#9F1239" fontSize="4.5">Miro, Figma</text>
    </svg>
  );
}

export function PreviewSystemDesign() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#0F172A"/>
      <defs>
        <pattern id="ps2" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="0.7" fill="#1E40AF" opacity="0.6"/></pattern>
        <marker id="a2" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4Z" fill="#60A5FA"/></marker>
      </defs>
      <rect width="280" height="160" fill="url(#ps2)"/>
      <rect x="112" y="8" width="56" height="22" fill="#1D4ED8" rx="4" stroke="#60A5FA" strokeWidth="1"/>
      <text x="115" y="20" fill="#BFDBFE" fontSize="5" fontWeight="bold">Load Balancer</text>
      <line x1="124" y1="30" x2="60" y2="48" stroke="#60A5FA" strokeWidth="1" markerEnd="url(#a2)"/>
      <line x1="140" y1="30" x2="140" y2="48" stroke="#60A5FA" strokeWidth="1" markerEnd="url(#a2)"/>
      <line x1="156" y1="30" x2="220" y2="48" stroke="#60A5FA" strokeWidth="1" markerEnd="url(#a2)"/>
      <rect x="28" y="48" width="60" height="20" fill="#1E3A8A" rx="3" stroke="#3B82F6" strokeWidth="0.8"/>
      <text x="32" y="60" fill="#93C5FD" fontSize="4.8">Auth Service</text>
      <rect x="110" y="48" width="60" height="20" fill="#1E3A8A" rx="3" stroke="#3B82F6" strokeWidth="0.8"/>
      <text x="114" y="60" fill="#93C5FD" fontSize="4.8">API Gateway</text>
      <rect x="192" y="48" width="60" height="20" fill="#1E3A8A" rx="3" stroke="#3B82F6" strokeWidth="0.8"/>
      <text x="196" y="60" fill="#93C5FD" fontSize="4.8">Media Service</text>
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
      <line x1="58" y1="68" x2="58" y2="91" stroke="#60A5FA" strokeWidth="0.7" strokeDasharray="3 2"/>
      <line x1="140" y1="68" x2="140" y2="91" stroke="#60A5FA" strokeWidth="0.7" strokeDasharray="3 2"/>
      <line x1="222" y1="68" x2="222" y2="91" stroke="#60A5FA" strokeWidth="0.7" strokeDasharray="3 2"/>
      <rect x="60" y="136" width="160" height="18" fill="#111827" rx="3" stroke="#F59E0B" strokeWidth="0.8"/>
      <text x="100" y="148" fill="#FCD34D" fontSize="5" fontWeight="bold">Message Queue (Kafka)</text>
    </svg>
  );
}

export function PreviewDSA() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#1C1A00"/>
      <defs>
        <pattern id="ps3" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#A16207" opacity="0.5"/></pattern>
        <marker id="ad" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4Z" fill="#EAB308"/></marker>
      </defs>
      <rect width="280" height="160" fill="url(#ps3)"/>
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
      <rect x="8" y="100" width="136" height="14" fill="#1C1A00" rx="3" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="12" y="110" fill="#FDE047" fontSize="5">BFS: 8 → 3 → 12 → 1 → 6 → 9 → 15</text>
      <rect x="152" y="8" width="120" height="56" fill="#0C0A00" rx="4" stroke="#EAB308" strokeWidth="1"/>
      <text x="158" y="20" fill="#FDE047" fontSize="5" fontWeight="bold">Complexity Analysis</text>
      <text x="158" y="32" fill="#D97706" fontSize="5">Search: O(log n)</text>
      <text x="158" y="42" fill="#D97706" fontSize="5">Insert: O(log n)</text>
      <text x="158" y="52" fill="#D97706" fontSize="5">Space:  O(n)</text>
      <rect x="152" y="72" width="24" height="16" fill="#292524" rx="2" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="158" y="82" fill="#FDE047" fontSize="6" fontWeight="bold">4</text>
      <line x1="176" y1="80" x2="184" y2="80" stroke="#EAB308" strokeWidth="1" markerEnd="url(#ad)"/>
      <rect x="184" y="72" width="24" height="16" fill="#292524" rx="2" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="190" y="82" fill="#FDE047" fontSize="6" fontWeight="bold">8</text>
      <line x1="208" y1="80" x2="216" y2="80" stroke="#EAB308" strokeWidth="1" markerEnd="url(#ad)"/>
      <rect x="216" y="72" width="24" height="16" fill="#292524" rx="2" stroke="#EAB308" strokeWidth="0.8"/>
      <text x="222" y="82" fill="#FDE047" fontSize="6" fontWeight="bold">15</text>
      <text x="249" y="83" fill="#EAB308" fontSize="9">∅</text>
      <text x="156" y="66" fill="#A16207" fontSize="4.5">Linked List:</text>
      <rect x="152" y="100" width="120" height="52" fill="#111000" rx="4" stroke="#CA8A04" strokeWidth="0.8"/>
      <text x="157" y="112" fill="#FDE047" fontSize="4.8" fontWeight="bold">DFS Inorder Traversal</text>
      <text x="157" y="123" fill="#A16207" fontSize="4.5">Stack-based approach</text>
      <text x="157" y="133" fill="#A16207" fontSize="4.5">Left → Root → Right</text>
      <text x="157" y="143" fill="#D97706" fontSize="4.5">Result: 1,3,6,8,9,12,15</text>
    </svg>
  );
}

export function PreviewUserJourney() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#F0FDF9"/>
      <defs><pattern id="ps4" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#6EE7B7" opacity="0.5"/></pattern></defs>
      <rect width="280" height="160" fill="url(#ps4)"/>
      {(['Aware','Consider','Purchase','Retain','Advocate'] as const).map((s, i) => (
        <g key={s}>
          <rect x={8+i*54} y="6" width="50" height="18" fill={['#0D9488','#0891B2','#0E7490','#0D9488','#059669'][i]} rx="4"/>
          <text x={11+i*54} y="18" fill="white" fontSize="5" fontWeight="bold">{s}</text>
        </g>
      ))}
      <path d="M12 70 Q40 45 66 65 Q80 75 92 55 Q110 30 120 50 Q136 65 148 52 Q162 38 174 60 Q188 75 200 58 Q216 42 228 55 Q244 65 268 48"
        stroke="#0D9488" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {[12,66,120,174,228].map((cx,i) => <circle key={i} cx={cx} cy={[70,65,50,60,55][i]} r="3" fill="#14B8A6"/>)}
      {(['Social Ad','Website','Checkout','Email','Referral'] as const).map((label, i) => (
        <g key={label}>
          <rect x={8+i*54} y="100" width="50" height="22" fill="#F0FDFA" rx="3" stroke="#0D9488" strokeWidth="0.8"/>
          <text x={11+i*54} y="113" fill="#0D9488" fontSize="5">{label}</text>
        </g>
      ))}
      <rect x="65" y="126" width="52" height="16" fill="#FEF2F2" rx="3" stroke="#F87171" strokeWidth="0.8"/>
      <text x="68" y="136" fill="#EF4444" fontSize="4.5">Pain: slow load</text>
      <rect x="8" y="126" width="52" height="16" fill="#F0FDF4" rx="3" stroke="#4ADE80" strokeWidth="0.8"/>
      <text x="11" y="136" fill="#16A34A" fontSize="4.5">Happy: quick</text>
      <rect x="228" y="126" width="44" height="16" fill="#ECFDF5" rx="3" stroke="#34D399" strokeWidth="0.8"/>
      <text x="231" y="136" fill="#059669" fontSize="4.5">Referrals</text>
    </svg>
  );
}

export function PreviewRoadmap() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FAF5FF"/>
      <defs><pattern id="ps5" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#C4B5FD" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#ps5)"/>
      {(['Q1','Q2','Q3','Q4'] as const).map((q, i) => (
        <g key={q}>
          <rect x={8+i*68} y="6" width="64" height="20" fill={['#7C3AED','#9333EA','#A855F7','#C026D3'][i]} rx="5"/>
          <text x={28+i*68} y="20" fill="white" fontSize="8" fontWeight="bold">{q}</text>
        </g>
      ))}
      {[
        { label:'Auth',      spans:[1,0,0,0], color:'#7C3AED' },
        { label:'Dashboard', spans:[1,1,0,0], color:'#9333EA' },
        { label:'API v2',    spans:[0,1,1,0], color:'#A855F7' },
        { label:'Mobile',    spans:[0,0,1,1], color:'#C026D3' },
        { label:'Analytics', spans:[0,0,0,1], color:'#DB2777' },
      ].map((row, ri) => (
        <g key={row.label}>
          <text x="8" y={38+ri*20} fill="#6B21A8" fontSize="5" fontWeight="600" dominantBaseline="middle">{row.label}</text>
          {row.spans.map((on, qi) => on ? (
            <rect key={qi} x={34+qi*68} y={30+ri*20} width="56" height="12" fill={row.color} rx="3" opacity="0.85"/>
          ) : null)}
        </g>
      ))}
      <rect x="8" y="134" width="36" height="12" fill="#EDE9FE" rx="10"/>
      <text x="13" y="142" fill="#7C3AED" fontSize="4.5" fontWeight="600">P0 urgent</text>
      <rect x="48" y="134" width="32" height="12" fill="#F3E8FF" rx="10"/>
      <text x="53" y="142" fill="#9333EA" fontSize="4.5" fontWeight="600">P1 high</text>
      <text x="138" y="142" fill="#6B21A8" fontSize="4.5">Sprint 12 of 16</text>
      <rect x="138" y="145" width="80" height="5" fill="#EDE9FE" rx="2.5"/>
      <rect x="138" y="145" width="60" height="5" fill="#7C3AED" rx="2.5"/>
      <rect x="222" y="134" width="50" height="18" fill="#7C3AED" rx="4"/>
      <text x="228" y="146" fill="white" fontSize="5">On Track</text>
    </svg>
  );
}

export function PreviewBrainstorm() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FFFBEB"/>
      <defs><pattern id="ps6" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#FCD34D" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#ps6)"/>
      <ellipse cx="140" cy="80" rx="36" ry="22" fill="#F97316" stroke="#EA580C" strokeWidth="1.5"/>
      <text x="121" y="76" fill="white" fontSize="6" fontWeight="bold">CENTRAL</text>
      <text x="125" y="86" fill="white" fontSize="6" fontWeight="bold">IDEA</text>
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
      <line x1="76" y1="21" x2="108" y2="64" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="204" y1="22" x2="172" y2="63" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="76" y1="127" x2="108" y2="96" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="206" y1="131" x2="174" y2="96" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="74" y1="74" x2="104" y2="79" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
      <line x1="208" y1="77" x2="176" y2="79" stroke="#F97316" strokeWidth="1" strokeDasharray="4 2" opacity="0.7"/>
    </svg>
  );
}

export function PreviewAIWorkflow() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#0A0E1A"/>
      <defs>
        <pattern id="ps7" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="0.6" fill="#3B82F6" opacity="0.3"/></pattern>
        <filter id="glow7"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="280" height="160" fill="url(#ps7)"/>
      <circle cx="32" cy="80" r="18" fill="#0D1B3E" stroke="#3B82F6" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="23" y="77" fill="#60A5FA" fontSize="4.5" fontWeight="bold">Input</text>
      <text x="22" y="85" fill="#93C5FD" fontSize="4">Prompt</text>
      <circle cx="100" cy="40" r="16" fill="#0D1B3E" stroke="#8B5CF6" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="89" y="37" fill="#A78BFA" fontSize="4.5" fontWeight="bold">Claude</text>
      <text x="91" y="46" fill="#C4B5FD" fontSize="4">Opus 4</text>
      <circle cx="100" cy="120" r="16" fill="#0D1B3E" stroke="#10B981" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="90" y="117" fill="#34D399" fontSize="4.5" fontWeight="bold">Tools</text>
      <text x="90" y="126" fill="#6EE7B7" fontSize="4">Web/Code</text>
      <circle cx="180" cy="80" r="18" fill="#0D1B3E" stroke="#F59E0B" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="167" y="77" fill="#FBBF24" fontSize="4.5" fontWeight="bold">Decision</text>
      <text x="172" y="86" fill="#FCD34D" fontSize="4">Router</text>
      <circle cx="248" cy="50" r="14" fill="#0D1B3E" stroke="#EF4444" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="239" y="47" fill="#F87171" fontSize="4.5" fontWeight="bold">Alert</text>
      <text x="239" y="56" fill="#FCA5A5" fontSize="4">Notify</text>
      <circle cx="248" cy="110" r="14" fill="#0D1B3E" stroke="#06B6D4" strokeWidth="1.5" filter="url(#glow7)"/>
      <text x="238" y="107" fill="#22D3EE" fontSize="4.5" fontWeight="bold">Store</text>
      <text x="238" y="116" fill="#67E8F9" fontSize="4">Vector DB</text>
      <line x1="50" y1="72" x2="84" y2="48" stroke="#3B82F6" strokeWidth="1" opacity="0.7"/>
      <line x1="50" y1="88" x2="84" y2="112" stroke="#3B82F6" strokeWidth="1" opacity="0.7"/>
      <line x1="116" y1="46" x2="162" y2="68" stroke="#8B5CF6" strokeWidth="1" opacity="0.7"/>
      <line x1="116" y1="114" x2="162" y2="92" stroke="#10B981" strokeWidth="1" opacity="0.7"/>
      <line x1="198" y1="68" x2="234" y2="56" stroke="#F59E0B" strokeWidth="1" opacity="0.7"/>
      <line x1="198" y1="92" x2="234" y2="104" stroke="#F59E0B" strokeWidth="1" opacity="0.7"/>
      <rect x="4" y="148" width="48" height="10" fill="#0D1B3E" rx="3" stroke="#10B981" strokeWidth="0.6"/>
      <circle cx="11" cy="153" r="2.5" fill="#10B981"/>
      <text x="16" y="156" fill="#34D399" fontSize="4">Running</text>
      <rect x="56" y="148" width="60" height="10" fill="#0D1B3E" rx="3" stroke="#3B82F6" strokeWidth="0.6"/>
      <text x="60" y="156" fill="#60A5FA" fontSize="4">Tokens: 1,247 used</text>
    </svg>
  );
}

export function PreviewWireframe() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#F8FAFC"/>
      <defs>
        <pattern id="ps8" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="0.6" fill="#94A3B8" opacity="0.4"/></pattern>
        <marker id="af" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5Z" fill="#3B82F6"/></marker>
      </defs>
      <rect width="280" height="160" fill="url(#ps8)"/>
      <rect x="10" y="8" width="72" height="130" fill="white" rx="12" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="14" y="18" width="64" height="110" fill="#F1F5F9" rx="6"/>
      <rect x="30" y="10" width="32" height="4" fill="#CBD5E1" rx="2"/>
      <rect x="18" y="22" width="56" height="28" fill="#E2E8F0" rx="4"/>
      <circle cx="30" cy="36" r="8" fill="#94A3B8"/>
      <rect x="42" y="29" width="28" height="5" fill="#94A3B8" rx="2"/>
      <rect x="42" y="36" width="20" height="4" fill="#CBD5E1" rx="2"/>
      <rect x="18" y="54" width="56" height="8" fill="#3B82F6" rx="4"/>
      <text x="38" y="61" fill="white" fontSize="5" fontWeight="bold">Sign In</text>
      <rect x="18" y="66" width="56" height="6" fill="#E2E8F0" rx="3"/>
      <rect x="18" y="76" width="56" height="6" fill="#E2E8F0" rx="3"/>
      <rect x="14" y="118" width="64" height="10" fill="white" rx="3" stroke="#E2E8F0" strokeWidth="0.7"/>
      {[22,36,50,64].map((x,i) => <circle key={i} cx={x} cy="123" r="3" fill={i===0?'#3B82F6':'#CBD5E1'}/>)}
      <rect x="104" y="8" width="72" height="130" fill="white" rx="12" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="108" y="18" width="64" height="110" fill="#F1F5F9" rx="6"/>
      <rect x="124" y="10" width="32" height="4" fill="#CBD5E1" rx="2"/>
      <rect x="112" y="22" width="56" height="12" fill="#3B82F6" rx="4"/>
      <text x="120" y="31" fill="white" fontSize="5" fontWeight="bold">Dashboard</text>
      <rect x="112" y="38" width="26" height="22" fill="#EFF6FF" rx="4" stroke="#BFDBFE" strokeWidth="0.8"/>
      <text x="117" y="47" fill="#3B82F6" fontSize="8" fontWeight="bold">24</text>
      <text x="115" y="56" fill="#93C5FD" fontSize="4">Tasks</text>
      <rect x="142" y="38" width="26" height="22" fill="#F0FDF4" rx="4" stroke="#BBF7D0" strokeWidth="0.8"/>
      <text x="150" y="47" fill="#22C55E" fontSize="8" fontWeight="bold">8</text>
      <text x="147" y="56" fill="#86EFAC" fontSize="4">Done</text>
      {[0,1,2].map(i => <rect key={i} x="112" y={64+i*14} width="56" height="10" fill="white" rx="3" stroke="#E2E8F0" strokeWidth="0.7"/>)}
      <rect x="198" y="8" width="72" height="130" fill="white" rx="12" stroke="#CBD5E1" strokeWidth="1.5"/>
      <rect x="202" y="18" width="64" height="110" fill="#F1F5F9" rx="6"/>
      <rect x="218" y="10" width="32" height="4" fill="#CBD5E1" rx="2"/>
      <rect x="206" y="22" width="56" height="10" fill="#F8FAFC" rx="3"/>
      <text x="210" y="30" fill="#475569" fontSize="5" fontWeight="bold">Settings</text>
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x="206" y={36+i*16} width="56" height="13" fill="white" rx="3" stroke="#F1F5F9" strokeWidth="0.7"/>
          <rect x="210" y={38+i*16} width="8" height="8" fill="#E2E8F0" rx="2"/>
          <rect x="222" y={40+i*16} width="24" height="4" fill="#CBD5E1" rx="2"/>
        </g>
      ))}
      <path d="M82 68 Q93 68 104 68" stroke="#3B82F6" strokeWidth="1.5" fill="none" markerEnd="url(#af)"/>
      <path d="M176 68 Q187 68 198 68" stroke="#3B82F6" strokeWidth="1.5" fill="none" markerEnd="url(#af)"/>
      <text x="85" y="65" fill="#94A3B8" fontSize="4">login</text>
      <text x="179" y="65" fill="#94A3B8" fontSize="4">home</text>
    </svg>
  );
}

export function PreviewRetro() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FEFCE8"/>
      <defs><pattern id="ps9" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#A3E635" opacity="0.3"/></pattern></defs>
      <rect width="280" height="160" fill="url(#ps9)"/>
      <rect x="4" y="4" width="84" height="20" fill="#22C55E" rx="5"/>
      <text x="16" y="18" fill="white" fontSize="6" fontWeight="bold">Went Well</text>
      <rect x="98" y="4" width="84" height="20" fill="#EF4444" rx="5"/>
      <text x="102" y="18" fill="white" fontSize="5.5" fontWeight="bold">Needs Improvement</text>
      <rect x="192" y="4" width="84" height="20" fill="#3B82F6" rx="5"/>
      <text x="200" y="18" fill="white" fontSize="6" fontWeight="bold">Action Items</text>
      {[['Fast deploys','Shipped 3 features'],['Team sync','Daily standups'],['Docs updated','Wiki current']].map(([t,s],i) => (
        <g key={t}>
          <rect x="4" y={28+i*38} width="84" height="32" fill="#DCFCE7" rx="4" stroke="#86EFAC" strokeWidth="0.8"/>
          <text x="9" y={41+i*38} fill="#166534" fontSize="5" fontWeight="600">{t}</text>
          <text x="9" y={51+i*38} fill="#15803D" fontSize="4.5">{s}</text>
        </g>
      ))}
      {[['Review cycle','Too slow, 3+ days'],['Test coverage','Only 42%'],['Onboarding','2 devs got lost']].map(([t,s],i) => (
        <g key={t}>
          <rect x="98" y={28+i*38} width="84" height="32" fill="#FEE2E2" rx="4" stroke="#FCA5A5" strokeWidth="0.8"/>
          <text x="103" y={41+i*38} fill="#991B1B" fontSize="5" fontWeight="600">{t}</text>
          <text x="103" y={51+i*38} fill="#DC2626" fontSize="4.5">{s}</text>
        </g>
      ))}
      {[['Hire QA engineer','@Alex — Q1'],['PR template','@Priya — wk 2'],['Onboarding doc','@Team — ASAP']].map(([t,s],i) => (
        <g key={t}>
          <rect x="192" y={28+i*38} width="84" height="32" fill="#EFF6FF" rx="4" stroke="#93C5FD" strokeWidth="0.8"/>
          <rect x="196" y={32+i*38} width="6" height="6" fill="none" stroke="#3B82F6" strokeWidth="1" rx="1"/>
          <text x="205" y={38+i*38} fill="#1E40AF" fontSize="5" fontWeight="600">{t}</text>
          <text x="205" y={48+i*38} fill="#3B82F6" fontSize="4.5">{s}</text>
        </g>
      ))}
      <rect x="4" y="142" width="272" height="14" fill="white" rx="4" stroke="#E5E7EB" strokeWidth="0.7"/>
      <text x="10" y="152" fill="#6B7280" fontSize="5">Sprint 24 Retro &middot; 6 participants &middot; 14 items</text>
      {[0,1,2,3,4,5].map(i => <circle key={i} cx={240+i*7} cy="149" r="4" fill={['#EF4444','#F97316','#22C55E','#3B82F6','#8B5CF6','#EC4899'][i]}/>)}
    </svg>
  );
}

export function PreviewResearch() {
  return (
    <svg viewBox="0 0 280 160" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="160" fill="#FEFDF7"/>
      <defs><pattern id="ps10" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="0.7" fill="#D6C5A0" opacity="0.4"/></pattern></defs>
      <rect width="280" height="160" fill="url(#ps10)"/>
      <circle cx="140" cy="80" r="28" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" opacity="0.9"/>
      <text x="122" y="76" fill="#92400E" fontSize="5.5" fontWeight="bold">Research</text>
      <text x="128" y="86" fill="#92400E" fontSize="5.5" fontWeight="bold">Hub</text>
      <rect x="4" y="4" width="88" height="38" fill="#FFFBEB" rx="6" stroke="#D97706" strokeWidth="0.8"/>
      <text x="9" y="16" fill="#92400E" fontSize="5" fontWeight="bold">User Interviews</text>
      <text x="9" y="26" fill="#A16207" fontSize="4">20 participants</text>
      <text x="9" y="34" fill="#A16207" fontSize="4">Key: speed matters</text>
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
      {['#ux','#research','#qual','#quant','#synthesis'].map((tag, i) => (
        <g key={tag}>
          <rect x={4+i*54} y="52" width={tag.length*4+6} height="11" fill="#FEF9C3" rx="10" stroke="#EAB308" strokeWidth="0.6"/>
          <text x={7+i*54} y="60" fill="#92400E" fontSize="4.5">{tag}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Template metadata + element data ───────────────────────────────────── */

const uid = () => 'tpl_' + Math.random().toString(36).slice(2, 9);

export interface TemplateCard {
  id: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  glow: string;
  avatars: string[];
  Preview: React.FC;
  elements: Omit<CanvasElement, 'id'>[];
}

export const TEMPLATE_CARDS: TemplateCard[] = [
  {
    id: 'startup',
    title: 'Startup Planning',
    desc: 'Lean canvas, SWOT analysis, and investor pitch flow for early-stage founders.',
    tag: 'Strategy', tagColor: '#F43F5E', tagBg: '#FFF1F2', glow: 'rgba(244,63,94,0.12)',
    avatars: ['#F43F5E','#FB923C'],
    Preview: PreviewStartup,
    elements: [
      { type: 'frame', x: 60, y: 80, w: 580, h: 340, fill: 'rgba(244,63,94,0.04)', stroke: '#F43F5E', strokeWidth: 1.5, roughness: 0, z: 0, text: 'Lean Canvas' },
      { type: 'note', x: 80,  y: 120, w: 160, h: 80, color: 'pink',   text: 'Problem\nNo real-time collab', z: 1 },
      { type: 'note', x: 260, y: 120, w: 160, h: 80, color: 'yellow', text: 'Solution\nInfinite canvas board', z: 2 },
      { type: 'note', x: 440, y: 120, w: 180, h: 80, color: 'blue',   text: 'Customer Segments\nDesigners, Eng Teams', z: 3 },
      { type: 'note', x: 80,  y: 220, w: 160, h: 80, color: 'orange', text: 'Revenue\nFreemium + Pro plan', z: 4 },
      { type: 'note', x: 260, y: 220, w: 160, h: 80, color: 'green',  text: 'Cost Structure\nHosting + Dev', z: 5 },
      { type: 'frame', x: 60, y: 460, w: 260, h: 200, fill: 'rgba(244,63,94,0.04)', stroke: '#F43F5E', strokeWidth: 1.5, roughness: 0, z: 6, text: 'SWOT' },
      { type: 'note', x: 80,  y: 500, w: 100, h: 70, color: 'green',  text: 'Strengths\nFast iteration', z: 7 },
      { type: 'note', x: 200, y: 500, w: 100, h: 70, color: 'pink',   text: 'Weaknesses\nSmall team', z: 8 },
      { type: 'note', x: 80,  y: 580, w: 100, h: 70, color: 'blue',   text: 'Opportunities\nRemote work', z: 9 },
      { type: 'note', x: 200, y: 580, w: 100, h: 70, color: 'orange', text: 'Threats\nMiro, Figma', z: 10 },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    desc: 'AWS architecture, microservices, databases and API gateway all wired up.',
    tag: 'Engineering', tagColor: '#3B82F6', tagBg: '#EFF6FF', glow: 'rgba(59,130,246,0.12)',
    avatars: ['#3B82F6','#6366F1'],
    Preview: PreviewSystemDesign,
    elements: [
      { type: 'rect', x: 300, y: 60,  w: 160, h: 48, fill: '#1D4ED8', stroke: '#60A5FA', strokeWidth: 1.5, roughness: 0, radius: 8, z: 0, text: 'Load Balancer' },
      { type: 'rect', x: 100, y: 180, w: 140, h: 48, fill: '#1E3A8A', stroke: '#3B82F6', strokeWidth: 1.5, roughness: 0, radius: 8, z: 1, text: 'Auth Service' },
      { type: 'rect', x: 310, y: 180, w: 140, h: 48, fill: '#1E3A8A', stroke: '#3B82F6', strokeWidth: 1.5, roughness: 0, radius: 8, z: 2, text: 'API Gateway' },
      { type: 'rect', x: 520, y: 180, w: 140, h: 48, fill: '#1E3A8A', stroke: '#3B82F6', strokeWidth: 1.5, roughness: 0, radius: 8, z: 3, text: 'Media Service' },
      { type: 'rect', x: 100, y: 310, w: 140, h: 56, fill: '#075985', stroke: '#0EA5E9', strokeWidth: 1.5, roughness: 0, radius: 8, z: 4, text: 'PostgreSQL' },
      { type: 'rect', x: 310, y: 310, w: 140, h: 56, fill: '#166534', stroke: '#22C55E', strokeWidth: 1.5, roughness: 0, radius: 8, z: 5, text: 'Redis Cache' },
      { type: 'rect', x: 520, y: 310, w: 140, h: 56, fill: '#1E1B4B', stroke: '#818CF8', strokeWidth: 1.5, roughness: 0, radius: 8, z: 6, text: 'S3 Blob Storage' },
      { type: 'arrow', x: 380, y: 108, x2: 170, y2: 180, stroke: '#60A5FA', strokeWidth: 2, roughness: 0.3, z: 7 },
      { type: 'arrow', x: 380, y: 108, x2: 380, y2: 180, stroke: '#60A5FA', strokeWidth: 2, roughness: 0.3, z: 8 },
      { type: 'arrow', x: 380, y: 108, x2: 590, y2: 180, stroke: '#60A5FA', strokeWidth: 2, roughness: 0.3, z: 9 },
      { type: 'arrow', x: 170, y: 228, x2: 170, y2: 310, stroke: '#60A5FA', strokeWidth: 1.5, roughness: 0.3, z: 10 },
      { type: 'arrow', x: 380, y: 228, x2: 380, y2: 310, stroke: '#60A5FA', strokeWidth: 1.5, roughness: 0.3, z: 11 },
      { type: 'arrow', x: 590, y: 228, x2: 590, y2: 310, stroke: '#60A5FA', strokeWidth: 1.5, roughness: 0.3, z: 12 },
      { type: 'note', x: 240, y: 420, w: 280, h: 60, color: 'yellow', text: 'Message Queue (Kafka)\nAsync event streaming', z: 13 },
    ],
  },
  {
    id: 'dsa',
    title: 'DSA Flowchart',
    desc: 'Trees, graphs, linked lists and algorithm flows with complexity analysis.',
    tag: 'CS / Interview', tagColor: '#EAB308', tagBg: '#FEFCE8', glow: 'rgba(234,179,8,0.12)',
    avatars: ['#EAB308','#F97316'],
    Preview: PreviewDSA,
    elements: [
      { type: 'note', x: 60,  y: 60,  w: 200, h: 80, color: 'yellow', text: 'Binary Search Tree\nInsert: O(log n)\nSearch: O(log n)', z: 0 },
      { type: 'note', x: 60,  y: 170, w: 200, h: 80, color: 'orange', text: 'BFS Traversal\n8 → 3 → 12 → 1 → 6 → 9 → 15\nQueue-based O(n)', z: 1 },
      { type: 'note', x: 60,  y: 280, w: 200, h: 80, color: 'yellow', text: 'DFS Inorder\nLeft → Root → Right\nStack-based O(n)', z: 2 },
      { type: 'note', x: 340, y: 60,  w: 200, h: 120, color: 'orange', text: 'Complexity Table\nSearch: O(log n)\nInsert: O(log n)\nDelete: O(log n)\nSpace:  O(n)', z: 3 },
      { type: 'note', x: 340, y: 210, w: 200, h: 80, color: 'yellow', text: 'Linked List\n4 → 8 → 15 → null\nTraversal O(n)', z: 4 },
      { type: 'note', x: 340, y: 320, w: 200, h: 80, color: 'orange', text: 'Graph BFS/DFS\nAdjacency list\nVisited set to avoid cycles', z: 5 },
      { type: 'arrow', x: 260, y: 100, x2: 340, y2: 100, stroke: '#EAB308', strokeWidth: 2, roughness: 0.8, z: 6 },
      { type: 'arrow', x: 260, y: 210, x2: 340, y2: 250, stroke: '#EAB308', strokeWidth: 2, roughness: 0.8, z: 7 },
    ],
  },
  {
    id: 'user-journey',
    title: 'User Journey Map',
    desc: 'Customer stages, emotion curve, pain points and touchpoints visualized.',
    tag: 'UX Research', tagColor: '#0D9488', tagBg: '#F0FDF9', glow: 'rgba(13,148,136,0.12)',
    avatars: ['#0D9488','#22C55E'],
    Preview: PreviewUserJourney,
    elements: [
      { type: 'frame', x: 60,  y: 60, w: 160, h: 280, fill: 'rgba(13,148,136,0.06)', stroke: '#0D9488', strokeWidth: 1.5, roughness: 0, z: 0, text: 'Aware' },
      { type: 'frame', x: 240, y: 60, w: 160, h: 280, fill: 'rgba(8,145,178,0.06)',  stroke: '#0891B2', strokeWidth: 1.5, roughness: 0, z: 1, text: 'Consider' },
      { type: 'frame', x: 420, y: 60, w: 160, h: 280, fill: 'rgba(14,116,144,0.06)', stroke: '#0E7490', strokeWidth: 1.5, roughness: 0, z: 2, text: 'Purchase' },
      { type: 'frame', x: 600, y: 60, w: 160, h: 280, fill: 'rgba(13,148,136,0.06)', stroke: '#0D9488', strokeWidth: 1.5, roughness: 0, z: 3, text: 'Retain' },
      { type: 'note', x: 80,  y: 120, w: 120, h: 70, color: 'green',  text: 'Sees social ad\nAwareness stage', z: 4 },
      { type: 'note', x: 260, y: 120, w: 120, h: 70, color: 'blue',   text: 'Visits website\nReads reviews', z: 5 },
      { type: 'note', x: 440, y: 120, w: 120, h: 70, color: 'green',  text: 'Signs up free\nFirst canvas', z: 6 },
      { type: 'note', x: 620, y: 120, w: 120, h: 70, color: 'blue',   text: 'Daily active\nUpgrades plan', z: 7 },
      { type: 'note', x: 80,  y: 240, w: 120, h: 60, color: 'yellow', text: 'Pain: Slow load\n3s first paint', z: 8 },
      { type: 'note', x: 260, y: 240, w: 120, h: 60, color: 'pink',   text: 'Pain: No trial\nNeeds CC upfront', z: 9 },
      { type: 'note', x: 440, y: 240, w: 120, h: 60, color: 'green',  text: 'Delight: Fast collab\nReal-time cursors', z: 10 },
    ],
  },
  {
    id: 'roadmap',
    title: 'Product Roadmap',
    desc: 'Q1–Q4 lanes, feature cards, sprint tracking and priority badges.',
    tag: 'Product', tagColor: '#7C3AED', tagBg: '#FAF5FF', glow: 'rgba(124,58,237,0.12)',
    avatars: ['#7C3AED','#C026D3'],
    Preview: PreviewRoadmap,
    elements: [
      { type: 'frame', x: 60,  y: 60, w: 160, h: 400, fill: 'rgba(124,58,237,0.06)', stroke: '#7C3AED', strokeWidth: 1.5, roughness: 0, z: 0, text: 'Q1' },
      { type: 'frame', x: 240, y: 60, w: 160, h: 400, fill: 'rgba(147,51,234,0.06)', stroke: '#9333EA', strokeWidth: 1.5, roughness: 0, z: 1, text: 'Q2' },
      { type: 'frame', x: 420, y: 60, w: 160, h: 400, fill: 'rgba(168,85,247,0.06)', stroke: '#A855F7', strokeWidth: 1.5, roughness: 0, z: 2, text: 'Q3' },
      { type: 'frame', x: 600, y: 60, w: 160, h: 400, fill: 'rgba(192,38,211,0.06)', stroke: '#C026D3', strokeWidth: 1.5, roughness: 0, z: 3, text: 'Q4' },
      { type: 'note', x: 80,  y: 120, w: 120, h: 70, color: 'purple', text: 'Auth System\nOAuth + SSO', z: 4 },
      { type: 'note', x: 80,  y: 210, w: 120, h: 70, color: 'purple', text: 'Dashboard v1\nKPI widgets', z: 5 },
      { type: 'note', x: 260, y: 120, w: 120, h: 70, color: 'purple', text: 'Dashboard v2\nCustom layouts', z: 6 },
      { type: 'note', x: 260, y: 210, w: 120, h: 70, color: 'purple', text: 'API v2\nREST + GraphQL', z: 7 },
      { type: 'note', x: 440, y: 120, w: 120, h: 70, color: 'purple', text: 'Mobile App\niOS + Android', z: 8 },
      { type: 'note', x: 600, y: 120, w: 120, h: 70, color: 'purple', text: 'Analytics\nFull reporting', z: 9 },
      { type: 'note', x: 600, y: 210, w: 120, h: 70, color: 'purple', text: 'Enterprise\nSSO + Audit logs', z: 10 },
    ],
  },
  {
    id: 'brainstorm',
    title: 'Brainstorming',
    desc: 'Central idea with satellite sticky notes, arrows and team voting dots.',
    tag: 'Ideation', tagColor: '#F97316', tagBg: '#FFF7ED', glow: 'rgba(249,115,22,0.12)',
    avatars: ['#F97316','#EAB308'],
    Preview: PreviewBrainstorm,
    elements: [
      { type: 'note', x: 340, y: 240, w: 180, h: 80, color: 'orange', text: 'Central Idea\nYour Big Theme', z: 0 },
      { type: 'note', x: 80,  y: 100, w: 160, h: 70, color: 'yellow', text: 'User Research\n20 interviews done', z: 1 },
      { type: 'note', x: 560, y: 100, w: 160, h: 70, color: 'blue',   text: 'Market Trends\nRemote-first era', z: 2 },
      { type: 'note', x: 80,  y: 360, w: 160, h: 70, color: 'pink',   text: 'Competitor Gap\nMiro costs too much', z: 3 },
      { type: 'note', x: 560, y: 360, w: 160, h: 70, color: 'green',  text: 'Technical Edge\nY.js real-time sync', z: 4 },
      { type: 'note', x: 80,  y: 230, w: 160, h: 70, color: 'purple', text: 'Revenue Model\nFreemium + teams', z: 5 },
      { type: 'note', x: 560, y: 230, w: 160, h: 70, color: 'yellow', text: 'Growth Hacks\nViral sharing link', z: 6 },
      { type: 'arrow', x: 340, y: 280, x2: 240, y2: 170, stroke: '#F97316', strokeWidth: 2, roughness: 0.8, z: 7 },
      { type: 'arrow', x: 520, y: 280, x2: 560, y2: 170, stroke: '#F97316', strokeWidth: 2, roughness: 0.8, z: 8 },
      { type: 'arrow', x: 340, y: 300, x2: 240, y2: 395, stroke: '#F97316', strokeWidth: 2, roughness: 0.8, z: 9 },
      { type: 'arrow', x: 520, y: 300, x2: 560, y2: 395, stroke: '#F97316', strokeWidth: 2, roughness: 0.8, z: 10 },
      { type: 'arrow', x: 340, y: 280, x2: 240, y2: 265, stroke: '#F97316', strokeWidth: 2, roughness: 0.8, z: 11 },
      { type: 'arrow', x: 520, y: 280, x2: 560, y2: 265, stroke: '#F97316', strokeWidth: 2, roughness: 0.8, z: 12 },
    ],
  },
  {
    id: 'ai-workflow',
    title: 'AI Workflow Builder',
    desc: 'Agent nodes, prompt chains, decision routers and tool integrations.',
    tag: 'Automation', tagColor: '#60A5FA', tagBg: '#EFF6FF', glow: 'rgba(96,165,250,0.18)',
    avatars: ['#3B82F6','#8B5CF6'],
    Preview: PreviewAIWorkflow,
    elements: [
      { type: 'note', x: 60,  y: 200, w: 160, h: 80, color: 'blue',   text: 'Input Node\nUser Prompt / Trigger', z: 0 },
      { type: 'note', x: 300, y: 120, w: 160, h: 80, color: 'purple', text: 'Claude Opus 4\nLLM Reasoning', z: 1 },
      { type: 'note', x: 300, y: 280, w: 160, h: 80, color: 'green',  text: 'Tool Use\nWeb search / Code exec', z: 2 },
      { type: 'note', x: 540, y: 200, w: 160, h: 80, color: 'yellow', text: 'Decision Router\nRoute by intent', z: 3 },
      { type: 'note', x: 780, y: 120, w: 160, h: 80, color: 'pink',   text: 'Alert / Notify\nSlack / Email', z: 4 },
      { type: 'note', x: 780, y: 280, w: 160, h: 80, color: 'blue',   text: 'Store Result\nVector DB / Log', z: 5 },
      { type: 'arrow', x: 220, y: 240, x2: 300, y2: 160, stroke: '#3B82F6', strokeWidth: 2, roughness: 0.3, z: 6 },
      { type: 'arrow', x: 220, y: 240, x2: 300, y2: 320, stroke: '#3B82F6', strokeWidth: 2, roughness: 0.3, z: 7 },
      { type: 'arrow', x: 460, y: 160, x2: 540, y2: 220, stroke: '#8B5CF6', strokeWidth: 2, roughness: 0.3, z: 8 },
      { type: 'arrow', x: 460, y: 320, x2: 540, y2: 260, stroke: '#10B981', strokeWidth: 2, roughness: 0.3, z: 9 },
      { type: 'arrow', x: 700, y: 220, x2: 780, y2: 160, stroke: '#F59E0B', strokeWidth: 2, roughness: 0.3, z: 10 },
      { type: 'arrow', x: 700, y: 260, x2: 780, y2: 320, stroke: '#F59E0B', strokeWidth: 2, roughness: 0.3, z: 11 },
    ],
  },
  {
    id: 'wireframe',
    title: 'Mobile Wireframe',
    desc: 'iPhone screens with user flows, UI sketches and interaction mapping.',
    tag: 'Design', tagColor: '#3B82F6', tagBg: '#F8FAFC', glow: 'rgba(59,130,246,0.1)',
    avatars: ['#64748B','#3B82F6'],
    Preview: PreviewWireframe,
    elements: [
      { type: 'frame', x: 60,  y: 60, w: 200, h: 360, fill: 'rgba(59,130,246,0.04)', stroke: '#CBD5E1', strokeWidth: 2, roughness: 0, z: 0, text: 'Screen 1 — Login' },
      { type: 'frame', x: 340, y: 60, w: 200, h: 360, fill: 'rgba(59,130,246,0.04)', stroke: '#CBD5E1', strokeWidth: 2, roughness: 0, z: 1, text: 'Screen 2 — Dashboard' },
      { type: 'frame', x: 620, y: 60, w: 200, h: 360, fill: 'rgba(59,130,246,0.04)', stroke: '#CBD5E1', strokeWidth: 2, roughness: 0, z: 2, text: 'Screen 3 — Settings' },
      { type: 'note', x: 80,  y: 110, w: 160, h: 60, color: 'blue',   text: 'Email input\nPassword input', z: 3 },
      { type: 'note', x: 80,  y: 190, w: 160, h: 40, color: 'blue',   text: 'Sign In (primary CTA)', z: 4 },
      { type: 'note', x: 360, y: 110, w: 160, h: 60, color: 'green',  text: '24 Tasks / 8 Done\nStats row', z: 5 },
      { type: 'note', x: 360, y: 190, w: 160, h: 80, color: 'blue',   text: 'Task list items\nSwipe to complete', z: 6 },
      { type: 'note', x: 640, y: 110, w: 160, h: 100, color: 'yellow', text: 'Profile\nNotifications\nPrivacy\nTheme\nLogout', z: 7 },
      { type: 'arrow', x: 260, y: 240, x2: 340, y2: 240, stroke: '#3B82F6', strokeWidth: 2, roughness: 0.3, z: 8 },
      { type: 'arrow', x: 540, y: 240, x2: 620, y2: 240, stroke: '#3B82F6', strokeWidth: 2, roughness: 0.3, z: 9 },
      { type: 'text', x: 272, y: 235, text: 'login', fontSize: 12, stroke: '#94A3B8', z: 10 },
      { type: 'text', x: 552, y: 235, text: 'settings', fontSize: 12, stroke: '#94A3B8', z: 11 },
    ],
  },
  {
    id: 'retro',
    title: 'Team Retrospective',
    desc: 'Went Well, Needs Improvement, Action Items — full sprint retro board.',
    tag: 'Agile', tagColor: '#22C55E', tagBg: '#F0FDF4', glow: 'rgba(34,197,94,0.12)',
    avatars: ['#22C55E','#EF4444','#3B82F6'],
    Preview: PreviewRetro,
    elements: [
      { type: 'frame', x: 60,  y: 60, w: 240, h: 400, fill: 'rgba(34,197,94,0.06)',  stroke: '#22C55E', strokeWidth: 1.5, roughness: 0, z: 0, text: 'Went Well' },
      { type: 'frame', x: 320, y: 60, w: 240, h: 400, fill: 'rgba(239,68,68,0.06)',  stroke: '#EF4444', strokeWidth: 1.5, roughness: 0, z: 1, text: 'Needs Improvement' },
      { type: 'frame', x: 580, y: 60, w: 240, h: 400, fill: 'rgba(59,130,246,0.06)', stroke: '#3B82F6', strokeWidth: 1.5, roughness: 0, z: 2, text: 'Action Items' },
      { type: 'note', x: 80,  y: 120, w: 200, h: 80, color: 'green',  text: 'Fast deploys\nShipped 3 features this sprint', z: 3 },
      { type: 'note', x: 80,  y: 220, w: 200, h: 80, color: 'green',  text: 'Daily standups\nGreat team communication', z: 4 },
      { type: 'note', x: 80,  y: 320, w: 200, h: 80, color: 'green',  text: 'Wiki updated\nDocumentation improved', z: 5 },
      { type: 'note', x: 340, y: 120, w: 200, h: 80, color: 'pink',   text: 'Review cycle slow\nPRs taking 3+ days', z: 6 },
      { type: 'note', x: 340, y: 220, w: 200, h: 80, color: 'pink',   text: 'Test coverage\nOnly 42% coverage', z: 7 },
      { type: 'note', x: 340, y: 320, w: 200, h: 80, color: 'pink',   text: 'Onboarding gaps\n2 new devs got lost', z: 8 },
      { type: 'note', x: 600, y: 120, w: 200, h: 80, color: 'blue',   text: 'Hire QA engineer\n@Alex — Q1 priority', z: 9 },
      { type: 'note', x: 600, y: 220, w: 200, h: 80, color: 'blue',   text: 'PR template\n@Priya — week 2', z: 10 },
      { type: 'note', x: 600, y: 320, w: 200, h: 80, color: 'blue',   text: 'Onboarding doc\n@Team — ASAP', z: 11 },
    ],
  },
  {
    id: 'research',
    title: 'Research & Notes Hub',
    desc: 'Linked note clusters, interview insights, surveys and literature tags.',
    tag: 'Research', tagColor: '#D97706', tagBg: '#FFFBEB', glow: 'rgba(217,119,6,0.12)',
    avatars: ['#D97706','#16A34A'],
    Preview: PreviewResearch,
    elements: [
      { type: 'note', x: 340, y: 220, w: 200, h: 100, color: 'yellow', text: 'Research Hub\nCentral synthesis space', z: 0 },
      { type: 'note', x: 60,  y: 60,  w: 220, h: 100, color: 'yellow', text: 'User Interviews\n20 participants\nKey insight: speed matters', z: 1 },
      { type: 'note', x: 580, y: 60,  w: 220, h: 100, color: 'orange', text: 'Competitor Study\nMiro, FigJam, Notion\nGap: real-time canvas', z: 2 },
      { type: 'note', x: 60,  y: 360, w: 220, h: 100, color: 'green',  text: 'Survey Results\nn=240 responses\n87% want collaboration', z: 3 },
      { type: 'note', x: 580, y: 360, w: 220, h: 100, color: 'blue',   text: 'Literature Review\n12 papers cited\nCSCW, CHI 2024', z: 4 },
      { type: 'note', x: 340, y: 380, w: 200, h: 80,  color: 'orange', text: 'Key Insight\nSpeed + collab = retention', z: 5 },
      { type: 'arrow', x: 280, y: 110, x2: 340, y2: 250, stroke: '#D97706', strokeWidth: 2, roughness: 0.8, z: 6 },
      { type: 'arrow', x: 580, y: 110, x2: 540, y2: 250, stroke: '#D97706', strokeWidth: 2, roughness: 0.8, z: 7 },
      { type: 'arrow', x: 280, y: 410, x2: 340, y2: 390, stroke: '#D97706', strokeWidth: 2, roughness: 0.8, z: 8 },
      { type: 'arrow', x: 580, y: 410, x2: 540, y2: 390, stroke: '#D97706', strokeWidth: 2, roughness: 0.8, z: 9 },
    ],
  },
];
