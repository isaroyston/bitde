import React from 'react';
import {C, LINE} from '../colors';
import {Pose} from '../pose';
import {Mouth} from '../lipsync';

// Reconstructed from the front-facing official 画板11 / 组1 artwork, with
// the cheek, ear and muzzle shapes checked against the 3D 贴纸4 reference.
// Luca's characteristic shape is a domed forehead over broad, low cheeks.
const HEAD = 'M 0,-230 C 145,-230 241,-147 254,-16 C 258,22 258,52 252,70 L 272,68 C 260,131 235,177 183,199 C 88,240 -88,240 -183,199 C -235,177 -260,131 -272,68 L -252,70 C -258,52 -258,22 -254,-16 C -241,-147 -145,-230 0,-230 Z';
const EAR = 'M -243,-37 C -294,-72 -331,-127 -330,-193 C -291,-217 -236,-207 -192,-165 Z';
const EAR_IN = 'M -250,-60 C -286,-90 -314,-131 -321,-184 C -282,-177 -247,-151 -229,-111 Z';
const EAR_DEEP = 'M -246,-77 C -274,-93 -292,-112 -287,-135 C -284,-147 -279,-155 -274,-159 C -252,-143 -241,-124 -233,-107 Z';
const MUZZLE = 'M 0,57 C 23,40 65,39 73,72 C 84,111 40,148 0,163 C -40,148 -84,111 -73,72 C -65,39 -23,40 0,57 Z';
const NOSE = 'M 0,75 C 11,67 35,63 35,79 C 35,96 16,104 0,109 C -16,104 -35,96 -35,79 C -35,63 -11,67 0,75 Z';
// A single silhouette avoids the outlined crossing strokes of the old fork.
// The side tine sits low and the long rounded tip splays outwards.
const ANTLER = 'M -143,-174 L -164,-205 C -184,-203 -209,-201 -232,-207 C -254,-212 -256,-236 -239,-244 C -221,-252 -193,-240 -183,-238 C -205,-270 -231,-311 -227,-335 C -223,-361 -199,-370 -179,-356 C -150,-336 -139,-289 -127,-244 L -117,-195 Z';

const Antler: React.FC<{side: number; wobble: number; id: string}> = ({side, wobble, id}) => (
	<g transform={`scale(${side},1) rotate(${-wobble} -120 -200)`}>
		<path d={ANTLER} fill={`url(#${id}-antler)`} stroke={C.outline} strokeWidth={LINE + 2} strokeLinejoin="round"/>
	</g>
);

const Ear: React.FC<{side: number; wobble: number}> = ({side, wobble}) => (
	<g transform={`scale(${side},1) rotate(${-wobble} -205 -110)`}>
		<path d={EAR} fill={C.fur} stroke={C.outline} strokeWidth={LINE} strokeLinejoin="round"/>
		<path d={EAR_IN} fill={C.earIn}/>
		<path d={EAR_DEEP} fill={C.earDeep}/>
	</g>
);

type EyeProps = {cx: number; side: number; state: Pose['eyes']; lookX: number; lookY: number; blink: number; squeeze: number; id: string};
const Eye: React.FC<EyeProps> = ({cx, side, state, lookX, lookY, blink, squeeze, id}) => {
	const cy = 42;
	const arc = (d: string) => <path d={d} stroke={C.outline} strokeWidth={10} strokeLinecap="round" fill="none"/>;
	const happy = state === 'happy' || (state === 'wink' && side > 0);
	if (happy) return arc(`M ${cx - 46},${cy + 14} Q ${cx},${cy - 44} ${cx + 46},${cy + 14}`);
	if (state === 'closed' || blink > 0.65) return <g>
		{arc(`M ${cx - 48},${cy + 4} Q ${cx},${cy + 30} ${cx + 48},${cy + 4}`)}
		{arc(`M ${cx + side * 46},${cy + 6} L ${cx + side * 62},${cy - 6}`)}
	</g>;
	const wide = state === 'wide', blank = state === 'blank';
	const open = 1 - 0.92 * Math.min(1, blink / 0.65);
	const shape = 'M -57,42 C -71,9 -68,-36 -40,-54 C -4,-77 52,-52 58,-14 C 61,8 58,26 56,43 C 25,53 -22,56 -57,42 Z';
	return <g transform={`translate(${cx} ${cy}) scale(${-side * squeeze * (wide ? 1.04 : 1)} ${open * (wide ? 1.12 : 1)})`}>
		<clipPath id={`${id}-eye${side}`}><path d={shape}/></clipPath>
		<path d={shape} fill={C.white}/>
		<g clipPath={`url(#${id}-eye${side})`}>
			{blank ? <circle cx={-side * lookX * 8} cy={lookY * 6} r={14} fill={C.eye}/> : <g transform={`translate(${-side * lookX * 7} ${lookY * 5})`}>
				<path d="M -40,52 C -51,17 -47,-25 -22,-46 C 5,-68 55,-42 61,-8 L 62,52 Z" fill={C.eye}/>
				<path d="M -58,-15 C -52,-65 23,-74 53,-27 C 22,-51 -18,-58 -46,-20 Z" fill={C.eyeLid}/>
				<circle cx={-29} cy={-33} r={16} fill={C.white}/>
			</g>}
		</g>
		<path d="M -61,30 C -75,-11 -61,-43 -39,-56 C -5,-76 42,-56 55,-27 M -56,42 C -24,55 25,56 56,43" fill="none" stroke={C.outline} strokeWidth={6} strokeLinecap="round"/>
		<path d="M -66,-13 L -73,-10 L -66,-3" fill={C.outline} stroke={C.outline} strokeWidth={5} strokeLinejoin="round"/>
	</g>;
};

