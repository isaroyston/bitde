import React from 'react';
import {SEGMENTS} from '../luca/choreography';
import {Pose} from '../luca/pose';
import {rig} from '../luca/rig';
import {beatAt} from '../timing';

const TAU = Math.PI * 2;
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {const t = clamp(x); return 1 - (1 - t) ** 3;};
type Place = {x: number; y: number; s: number};
const active = (ms: number, move: string) => SEGMENTS.filter(s => s.move === move && ms >= s.start && ms < s.end + 300);

const Shield: React.FC<{check?: boolean}> = ({check = false}) => <>
	<path d="M 0,-47 C 18,-37 35,-35 42,-35 V -3 Q 42,28 0,51 Q -42,28 -42,-3 V -35 C -35,-35 -18,-37 0,-47 Z" fill="url(#fxPrivacy)" stroke="#8DE0CA" strokeWidth={2.5} strokeLinejoin="round"/>
	{check ? <path d="M -18,0 L -5,13 L 21,-15" stroke="#CEFFED" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none"/> : <g fill="none" stroke="#D1FFEF" strokeWidth={2.7} strokeLinecap="round">
		<path d="M -11,-4 V -13 A 11,11 0 0 1 11,-13 V -4"/>
		<rect x={-17} y={-4} width={34} height={26} rx={4}/>
		<path d="M 0,4 V 12"/>
	</g>}
</>;

/** Small privacy cues track the existing choreography without adding text. */
export const Effects: React.FC<{ms: number; pose: Pose; place: Place; layer: 'back' | 'front'}> = ({ms, pose, place, layer}) => {
	const r = rig(pose), b = beatAt(ms);
	const to = (p: {x: number; y: number}) => ({x: place.x + p.x * place.s, y: place.y + p.y * place.s});
	const head = to(r.head), chest = to({x: r.pelvis.x, y: r.pelvis.y - 150});
	const items: React.ReactNode[] = [];
	if (layer === 'front') {
		for (const s of active(ms, 'heartHands')) {
			const since = ms - s.start, fadeOut = 1 - clamp((ms - s.end) / 250);
			const k = (0.5 + 0.5 * Math.cos(TAU * b)) ** 3;
			const e = ease(since / 320) * fadeOut;
			items.push(<g key={'shield' + s.start} transform={`translate(${chest.x} ${chest.y - 10}) scale(${(0.85 + 0.035 * k) * e})`} opacity={0.96}><Shield/></g>);
		}

		for (const s of active(ms, 'wipe')) {
			if (ms >= s.end) continue;
			const since = ms - s.start, w = to(r.arms[1].wrist);
			for (let i = 0; i < 9; i++) {
				const t = ((since / 1000) * 1.35 + i / 9) % 1;
				const x = w.x + Math.cos(i * 2.1) * (16 + 64 * t), y = w.y + Math.sin(i * 2.1) * 45 * t - 40 * t;
				items.push(<rect key={`erase${s.start}-${i}`} x={x} y={y} width={5 * (1 - t) + 1} height={5 * (1 - t) + 1} rx={1} fill="#B5F2DC" opacity={(1 - t) * 0.9}/>);
			}
		}

		// A protected document replaces floating question marks.
		for (const move of ['think', 'confused']) for (const s of active(ms, move)) {
			const since = ms - s.start, fadeOut = 1 - clamp((ms - s.end) / 250);
			const e = ease(since / 320) * fadeOut, x = head.x + 216, y = Math.max(969, head.y - 160);
			items.push(<g key={`doc${s.start}`} transform={`translate(${x} ${y - 5 * Math.sin(since / 1000)}) scale(${e * 0.85})`} opacity={0.88}>
				<path d="M -38,-50 H 16 L 40,-26 V 50 H -38 Z M 16,-50 V -26 H 40" fill="#102C2E" stroke="#83D7C2" strokeWidth={2}/>
				<path d="M -23,-17 H 20 M -23,-5 H 9 M -23,7 H 15" fill="none" stroke="#83D7C2" strokeWidth={3} opacity={0.5}/>
				<g transform="translate(30 28) scale(0.53)"><Shield/></g>
			</g>);
		}

		for (const s of active(ms, 'thumbsUp')) {
			const since = ms - s.start - 150, fadeOut = 1 - clamp((ms - s.end) / 250);
			if (since < 0) continue;
			const e = ease(since / 280) * fadeOut, x = head.x + 200, y = Math.max(970, head.y - 150);
			items.push(<g key={'verified' + s.start} transform={`translate(${x} ${y}) scale(${e})`}><Shield check/></g>);
		}

		for (const s of active(ms, 'callMe')) {
			if (ms >= s.end) continue;
			const w = to(r.arms[1].wrist), since = ms - s.start;
			[0, 1, 2].forEach(i => {
				const t = ((since / 1200) + i / 3) % 1;
				items.push(<path key={`link${i}`} d={`M ${w.x + 37 + 20 * t},${w.y - 34 - 20 * t} a ${30 + 22 * t} ${30 + 22 * t} 0 0 1 15,${44 + 24 * t}`} stroke="#86DCC6" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={(1 - t) * 0.65}/>);
			});
		}
	}

	// A brief boundary pulse and disappearing data fragments mark each chorus.
	// There is no confetti, gravity burst or full-screen light flash.
	if (layer === 'back') for (const s of SEGMENTS.filter(x => x.move === 'chorus')) {
		const t = (ms - s.start) / 1300;
		if (t < 0 || t > 1) continue;
		const radius = 145 + ease(t) * 126;
		for (let i = 0; i < 20; i++) {
			const a = TAU * i / 20;
			const x = chest.x + Math.cos(a) * radius, y = chest.y + Math.sin(a) * radius * 0.55;
			const size = (i % 3 === 0 ? 5 : 3) * (1 - t * 0.55);
			items.push(<rect key={`clear${s.start}-${i}`} x={x - size / 2} y={y - size / 2} width={size} height={size} rx={0.8} fill={i % 2 ? '#83D7C2' : '#D0F9EC'} opacity={Math.sin(Math.PI * t) * 0.66}/>);
		}
	}

	return <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
		<defs><linearGradient id="fxPrivacy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#245A52"/><stop offset="1" stopColor="#0B272B"/></linearGradient></defs>
		{items}
	</svg>;
};
