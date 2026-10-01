import React from 'react';
import {interpolate, Easing} from 'remotion';
import {DISPLAY_LINES} from './lyricsData';
import {fitLine, LYRIC, FONT} from './layout';

const FITS = DISPLAY_LINES.map(l => fitLine(l.text));
const ease = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.85, 0.25, 1)} as const;
const AMBER = '#83E5C6';
const GREEN = 'linear-gradient(95deg, #36D0AC, #60F770)';

/** Three-line karaoke stack: previous (dim), current (large, word fill), next (dim). */
export const Lyrics: React.FC<{ms: number; visible: number}> = ({ms, visible}) => {
	let scroll = 0;
	for (let i = 1; i < DISPLAY_LINES.length; i++) scroll += interpolate(ms, [DISPLAY_LINES[i].startMs - 140, DISPLAY_LINES[i].startMs + 220], [0, 1], ease);
	const current = DISPLAY_LINES.findLastIndex(line => ms >= line.startMs);
	const line = DISPLAY_LINES[current];
	const next = DISPLAY_LINES[current + 1];
	// Clear completed lyrics during instrumental passages; no unrelated copy or
	// stale sung words sit on screen for several seconds after the voice stops.
	const gap = line && (next?.startMs ?? Infinity) - line.endMs > 900;
	const gapOpacity = gap
		? 1 - interpolate(ms, [line.endMs + 200, line.endMs + 500], [0, 1], ease)
			* (next ? 1 - interpolate(ms, [next.startMs - 240, next.startMs], [0, 1], ease) : 1)
		: 1;
	visible *= gapOpacity;
	if (visible <= 0.001) return null;
	return <div style={{position: 'absolute', left: LYRIC.left, width: LYRIC.right - LYRIC.left, top: 0, height: '100%', opacity: visible, fontFamily: FONT}}>
		{DISPLAY_LINES.map((line, i) => {
			const offset = i - scroll;
			if (Math.abs(offset) > 1.6) return null;
			const a = Math.min(1, Math.abs(offset));
			const scale = 1 - 0.5 * a, y = LYRIC.centerY + offset * LYRIC.spacing;
			const fit = FITS[i];
			let wordIndex = 0;
			return <div key={i} style={{
				position: 'absolute', left: 0, right: 0, top: y, transform: `translateY(-50%) scale(${scale})`, transformOrigin: 'center center',
				opacity: (1 - (offset < 0 ? 0.74 : 0.6) * a) * (Math.abs(offset) > 1 ? Math.max(0, 1.6 - Math.abs(offset)) / 0.6 : 1),
				textAlign: 'center', fontSize: fit.size, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2,
				color: a > 0.5 ? '#93A09A' : '#F5F7F4', textShadow: '0 2px 16px rgba(0,0,0,0.25)',
			}}>
				{fit.rows.map((row, r) => <div key={r} style={{whiteSpace: 'nowrap'}}>
					{row.split(' ').map((_, k) => {
						const w = line.words[wordIndex++];
						const fill = interpolate(ms, [w.startMs, Math.max(w.startMs + 1, w.endMs)], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						const since = ms - w.startMs;
						const pop = since > 0 && since < 300 ? Math.sin(Math.PI * since / 300) : 0;
						const zero = /^zero/i.test(w.text);
						return <React.Fragment key={k}>
							{k > 0 ? ' ' : ''}
							<span style={{position: 'relative', display: 'inline-block', transform: `translateY(${-1.5 * pop * (1 - a)}px)`}}>
								<span style={zero && a < 0.5 ? {background: GREEN, WebkitBackgroundClip: 'text', color: 'transparent', opacity: 0.55, textShadow: 'none'} : undefined}>{w.text}</span>
								<span style={{
									position: 'absolute', left: 0, top: 0, clipPath: `inset(-20% ${100 - fill}% -20% -5%)`, opacity: 1 - a,
									...(zero ? {background: GREEN, WebkitBackgroundClip: 'text', color: 'transparent', textShadow: 'none'} : {color: AMBER}),
								}}>{w.text}</span>
							</span>
						</React.Fragment>;
					})}
				</div>)}
			</div>;
		})}
	</div>;
};
