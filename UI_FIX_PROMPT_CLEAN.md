# INKSPACE — UI Fix Prompt for Claude Code

You are working on an existing Next.js whiteboard app called Inkspace. Do NOT rewrite anything from scratch. Make targeted fixes only. Here is exactly what to change:

---

## WHAT'S WRONG AND WHY

Looking at the current screenshots:
- Hero is centered and symmetrical — looks like every SaaS template
- Feature cards are 6 identical white rectangles on off-white — zero hierarchy
- Collaboration section has no visual contrast from surrounding sections
- Checklist bullets use large purple checkmarks — feels Bootstrap-era
- CTA font is too heavy and rounded — reads like a mobile game, not a premium tool
- Template sticky notes are perfectly uniform — same size, same rotation, machine-placed
- Frame borders use CSS dashed border — looks like a plain div, not a hand-drawn container
- Note color picker feels tacked on wherever it currently lives
- Buttons lack tactile press feedback
- No custom scrollbar, no selection color, font rendering not optimized

---

## FIX 1 — GLOBALS (do this first, affects everything)

In `globals.css`, add:
- `* { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }`
- `::selection { background: rgba(124,58,237,0.15); color: inherit; }`
- Custom scrollbar: 6px wide, transparent track, `rgba(0,0,0,0.15)` thumb, 100px border-radius. Dark theme variant uses `rgba(255,255,255,0.15)` thumb.
- All `button` and `a` elements: `transition: all 0.15s ease`
- All interactive buttons must have `active:scale-[0.97]` — this is the Apple press feel

---

## FIX 2 — NAVBAR

The navbar needs to feel like Linear or Vercel — crisp, glassy, confident.

- Background: `bg-white/80 backdrop-blur-xl` with a `border-b border-slate-100`
- Height: `56px`
- Logo: square `32×32` rounded `10px` violet background with a stacked layers SVG icon in white. "Inkspace" next to it in `font-bold tracking-tight text-slate-900`
- Nav links (Features, Templates, Pricing, Community): `text-[14px] font-medium text-slate-600`, on hover `bg-slate-100 rounded-[8px]`, padding `px-3 py-1.5`
- "Get Started" button: `bg-violet-600 text-white rounded-[10px] px-4 py-2 text-[14px] font-semibold shadow-sm shadow-violet-200` — on hover `bg-violet-700`
- "Log in": plain text button, no border, no background

---

## FIX 3 — HERO SECTION

The current hero is too centered. Break the symmetry.

- Align headline and subtext **left** on desktop (not centered). Max width `max-w-3xl`.
- Add two soft blob backgrounds: one `violet-100/40` top-right, one `blue-100/30` bottom-left. Both `blur-[120px]`. Pointer-events none.
- The badge above the headline: white background, `border border-violet-200`, `shadow-sm`, violet dot pulse on left, text `text-[13px] font-medium text-slate-600`
- Headline: `text-[72px] font-bold tracking-[-0.03em] leading-[1.05]`. "infinite space." in `text-violet-600`.
- "Start Creating" button: `bg-violet-600` with `shadow-lg shadow-violet-200` — this shadow is important, makes it float
- "See features" button: white background, `border border-slate-200`, `shadow-sm`
- The canvas preview mockup below the headline: give it `shadow-2xl shadow-slate-200/80` and `rounded-2xl`. Make the browser chrome inside it use real macOS traffic light dots (red `#FC615D`, yellow `#FDBC40`, green `#34C749`). The sticky notes inside the preview must use the Caveat font, have real drop shadows, and sit at organic angles (not perfectly flat).

---

## FIX 4 — FEATURE GRID

Replace the 6 uniform white cards with a **bento grid** that has hierarchy.

Layout (CSS grid): 6 columns, 2 rows. First two cards span 2 columns each (wide). Bottom three cards span 2 columns each.

- **Infinite Canvas card** (col-span-2): white background, has a tiny live dot-grid illustration inside the card showing 3 small sticky notes at angles
- **Real-time Collab card** (col-span-2): `bg-violet-600 text-white` — this is the ONLY inverted card. Shows 3 collaborator name pills (Priya, James, Lena) with green dots at the bottom
- **Sticky Notes card** (col-span-2): white background, shows the 7 actual note color swatches as circles inline
- Bottom three cards (Drawing Tools, Export, Light & Dark): all white, equal width, `col-span-2`

Each card: `rounded-2xl p-7 shadow-sm ring-1 ring-slate-100`
Icon container: `h-10 w-10 rounded-[12px]` with a light tinted background matching the icon color

---

## FIX 5 — COLLABORATION SECTION

This section must have a **dark background** (`bg-slate-900`) to create visual rhythm on the page scroll. Currently everything is the same beige — there's no contrast break.

