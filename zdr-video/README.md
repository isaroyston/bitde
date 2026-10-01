# Zero Data Retention — lyric video

## Current revision — privacy edit / 720p review

`ZDRVertical` now uses locally bundled Inter, the supplied complete `Bitdeer AI Logo-1200_300.png` artwork, and the subtitle **Zero Data Retention**. Privacy shields, locks and disappearing documents replace the coins and concert stage. The extra instrumental marketing cards and interjection stickers are removed; completed lyrics fade away during musical gaps.

Luca's rig was compared with the official front-facing Welcome artwork and 3D hoodie reference. The redraw corrects the cheek silhouette, flatter eyes and single highlights, smaller muzzle, brows, upright ears, low antler forks, short legs, shorts and broad feet. The paws use continuous mitten outlines and clear thumb folds; the lateral point has an off-centre index, and overhead dance gestures use open paws. `out/luca-refined.png` is the reviewed model sheet.

The vertical audio edit removes source **59.600–63.200 s** and **65.800–74.800 s**, keeping one closing brand phrase and both final spoken phrases. `src/vertical/editTimeline.ts` maps edited time back to source time so lyrics, lip sync and choreography stay together. The supplied original audio and horizontal composition remain available. The review cut is **71.283 s including the end card**, **720 × 1280**, **60 fps**, H.264.

Render the review with `npm run render:720p`. The output is `out/zdr-vertical-720p.mp4`. On this workstation a local Chrome executable can be supplied with `--browser-executable="C:\\Users\\admin\\.cache\\puppeteer\\chrome\\win64-148.0.7778.97\\chrome-win64\\chrome.exe"`.

The historical notes below describe earlier versions.

Revision 7: fixed pre-cue glyph leakage with explicit visibility gating and fixed clipping bounds; text and strike-through now share a single transform and measured inline width; removed duplicate chorus Z/D/R and the TRANSMISSION label. Added a refined packet rail, gradient capsule progress, circular compute meter, memory cells, buffer scanner, connection-path animation, completed-document icon, and heavier circular confirmation mark.

1920 × 1080, 60 fps. Timing retains revision 6 audio-derived phrase and word-group offsets. Difficult sung proper nouns remain estimated rather than manually verified karaoke alignment.

## Edit

Install Node.js, then run `npm install` and `npx remotion studio src/index.tsx`.
Render with `npx remotion render src/index.tsx ZeroDataRetention output.mp4 --codec=h264 --crf=20`.

`src/captions.json` holds phrase timings in milliseconds and the text, separated into display lines with `|`. Timings were estimated using two automatic transcription passes and reconciled with the supplied lyrics. They are phrase timings, not a verified karaoke alignment. The low-confidence branded outro was positioned manually.

`src/scenes/TechGraphics.tsx` contains the animated SVG motifs. Each cue may specify `lineOffsetsMs`, `dataOffsetMs`, and an instrumental `stage`. `src/Backdrop.tsx` defines the sectional palette and is shared by all foreground graphics. `src/scenes/LyricScene.tsx` controls lyric styling and movement. `BreakScene.tsx` controls the instrumental typography montage.

The supplied local reference was inspected for layered composition, sequencing, and movement. No reference footage is included.

`local-network.cjs` supplies a loopback address only when network interface enumeration fails in the rendering environment. On a normal computer it is unnecessary. In that environment prefix commands with `NODE_OPTIONS='--require ./local-network.cjs'`.


Technique reference: Adobe, Animate text letter by letter — https://www.adobe.com/learn/after-effects/web/animate-letter-by-letter. Independent staged position/reveal animation was applied to words and phrases here; no reference graphics or footage were copied.

## Revision 8
Raised REMEMBER YOU strike to the capital-letter optical center and removed the EVERYTHING strike. Added explicit second-hit ZERO animations throughout chorus cues, with restrained scale/rotation and fading outline echoes. Replaced recurring progress displays with multicolor orbital, circuit-node, and dissolving-pixel graphics. Only the initial brand cue retains a conventional loading bar. Second-hit offsets are editorial timing estimates, editable as zeroHitMs in captions.json.

## Revision 9
API-key deletion cursor now derives its position from the same remaining-character count and explicit text width as the key, following backspacing to the left.

## Contextual graphic refinement
Removed decorative confetti and atom-like orbits. Processing now uses a chip with input/output paths. Chorus graphics use erased documents, clearing memory, and buffer wipes. File deletion colors identify content and deletion states; colorful network nodes remain in routing and brand scenes.

## Revision 10
51.5–56.9 s instrumental replaced by an accelerating typography/tech collage. Cut accents follow measured audio-envelope attacks, with added half-beat changes near the end. Motifs build from tokens/prompt/compute/output/cache/forget, then collapse to CLEARED before the returning chorus.

Graphic assignment pass: distinct gate, expiry, shred, disconnect and release motifs for the five chorus returns; document purge reserved for nothing saved, disk graphic for nothing stored, GPU grid for GPU memory, wipe for wiped clean. Later interludes use address release and session reset. Build scene ends exactly at the returning chorus to avoid an overlapping cleared stamp.

