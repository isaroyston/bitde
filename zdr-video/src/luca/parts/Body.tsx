import React from 'react';
import {staticFile} from 'remotion';
import {C, LINE} from '../colors';
import {ArmRig, Pt} from '../rig';
import {Hand} from '../pose';

const LIMB = 60;
const cap = {strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none'} as const;
const poly = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

// ---------- legs ----------
export const Leg: React.FC<{hip: Pt; knee: Pt; ankle: Pt; side: number; lift: number}> = ({hip, knee, ankle, side, lift}) => {
	const d = poly([hip, knee, ankle]);
	const tilt = side * Math.min(18, lift * 0.35);
	const foot = 'M -30,-9 C -21,-19 -1,-21 13,-19 C 38,-16 53,-1 53,16 L 53,24 C 53,28 49,30 42,30 L -32,30 C -37,30 -40,26 -40,20 L -40,0 C -40,-6 -36,-9 -30,-9 Z';
	return <g>
		<path d={d} stroke={C.outline} strokeWidth={LIMB + LINE * 2} {...cap}/>
		<path d={d} stroke={C.fur} strokeWidth={LIMB} {...cap}/>
		<g transform={`translate(${ankle.x} ${ankle.y}) rotate(${tilt}) scale(${side} 1)`}>
			<path d={foot} fill={C.fur} stroke={C.outline} strokeWidth={LINE} strokeLinejoin="round"/>
			<path d="M -34,23 L 47,23" stroke={C.furShade} strokeWidth={6} strokeLinecap="round"/>
		</g>
	</g>;
};

// ---------- torso (white Bitdeer hoodie) ----------
const BODY = 'M -118,-208 C -138,-150 -150,-70 -152,-14 C -152,2 -140,8 -120,8 L 120,8 C 140,8 152,2 152,-14 C 150,-70 138,-150 118,-208 C 70,-238 -70,-238 -118,-208 Z';
const POCKET = 'M -78,-104 L 78,-104 C 88,-104 92,-98 94,-88 L 106,-34 L -106,-34 L -94,-88 C -92,-98 -88,-104 -78,-104 Z';

export const Torso: React.FC<{id: string}> = ({id}) => <g>
	<defs><clipPath id={`${id}-body`}><path d={BODY}/></clipPath></defs>
	{/* Official front-facing Luca art uses compact shorts above short, straight legs. */}
	<path d="M -112,-18 L 112,-18 L 103,62 L 14,62 L 0,44 L -14,62 L -103,62 Z" fill="#303334" stroke={C.outline} strokeWidth={LINE} strokeLinejoin="round"/>
	<path d="M -101,50 L -18,50 M 18,50 L 101,50 M 0,10 L 0,44" stroke="#515758" strokeWidth={5} fill="none"/>
	<path d="M -134,-196 C -156,-262 156,-262 134,-196 Z" fill={C.hoodieShade} stroke={C.outline} strokeWidth={LINE} strokeLinejoin="round"/>
	<path d={BODY} fill={C.hoodie}/>
	<g clipPath={`url(#${id}-body)`}>
		<rect x={104} y={-240} width={60} height={260} fill={C.hoodieShade}/>
		<ellipse cx={0} cy={-214} rx={124} ry={30} fill={C.hoodieDeep} opacity={0.55}/>
		<rect x={-160} y={-28} width={320} height={40} fill={C.hoodieShade}/>
		<path d="M -150,-28 L 150,-28" stroke={C.outline} strokeWidth={5}/>
	</g>
	<path d={POCKET} fill={C.hoodie} stroke={C.outline} strokeWidth={5} strokeLinejoin="round"/>
	<path d="M -94,-88 L -106,-34 M 94,-88 L 106,-34" stroke={C.hoodieDeep} strokeWidth={4}/>
	<image href={staticFile('bitdeer-ai-logo.png')} x={-63} y={-137} width={126} height={31.5} preserveAspectRatio="xMidYMid meet"/>
	{[-1, 1].map(s => <g key={s}>
		<path d={`M ${s * 30},-212 C ${s * 32},-194 ${s * 30},-176 ${s * 36},-156`} stroke={C.string} strokeWidth={7} {...cap}/>
		<rect x={s * 36 - 7} y={-160} width={14} height={20} rx={6} fill={C.stringTip} stroke={C.outline} strokeWidth={4}/>
	</g>)}
	<path d={BODY} fill="none" stroke={C.outline} strokeWidth={LINE} strokeLinejoin="round"/>
</g>;

// ---------- hands (origin at the wrist, +y continues the forearm) ----------
const Finger: React.FC<{from: Pt; to: Pt; w?: number}> = ({from, to, w = 22}) => {
	const d = `M ${from.x},${from.y} L ${to.x},${to.y}`;
	return <g><path d={d} stroke={C.outline} strokeWidth={w + LINE * 1.8} {...cap}/><path d={d} stroke={C.fur} strokeWidth={w} {...cap}/></g>;
};
const Fist: React.FC = () => <g>
	<circle cx={0} cy={26} r={32} fill={C.fur} stroke={C.outline} strokeWidth={LINE}/>
	<path d="M -14,44 Q -8,52 -2,46 M 4,46 Q 10,52 16,44" stroke={C.outline} strokeWidth={5} {...cap}/>
</g>;

/** Rotation that makes a hand-local vector point straight up on screen. */
const upIn = (handDeg: number) => -90 - handDeg;

export const HandShape: React.FC<{hand: Hand; side: number; handDeg: number; snip: number}> = ({hand, side, handDeg, snip}) => {
	if (hand === 'open') return <g>
		<ellipse cx={-side * 25} cy={16} rx={13} ry={19} transform={`rotate(${-side * 30} ${-side * 25} 16)`} fill={C.fur} stroke={C.outline} strokeWidth={LINE}/>
		<ellipse cx={0} cy={30} rx={31} ry={37} fill={C.fur} stroke={C.outline} strokeWidth={LINE}/>
		<path d="M -10,54 L -12,64 M 8,55 L 9,65" stroke={C.outline} strokeWidth={5} {...cap}/>
	</g>;
	if (hand === 'point') return <g><Finger from={{x: 0, y: 40}} to={{x: 0, y: 82}}/><Fist/></g>;
	if (hand === 'peace') {
		const s = 10 + 14 * snip;
		return <g><Finger from={{x: -6, y: 40}} to={{x: -s, y: 84}}/><Finger from={{x: 6, y: 40}} to={{x: s, y: 84}}/><Fist/></g>;
	}
	if (hand === 'shaka') return <g><Finger from={{x: -side * 20, y: 18}} to={{x: -side * 46, y: 4}} w={20}/><Finger from={{x: side * 16, y: 44}} to={{x: side * 34, y: 66}} w={18}/><Fist/></g>;
	if (hand === 'thumb') {
		const a = upIn(handDeg) * Math.PI / 180, base = {x: 0, y: 26};
		const tip = {x: base.x + 50 * Math.cos(a), y: base.y + 50 * Math.sin(a)};
		return <g><Fist/><Finger from={{x: base.x + 22 * Math.cos(a), y: base.y + 22 * Math.sin(a)}} to={tip} w={24}/></g>;
	}
	return <Fist/>;
};

// ---------- arms ----------
/** Sleeve outline is masked near the shoulder so the arm merges into the hoodie. */
export const ArmOutline: React.FC<{r: ArmRig; id: string}> = ({r, id}) => {
	const d = poly([r.shoulder, r.elbow, r.wrist]);
	const mid = `${id}-sh${r.side}`;
	return <g>
		<mask id={mid} maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={4000} height={4000}>
			<rect x={-2000} y={-2000} width={4000} height={4000} fill="white"/>
			<circle cx={r.shoulder.x} cy={r.shoulder.y} r={LIMB / 2 + LINE + 4} fill="black"/>
		</mask>
		<path d={d} stroke={C.outline} strokeWidth={LIMB + LINE * 2} {...cap} mask={`url(#${mid})`}/>
	</g>;
};

export const ArmFill: React.FC<{r: ArmRig; snip: number}> = ({r, snip}) => {
	const fd = {x: r.wrist.x - r.elbow.x, y: r.wrist.y - r.elbow.y}, len = Math.hypot(fd.x, fd.y) || 1;
	const u = {x: fd.x / len, y: fd.y / len};
	const cuffA = {x: r.wrist.x - u.x * 24, y: r.wrist.y - u.y * 24}, cuffB = {x: r.wrist.x - u.x * 6, y: r.wrist.y - u.y * 6};
	const handDeg = r.angle - 90 + r.side * r.arm.rot;
	return <g>
		<path d={poly([r.shoulder, r.elbow, r.wrist])} stroke={C.hoodie} strokeWidth={LIMB} {...cap}/>
		<path d={poly([cuffA, cuffB])} stroke={C.hoodieShade} strokeWidth={LIMB - 2} strokeLinecap="butt"/>
		<path d={poly([cuffB, {x: cuffB.x + u.x, y: cuffB.y + u.y}])} stroke={C.outline} strokeWidth={LIMB - 4} strokeLinecap="butt" opacity={0.5}/>
		<g transform={`translate(${r.wrist.x} ${r.wrist.y}) rotate(${handDeg}) scale(1.2)`}>
			<HandShape hand={r.arm.hand} side={r.side} handDeg={handDeg} snip={snip}/>
		</g>
	</g>;
};