- Background: `bg-slate-900`
- Section label above heading: small green dot + "COLLABORATION" in `text-green-400 text-[13px] font-semibold tracking-widest uppercase`
- Heading: `text-white text-[52px] font-bold tracking-tight`
- Subtext: `text-slate-400`
- 4 cards: `bg-white/5 border border-white/8 rounded-2xl p-6` — on hover `bg-white/8`
- Each card's colored dot: use `box-shadow: 0 0 8px <color>` to make it glow subtly — red, green, amber, purple respectively

---

## FIX 6 — CANVAS FEATURE SECTION (left text + right mockup)

The checklist bullets with large purple checkmark icons look dated. Replace with:
- A simple `1.5px` violet dot (`h-1.5 w-1.5 rounded-full bg-violet-500`) on the left
- Title in `text-[16px] font-semibold text-slate-900`
- Description in `text-[14px] text-slate-500`
- No icon, no checkmark, no decoration — just dot and text

The browser mockup on the right is good — keep it. Just ensure the sticky notes inside use Caveat font and have real shadows.

---

## FIX 7 — CTA SECTION

"Turn chaos into clarity." heading issue: it currently uses a heavy rounded font that looks like a mobile game. Fix:
- Font: use the same bold `font-bold tracking-tight` as the rest of the headings — NOT a display/rounded font
- The indigo card itself is fine. Keep the rounded corners and the two decorative circles.
- White CTA button inside: `bg-white text-violet-700 font-semibold rounded-[14px] px-7 py-4 shadow-lg` — on hover `shadow-xl`

---

## FIX 8 — TEMPLATE STICKY NOTES (most important board fix)

The templates look AI-generated because every note is `200×200`, evenly spaced, with the same rotation. Fix the template data in `lib/templates.ts`:

**Sprint Board:**
- Column headers should be handwriting-type elements (Caveat font, no background), not notes. "Backlog" in violet, "In Progress ⚡" in amber, "Done ✓" in green. Each at a slightly different rotation (-1.2°, 0.8°, -0.5°).
- Notes: vary widths between 180–220px. Vary heights 180–220px. Rotation values must all be different and feel random: -1.8°, 1.2°, -0.5°, 2.1°, -1.5°, 0.9°. One note should overlap slightly with the note below it (5–10px overlap in Y).
- Colors: don't put all yellows in one column. Mix them. Backlog: yellow + purple. In Progress: blue + orange. Done: green + yellow.
- One note in "In Progress" should have 3 lines of content (longer text) to break the uniform square look.

**Brainstorm:**
- Center note should be visibly larger (240×240) than the branch notes (170–190px)
- Branch notes at corners: each a different size. Not all the same.
- Add one handwriting label above the whole thing: "How might we..." in `text-[22px]` `color: #57534E` at `-0.5°` rotation
- Rotations: -3.2°, 2.5°, 1.8°, -1.2° — vary them more than currently

**Roadmap:**
- Section headers: big Caveat handwriting at 40px. "Now" in violet, "Next" in amber, "Later" in slate gray
- "Later" column notes: set `opacity: 0.85` to visually communicate they're deprioritized
- One note in "Now" should have an emoji: "🔥 P0" as part of the content

---

## FIX 9 — FRAME ELEMENT BORDER

The frame/container element currently uses a CSS `border-dashed` which looks like a plain div. Replace with a rough.js SVG render:

- Use `rough.svg()` to draw a rectangle inside an SVG that covers the frame dimensions
- Options: `roughness: 0.6`, `strokeLineDash: [6, 4]`, stroke is the frame's color, fill is the frame color at `4%` opacity, `fillStyle: 'solid'`
- The frame label (name text) should render in Caveat font, positioned `-28px` above the top-left corner of the frame, in the frame's color

---

## FIX 10 — NOTE COLOR PICKER PLACEMENT

The color picker currently appears below or beside the note in a fixed strip. Change it:

- It should be a **floating pill that appears above the selected note**, centered horizontally
- It pops up with a spring animation: `scale(0.9) opacity(0)` → `scale(1) opacity(1)` in 150ms
- It contains the 7 color swatches as circles (`h-5 w-5 rounded-full`)
- The active color has `ring-2 ring-violet-500 ring-offset-1`
- Each circle: on hover `scale(1.25)` — makes it feel tactile

---

## FIX 11 — BOARD STATUS BAR

Currently the "Map" tab has different styling from "Grid" and "Snap". Make all three consistent:
- All use the same pill toggle style: default `text-slate-500`, active `bg-violet-100 text-violet-700 font-medium`
- Same border-radius, same padding, same font size

---

## WHAT NOT TO CHANGE

- The board toolbar layout and icon set — it looks good
- The footer structure — it's clean
- The collaboration section card content (just the background and card styles)
- The overall routing and component structure
- Any functionality — these are visual-only changes

