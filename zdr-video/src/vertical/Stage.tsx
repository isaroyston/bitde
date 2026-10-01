import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, LUCA} from './layout';
import {beatAt} from '../timing';
import {energyAt, bassAt} from './sections';

const TAU = Math.PI * 2;
const rand = (i: number) => {const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};
const clamp = (n: number) => Math.max(0, Math.min(1, n));

// Perimeter-only traffic keeps the typography and Luca's face clear. Packets
// disappear into small fragments before they reach the protected floor.
const PACKETS = Array.from({length: 12}, (_, i) => ({
	i, x: i % 2 ? 927 + rand(i + 80) * 76 : 76 + rand(i + 80) * 76,
	phase: rand(i + 20), speed: 0.035 + rand(i + 40) * 0.018,
	size: 20 + rand(i + 60) * 11,
}));
const DUST = Array.from({length: 24}, (_, i) => ({
	x: rand(i + 300) * W, y: 910 + rand(i + 400) * 770,
	r: 0.7 + rand(i + 500) * 1.1, phase: rand(i + 600) * TAU,
}));

const Lock: React.FC<{size: number}> = ({size}) => <g transform={`scale(${size / 30})`} fill="none" stroke="#8BE4D2" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
	<path d="M -8,-2 V -9 A 8,8 0 0 1 8,-9 V -2"/>
	<rect x={-13} y={-2} width={26} height={21} rx={4} fill="#0B282A"/>
	<path d="M 0,6 v 6" strokeWidth={2.5}/>
</g>;

const Packet: React.FC<{size: number; variant: number}> = ({size, variant}) => {
	if (variant % 3 === 0) return <Lock size={size}/>;
	return <g transform={`scale(${size / 30})`} fill="#0B2528" stroke="#7AD8C5" strokeWidth={1.5} strokeLinejoin="round">
		{variant % 3 === 1 ? <>
			<path d="M -16,-22 H 6 L 17,-11 V 22 H -16 Z"/>
			<path d="M 6,-22 V -11 H 17 M -8,-4 H 8 M -8,3 H 3 M -8,10 H 7" fill="none" opacity={0.75}/>
		</> : <>
			<path d="M 0,-23 L 20,-16 V -1 Q 19,15 0,25 Q -19,15 -20,-1 V -16 Z"/>
			<path d="M -7,-1 V -7 A 7,7 0 0 1 7,-7 V -1 M -10,-1 H 10 V 12 H -10 Z M 0,3 V 7" fill="none"/>
		</>}
	</g>;
};

