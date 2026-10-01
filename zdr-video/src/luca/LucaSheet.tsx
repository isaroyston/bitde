// Development model sheet: rest pose, dance poses and mouth shapes side by side.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Luca} from './Luca';
import {pose, Pose} from './pose';
import {Mouth, VISEMES, Viseme} from './lipsync';

const closed: Mouth = {open: 0, w: 1, h: 0, round: 0, viseme: null};
const cells: {label: string; p: Pose; m?: Mouth}[] = [
	{label: 'rest', p: pose({})},
	{label: 'ta-da', p: pose({armL: {a: 112, b: 24, hand: 'open', rot: -30, front: true}, armR: {a: 112, b: 24, hand: 'open', rot: -30, front: true}, lookY: -1, y: -12})},
	{label: 'heart hands', p: pose({armL: {a: 10, b: -118, hand: 'open', rot: 40, front: true}, armR: {a: 10, b: -118, hand: 'open', rot: 40, front: true}, eyes: 'happy', blush: 0.9})},
	{label: 'point + hip', p: pose({armR: {a: 98, b: -16, hand: 'point'}, armL: {a: 34, b: -118}, lean: -6, headTilt: 9, eyes: 'wink'})},
	{label: 'chorus jump', p: pose({y: -90, armL: {a: 112, b: 22, hand: 'open', rot: -20, front: true}, armR: {a: 112, b: 22, hand: 'open', rot: -20, front: true}, legL: {lift: 20, x: 12}, legR: {lift: 20, x: 12}, eyes: 'happy', expression: 'grin'})},
	{label: 'flex', p: pose({armL: {a: 90, b: 90, front: true}, armR: {a: 90, b: 90, front: true}, drop: 26, eyes: 'wide', browL: -0.6, browR: -0.6})},
	{label: 'robot', p: pose({armL: {a: 90, b: 90, hand: 'open', rot: -90, front: true}, armR: {a: 90, b: -90, hand: 'open', rot: -90, front: true}, headTilt: 10, expression: 'flat'})},
	{label: 'think', p: pose({armR: {a: 80, b: 142, front: true}, armL: {a: 14, b: -104, front: true}, headTilt: 13, lookY: -0.7, lookX: 0.6, browR: 1, expression: 'o'})},
	{label: 'thumbs up', p: pose({armL: {a: 56, b: -112, hand: 'thumb'}, armR: {a: 56, b: -112, hand: 'thumb'}, eyes: 'happy', expression: 'grin'})},
	{label: 'call me', p: pose({armR: {a: 38, b: 112, hand: 'shaka'}, armL: {a: 34, b: -118}, headTilt: 10, eyes: 'wink'})},
	{label: 'talk to hand', p: pose({armR: {a: 96, b: -4, hand: 'open', rot: -95}, armL: {a: 34, b: -118}, headTurn: -1, headTilt: -10, eyes: 'closed'})},
	{label: 'roof', p: pose({armL: {a: 106, b: 62, hand: 'open', rot: -60, front: true}, armR: {a: 106, b: 62, hand: 'open', rot: -60, front: true}, eyes: 'happy', expression: 'grin'})},
	{label: 'confused', p: pose({armL: {a: 50, b: 56, hand: 'open', rot: 70}, armR: {a: 50, b: 56, hand: 'open', rot: 70}, headTilt: 14, eyes: 'blank', browL: 1, browR: -0.4, expression: 'o'})},
];
const mouths: Viseme[] = ['AH', 'EE', 'OH', 'OO', 'SHOUT'];

export const LucaSheet: React.FC = () => <AbsoluteFill style={{background: '#10151a'}}>
	<svg width={2400} height={1600} viewBox="0 0 2400 1600">
		{cells.map((c, i) => {
			const x = 180 + (i % 7) * 340, y = 620 + Math.floor(i / 7) * 640;
			return <g key={i}>
				<g transform={`translate(${x} ${y}) scale(0.5)`}><Luca pose={c.p} mouth={c.m ?? closed} blink={0} wobble={{sym: 0, lat: 0}} id={`c${i}`}/></g>
				<text x={x} y={y + 50} fill="#9aa" fontSize={26} textAnchor="middle" fontFamily="Arial">{c.label}</text>
			</g>;
		})}
	</svg>
	<svg style={{position: 'absolute', left: 0, top: 1600}} width={2400} height={500} viewBox="0 0 2400 500">
		{mouths.map((v, i) => <g key={v} transform={`translate(${260 + i * 460} 300) scale(0.62)`}>
			<g transform="translate(0 525)"><Luca pose={pose({})} mouth={{open: 1, ...VISEMES[v], viseme: v}} blink={0} wobble={{sym: 0, lat: 0}} id={`m${i}`}/></g>
			<text x={0} y={-420} fill="#9aa" fontSize={42} textAnchor="middle" fontFamily="Arial">{v}</text>
		</g>)}
	</svg>
</AbsoluteFill>;