## Revision 11
Continuous falling gold token coins replace the opening rails/arrows. Rebuilt the broken heart as a recognizable paired silhouette. Removed supplemental graphics from all repeated ZERO DATA RETENTION titles. File contents finish erasing before crosses appear. Routing advances through queued, routed and delivered with endpoint completion. Removed triangle decoration; added user-supplied transparent Bitdeer logo as a restrained header and prominent closing brand reprise.

## Revision 12 — 4K master
All logo placements use the official Bitdeer horizontal SVG from https://file.bitdeer.com/bd-public-prod/resources/images/logo-new1.svg?version=lucas (source page: https://www.bitdeer.com/brand-material). Vector paths preserve the exact brand artwork. Render master at 3840×2160, 60 fps with `--scale=2 --crf=16`; the design coordinate system remains 1920×1080.

## Revision 13 — scrolling lyrics edition
Replaces the kinetic collage video with a black five-line scrolling lyric layout. Official vector Bitdeer logo, green completed words and amber current-word fill, eased scrolling and small word lifts. src/scroll-lyrics.json contains corrected text and per-word Caption fields. Timings derive from prior Whisper word estimates; ad-libs, the opening corrected phrase and sung brand reprises use editorial estimates. Instrumental passages hold the lyrics without unrelated graphics. Original scene code is retained but unused; kinetic-entry.tsx preserves the former composition entry. Export remains native-rendered 4K 60 fps.

## Revision 14 — continuous highlight
Each word now fills left-to-right in one fixed green and retains the same green after completion. Removed the amber-to-green boundary switch, per-word vertical bounce, and toggling glow. Completed lines dim uniformly only once the next line begins, avoiding a reset before the last word completes.

## Revision 14 refinement — amber onset highlights
User requested retaining whimsy. Whole words now turn amber immediately at their timestamps, with a small 4 px bounce settling within 180 ms or the word duration, whichever is shorter. No letter sweep and no completion color reset. Completed words remain amber; only whole-line dimming happens on transition. Green remains in branding, line indicator and progress.

## Revision 15 — smooth amber line fill
Restored progressive left-to-right word-timed fill using amber throughout the line, with no completion color reset. Reduced word lift from 4 px to 1.5 px; a 320–520 ms raised-cosine curve starts and ends at zero velocity. This replaces the sharp bounce while preserving subtle motion.

## Revision 16 — vertical 4K advert with dancing Luca
New composition `ZDRVertical` for TikTok, Reels and Shorts. It is designed at 1080 × 1920 and rendered at `--scale=2`, so the master is 2160 × 3840 at 60 fps. The horizontal `ZeroDataRetention` composition is unchanged. Design spec: `docs/superpowers/specs/2026-09-30-zdr-vertical-ad-design.md`.

What's in it:
- **Luca:** a vector puppet redrawn from the official Welcome art, wearing a white Bitdeer hoodie. He dances 28 beat-locked moves, choreographed per lyric line, and lip-syncs using the word timings gated by vocal-band loudness.
- **Lyrics:** a three-line karaoke stack. Ad-libs become sticker bursts, and the Z-D-R hits become giant stamps.
- **Callouts:** advert copy shown during the instrumentals.
- **Brand:** the vector Bitdeer AI lockup (official SVG plus a rebuilt AI pill) and a 3 s end card.
- **Safe zone:** all text and Luca's face stay clear of the platform UI: top 220 px, bottom 420 px, and the right button column.

Commands:
- Render the master: `npm run render:vertical`, which writes `out/zdr-vertical-4k.mp4`.
- Preview: `npm run studio`, then pick `ZDRVertical`. `LucaSheet` (model sheet) and `ContactSheet` (12 moments in one still) are for development.
- Tests: `npm test`. These check lip-sync, the beat grid, the rig, choreography continuity, lyric data and the safe-zone layout.
- Beat analysis: `npm run analyze` regenerates `src/data/beats.json` and `src/data/audio-envelope.json` from `public/audio.mp3`. The tempo drifts from about 140 to 143 BPM, so beats come from dynamic-programming tracking, not a fixed grid. `override.shiftMs` and `override.downbeatOffset` in `beats.json` allow manual correction.

Where to edit:
- **Advert copy and end-card tagline:** `src/data/callouts.json`. Every line only repeats claims the song itself makes.
- **Choreography:** the `TABLE` in `src/luca/choreography.ts` (start ms, move, params).
- **Moves:** `src/luca/moves.ts`. Angles are mirrored per side: `a` raises the upper arm (0 down, 90 out, 180 up) and `b` bends the elbow. Raised hands are kept beside Luca's large head (`a` about 110–120) and drawn in front of it (`front: true`).
- **Artwork:** `src/luca/parts/Head.tsx` and `src/luca/parts/Body.tsx`, with colours in `src/luca/colors.ts`.
- **Layout and safe zone:** `src/vertical/layout.ts`.
- **Lighting energy by section:** `src/vertical/sections.ts`.

Fonts are Rubik (SIL Open Font License, `public/fonts/`), loaded locally.