/** A protected session enclosure: quiet architectural lighting and ephemeral data. */
export const Stage: React.FC<{ms: number}> = ({ms}) => {
	const t = ms / 1000, b = beatAt(ms), e = energyAt(ms), bass = bassAt(ms);
	const pulse = (0.5 + 0.5 * Math.cos(TAU * b)) ** 3;
	const boundary = 0.37 + e * 0.1 + pulse * bass * 0.045;
	const shield = 'M 540,908 C 644,966 766,972 862,972 L 862,1200 C 862,1395 725,1518 540,1608 C 355,1518 218,1395 218,1200 L 218,972 C 314,972 436,966 540,908 Z';
	return <AbsoluteFill style={{background: 'linear-gradient(180deg, #050C10 0%, #071519 57%, #081A1D 77%, #040B0E 100%)'}}>
		<AbsoluteFill style={{background: [
			'radial-gradient(ellipse 72% 38% at 50% 67%, rgba(26,109,101,0.19), rgba(26,109,101,0) 80%)',
			'radial-gradient(ellipse 80% 45% at 50% 25%, rgba(21,55,63,0.15), rgba(21,55,63,0) 80%)',
		].join(',')}}/>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<defs>
				<linearGradient id="privacyBoundary" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#94E9D6"/><stop offset="0.45" stopColor="#3AAE9C"/><stop offset="1" stopColor="#267F77"/></linearGradient>
				<linearGradient id="privacyGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#266C66" stopOpacity={0.12}/><stop offset="0.52" stopColor="#102B2D" stopOpacity={0.05}/><stop offset="1" stopColor="#2B8476" stopOpacity={0.1}/></linearGradient>
				<linearGradient id="privacyFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#183632"/><stop offset="1" stopColor="#071619"/></linearGradient>
				<radialGradient id="privacyFloorLight"><stop offset="0" stopColor="#58C6B0" stopOpacity={0.16}/><stop offset="1" stopColor="#58C6B0" stopOpacity={0}/></radialGradient>
				<linearGradient id="privacyRail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#74DCC5" stopOpacity={0}/><stop offset="0.3" stopColor="#74DCC5" stopOpacity={0.23}/><stop offset="0.85" stopColor="#74DCC5" stopOpacity={0.16}/><stop offset="1" stopColor="#74DCC5" stopOpacity={0}/></linearGradient>
			</defs>

			{/* The broad, dim shield reads as a room around the character, not a prop. */}
			<path d={shield} fill="url(#privacyGlass)" stroke="url(#privacyBoundary)" strokeWidth={2.5} opacity={boundary}/>
			<path d={shield} transform="translate(540 1260) scale(0.93 0.925) translate(-540 -1260)" fill="none" stroke="#69CBB7" strokeWidth={1} opacity={0.095}/>
			<path d="M 218,1074 V 972 H 306 M 774,972 H 862 V 1074" fill="none" stroke="#83DCC7" strokeWidth={3} opacity={0.25}/>
			{[52, 182, 898, 1028].map((x, i) => <path key={x} d={`M ${x},880 V ${1415 + (i % 2) * 55} l ${x < 540 ? 62 : -62},62 v 160`} fill="none" stroke="url(#privacyRail)" strokeWidth={1}/>) }
			{DUST.map((d, i) => <circle key={i} cx={d.x} cy={d.y - Math.sin(t * 0.11 + i) * 15} r={d.r} fill="#A0E6D7" opacity={0.045 + 0.075 * (0.5 + 0.5 * Math.sin(t * 0.7 + d.phase))}/>)}

			{PACKETS.map(p => {
				const progress = (p.phase + t * p.speed) % 1;
				const y = 876 + progress * 688, x = p.x + Math.sin(t * 0.17 + p.i) * 7;
				const fadeIn = clamp(progress / 0.1), dissolve = clamp((progress - 0.76) / 0.16);
				return <g key={p.i} opacity={fadeIn * 0.43}>
					<g transform={`translate(${x} ${y}) rotate(${Math.sin(t * 0.15 + p.i) * 5})`} opacity={1 - dissolve}><Packet size={p.size} variant={p.i}/></g>
					{dissolve > 0 && Array.from({length: 7}, (_, j) => {
						const dx = (rand(p.i * 9 + j + 900) - 0.5) * (22 + dissolve * 64);
						const dy = (rand(p.i * 9 + j + 1000) - 0.5) * 30 + dissolve * (12 + j * 4);
						return <rect key={j} x={x + dx} y={y + dy} width={2.4} height={2.4} rx={0.5} fill="#89D8C6" opacity={Math.sin(dissolve * Math.PI) * (1 - clamp((progress - 0.93) / 0.07))}/>;
					})}
				</g>;
			})}

			{/* A shallow, shield-shaped session surface replaces the concert podium. */}
			<ellipse cx={LUCA.x} cy={LUCA.groundY + 17} rx={435} ry={109} fill="url(#privacyFloorLight)"/>
			<path d="M 256,1510 L 824,1510 L 926,1585 Q 770,1690 540,1722 Q 310,1690 154,1585 Z" fill="url(#privacyFloor)" fillOpacity={0.62} stroke="#448D81" strokeWidth={1.5} strokeOpacity={0.29}/>
			<path d="M 292,1526 L 788,1526 L 879,1583 Q 735,1670 540,1696 Q 345,1670 201,1583 Z" fill="none" stroke="#79CDB8" strokeWidth={1} strokeOpacity={0.13}/>
			<path d="M 154,1585 Q 310,1690 540,1722 Q 770,1690 926,1585" fill="none" stroke="#74D9BD" strokeWidth={2} opacity={0.25 + pulse * 0.06}/>
			<ellipse cx={LUCA.x} cy={LUCA.groundY + 9} rx={194} ry={29} fill="#020A0C" opacity={0.43}/>
			<g transform="translate(540 1648) scale(0.7 0.4)" opacity={0.5}><Lock size={27}/></g>
		</svg>
	</AbsoluteFill>;
};