const Brow: React.FC<{side: number; raise: number}> = ({side, raise}) => {
	const x = side * 100, y = -64 - 12 * raise, a = -side * (40 - 14 * raise);
	return <g>
		<ellipse cx={x} cy={y + 10} rx={25} ry={15} transform={`rotate(${a} ${x} ${y + 10})`} fill={C.browShadow}/>
		<ellipse cx={x} cy={y} rx={25} ry={15} transform={`rotate(${a} ${x} ${y})`} fill={C.brow} stroke={C.outline} strokeWidth={5}/>
	</g>;
};

/** Parametric mouth: flat top for "ah", arched top for "oo". */
const MouthShape: React.FC<{m: Mouth; expression: Pose['expression']; id: string}> = ({m, expression, id}) => {
	let {open, w, h, round} = m;
	if (open < 0.08) {
		if (expression === 'grin') ({open, w, h, round} = {open: 0.55, w: 1.1, h: 0.8, round: 0});
		else if (expression === 'o') ({open, w, h, round} = {open: 0.45, w: 0.5, h: 0.6, round: 1});
	}
	const H = 31 * h * open, halfW = 28 * w * (0.72 + 0.28 * Math.min(1, open));
	if (H < 4) {
		if (expression === 'flat') return <path d="M -18,124 L 18,124" stroke={C.outline} strokeWidth={7} strokeLinecap="round"/>;
		return <path d="M 0,109 L 0,123 Q 12,140 26,122" stroke={C.outline} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none"/>;
	}
	const y0 = 119 - 0.25 * H * round, top = y0 - H * 0.45 * round;
	const d = `M ${-halfW},${y0} C ${-halfW * 0.55},${top} ${halfW * 0.55},${top} ${halfW},${y0} C ${halfW * 1.02},${y0 + H * 1.28} ${-halfW * 1.02},${y0 + H * 1.28} ${-halfW},${y0} Z`;
	return <g>
		<clipPath id={`${id}-mouth`}><path d={d}/></clipPath>
		<path d={d} fill={C.mouth}/>
		<ellipse cx={0} cy={y0 + H * 0.82} rx={halfW * 0.64} ry={H * 0.38} fill={C.tongue} clipPath={`url(#${id}-mouth)`}/>
		<path d={d} fill="none" stroke={C.outline} strokeWidth={7} strokeLinejoin="round"/>
	</g>;
};

export type HeadProps = {p: Pose; mouth: Mouth; blink: number; wobble: {sym: number; lat: number}; id: string};

export const Head: React.FC<HeadProps> = ({p, mouth, blink, wobble, id}) => {
	const turn = p.headTurn, face = turn * 30;
	const jaw = 1 + Math.max(0, mouth.open * mouth.h) * 0.04;
	return <g>
		<defs>
			<linearGradient id={`${id}-antler`} gradientUnits="userSpaceOnUse" x1={0} y1={-370} x2={0} y2={-230}>
				<stop offset="0" stopColor={C.antlerTop}/><stop offset="1" stopColor={C.antlerBottom}/>
			</linearGradient>
			<clipPath id={`${id}-head`}><path d={HEAD}/></clipPath>
		</defs>
		<g transform={`translate(${-turn * 12} 0)`}>
			<Antler side={-1} wobble={wobble.sym + wobble.lat} id={id}/>
			<Antler side={1} wobble={wobble.sym - wobble.lat} id={id}/>
			<Ear side={-1} wobble={wobble.sym * 1.3 + wobble.lat} />
			<Ear side={1} wobble={wobble.sym * 1.3 - wobble.lat} />
		</g>
		<path d={HEAD} fill={C.furShade}/>
		<g clipPath={`url(#${id}-head)`}>
			<path d={HEAD} fill={C.fur} transform="translate(0 -8) scale(0.995)"/>
		</g>
		<path d={HEAD} fill="none" stroke={C.outline} strokeWidth={LINE + 1} strokeLinejoin="round"/>
		<g transform={`translate(${face} 0)`}>
			{[-1, 1].map(s => <ellipse key={s} cx={s * 196} cy={104} rx={34} ry={18} fill={C.blush} opacity={p.blush * 0.55}/>)}
			<Brow side={-1} raise={p.browL}/>
			<Brow side={1} raise={p.browR}/>
			{[-1, 1].map(s => <Eye key={s} cx={s * 142} side={s} state={p.eyes} lookX={p.lookX} lookY={p.lookY} blink={blink}
				squeeze={1 - 0.22 * Math.max(0, -s * turn)} id={id}/>)}
			<g transform={`translate(${face * 0.35} 0)`}>
				<path d={MUZZLE} fill={C.white} stroke={C.outline} strokeWidth={6} strokeLinejoin="round" transform={`translate(0 50) scale(1 ${jaw}) translate(0 -50)`}/>
				<MouthShape m={mouth} expression={p.expression} id={id}/>
				<path d="M 0,106 L 0,119" stroke={C.outline} strokeWidth={5} strokeLinecap="round"/>
				<path d={NOSE} fill={C.nose}/>
			</g>
		</g>
	</g>;
};
