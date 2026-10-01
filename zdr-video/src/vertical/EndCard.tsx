import React from 'react';
import data from '../data/callouts.json';
import {BrandLockup, LOCKUP_ASPECT} from './BrandLockup';
import {HEADER, FONT} from './layout';
import {BRAND_LINES, END_MS} from './sections';
import {beatAt} from '../timing';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {const t = clamp01(x); return t * t * (3 - 2 * t);};
const outBack = (x: number) => {const t = clamp01(x), c = 1.7; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const END = {lockupY: 640, lockupW: 820, labelY: 790, line1Y: 906, line2Y: 980, lucaGround: 1480, lucaScale: 0.46};
export const endProgress = (ms: number) => smooth((ms - END_MS) / 700);

/** Header lockup: snaps in on "Hey!", pulses on the sung brand lines, then glides into the end card. */
export const Header: React.FC<{ms: number}> = ({ms}) => {
	const appear = outBack((ms - 2060) / 260);
	if (appear <= 0) return null;
	const e = endProgress(ms);
	const brand = Math.max(...BRAND_LINES.map(([a, b]) => smooth((ms - a + 120) / 220) * (1 - smooth((ms - b) / 300))));
	const beat = (0.5 + 0.5 * Math.cos(2 * Math.PI * beatAt(ms))) ** 3;
	const w = lerp(HEADER.width, END.lockupW, e), y = lerp(HEADER.y, END.lockupY, e);
	const scale = appear * (1 + 0.12 * brand + 0.03 * brand * beat);
	const labelY = lerp(HEADER.labelY, END.labelY, e);
	return <>
		<div style={{position: 'absolute', left: 540 - w / 2, top: y - (w * LOCKUP_ASPECT) / 2, width: w, transform: `scale(${scale})`, transformOrigin: 'center center',
			filter: brand > 0.01 ? `drop-shadow(0 0 ${28 * brand}px rgba(96,247,112,${0.55 * brand}))` : undefined}}>
			<BrandLockup width={w}/>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: labelY - 16, textAlign: 'center', fontFamily: FONT, fontWeight: 500,
			fontSize: lerp(30, 36, e), letterSpacing: lerp(1.5, 2, e), color: e > 0.5 ? '#DDE7E2' : '#AFC5BF', opacity: clamp01((ms - 2200) / 300)}}>
			{data.endCard.label}
		</div>
	</>;
};

/** Dims the stage (not Luca) behind the end card. */
export const EndDim: React.FC<{ms: number}> = ({ms}) => {
	const e = endProgress(ms);
	return e > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(3,6,10,${0.5 * e})`}}/> : null;
};

export const EndCard: React.FC<{ms: number}> = ({ms}) => {
	const e = endProgress(ms);
	if (e <= 0) return null;
	const l1 = outBack((ms - END_MS - 450) / 380), l2 = outBack((ms - END_MS - 700) / 380);
	const flash = Math.exp(-Math.max(0, ms - END_MS) / 160) * 0.35;
	const [line1, line2] = data.endCard.tagline;
	return <>
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 42%, rgba(200,255,230,${flash}) 0%, rgba(200,255,230,0) 65%)`}}/>
		<div style={{position: 'absolute', left: 140, right: 140, top: END.labelY + 44, height: 4, borderRadius: 2, background: 'linear-gradient(90deg, rgba(54,208,172,0), #36D0AC, #60F770, rgba(96,247,112,0))', transform: `scaleX(${smooth((ms - END_MS - 300) / 400)})`}}/>
		<div style={{position: 'absolute', left: 0, right: 0, top: END.line1Y - 38, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 60, letterSpacing: -1,
			color: '#F5F7F4', opacity: clamp01(l1), transform: `translateY(${24 * (1 - l1)}px)`}}>
			<span style={{color: '#83E5C6'}}>{line1.split(' ')[0]}</span>
			{' ' + line1.split(' ').slice(1).join(' ')}
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: END.line2Y - 38, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 60, letterSpacing: -1,
			color: '#B9C8C1', opacity: clamp01(l2), transform: `translateY(${20 * (1 - l2)}px)`}}>{line2}</div>
	</>;
};
