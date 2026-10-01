import React from 'react';
import data from '../data/callouts.json';
import {beatAt, msAtBeat} from '../timing';
import {LYRIC, FONT} from './layout';

const snap = (ms: number) => msAtBeat(Math.round(beatAt(ms)));
export const CARDS = data.callouts.map((c, i) => ({...c, start: snap(c.startMs), end: snap(c.endMs) - 30, i}));
const GRADS = ['linear-gradient(95deg, #36D0AC, #60F770)', 'linear-gradient(95deg, #F76B1C, #FBD16A)'];

const outBack = (x: number) => {const t = Math.max(0, Math.min(1, x)), c = 1.8; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;};

/** Whether a callout (not the lyric stack) owns the text zone at this time. */
export const calloutActive = (ms: number) => CARDS.some(c => ms >= c.start - 120 && ms < c.end + 60);

/** Advert copy cards: slam in, then "backspace" out with a block cursor. */
export const Callouts: React.FC<{ms: number}> = ({ms}) => {
	const card = CARDS.find(c => ms >= c.start && ms < c.end);
	if (!card) return null;
	const since = ms - card.start, left = card.end - ms;
	const enter = outBack(since / 240), fade = Math.min(1, since / 90);
	const erase = Math.max(0, Math.min(1, 1 - left / 300));
	const total = card.lines.join('').length, keep = Math.round(total * (1 - erase));
	let used = 0;
	const grad = GRADS[card.i % 2];
	return <div style={{
		position: 'absolute', left: LYRIC.left, right: 1080 - LYRIC.right, top: LYRIC.centerY, transform: `translateY(-50%) scale(${1.3 - 0.3 * enter}) rotate(${-4 * (1 - enter)}deg)`,
		opacity: fade, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: card.size, lineHeight: 1.02, letterSpacing: -1, color: '#F5F7F4',
		textShadow: '0 7px 0 rgba(0,0,0,0.4)',
	}}>
		{card.lines.map((line, li) => {
			const shown = line.slice(0, Math.max(0, keep - used));
			used += line.length;
			const lastLine = shown.length > 0 && (used >= keep || li === card.lines.length - 1);
			return <div key={li} style={{whiteSpace: 'pre', minHeight: '1em'}}>
				{shown.split(' ').map((w, k) => {
					const accent = card.accent.some(a => a.startsWith(w) && w.length > 0 && (a === w || erase > 0));
					return <React.Fragment key={k}>{k ? ' ' : ''}<span style={accent ? {background: grad, WebkitBackgroundClip: 'text', color: 'transparent', textShadow: 'none', filter: 'drop-shadow(0 7px 0 rgba(0,0,0,0.4))'} : undefined}>{w}</span></React.Fragment>;
				})}
				{erase > 0 && lastLine ? <span style={{display: 'inline-block', width: '0.5em', height: '0.9em', marginLeft: 6, verticalAlign: '-0.08em', background: '#60F770'}}/> : null}
			</div>;
		})}
	</div>;
};
