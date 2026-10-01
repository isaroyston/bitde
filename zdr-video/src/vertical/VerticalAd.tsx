import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {FPS, beatAt, barPhase} from '../timing';
import {poseAt} from '../luca/choreography';
import {mouthAt} from '../luca/lipsync';
import {blinkAt, wobbleAt} from '../luca/secondary';
import {Luca} from '../luca/Luca';
import {Stage} from './Stage';
import {Lyrics} from './Lyrics';
import {AdLibBursts, ZdrStamps, stampsActive} from './AdLibs';
import {Effects} from './Effects';
import {Header, EndCard, EndDim, endProgress, END} from './EndCard';
import {END_MS} from './sections';
import {LUCA, SAFE, W, H} from './layout';
import {CHORUS, inRange, vocalAt} from './sections';
import {sourceTimeAt} from './editTimeline';

for (const w of [500, 600, 700, 800]) loadFont({family: 'Inter', url: staticFile(`fonts/inter-latin-${w}-normal.woff2`), weight: String(w)});

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const busy = (ms: number) => stampsActive(ms) ? 1 : 0;

const SafeGuides: React.FC = () => <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
	<rect x={0} y={0} width={W} height={SAFE.top} fill="rgba(255,0,80,0.25)"/>
	<rect x={0} y={SAFE.bottom} width={W} height={H - SAFE.bottom} fill="rgba(255,0,80,0.25)"/>
	<rect x={SAFE.buttonsLeft} y={SAFE.buttonsTop} width={W - SAFE.buttonsLeft} height={SAFE.bottom - SAFE.buttonsTop} fill="rgba(255,0,80,0.25)"/>
</svg>;

export const VerticalAd: React.FC<{safeGuides?: boolean; atMs?: number}> = ({safeGuides = false, atMs}) => {
	const frame = useCurrentFrame(), ms = atMs ?? sourceTimeAt(frame / FPS * 1000);
	const pose = poseAt(ms);
	const mouth = mouthAt(ms, vocalAt(ms));
	const blink = pose.eyes === 'open' || pose.eyes === 'wide' ? blinkAt(ms) : 0;
	const wobble = wobbleAt(ms, poseAt);
	const e = endProgress(ms);
	const place = {x: LUCA.x, y: lerp(LUCA.groundY, END.lucaGround, e), s: lerp(LUCA.scale, END.lucaScale, e)};

	const b = beatAt(ms);
	const punch = inRange(ms, CHORUS) ? 0.028 * Math.exp(-barPhase(b) * 3) + 0.006 * (0.5 + 0.5 * Math.cos(2 * Math.PI * b)) ** 4 : 0;
	const lyricVisible = (1 - Math.max(0, Math.min(1, (ms - END_MS) / 220))) * (1 - [-80, -40, 0, 40, 80].reduce((s, d) => s + busy(ms + d), 0) / 5);

	return <AbsoluteFill style={{background: '#03060A', overflow: 'hidden', width: W, height: H}}>
		{atMs === undefined && <Audio src={staticFile('audio-privacy-edit.wav')}/>}
		<AbsoluteFill style={{transform: `scale(${1 + punch})`, transformOrigin: '540px 1150px'}}>
			<Stage ms={ms}/>
			<Lyrics ms={ms} visible={lyricVisible}/>
			<ZdrStamps ms={ms}/>
			<EndDim ms={ms}/>
			<Effects ms={ms} pose={pose} place={place} layer="back"/>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<g transform={`translate(${place.x} ${place.y}) scale(${place.s})`}>
					<Luca pose={pose} mouth={mouth} blink={blink} wobble={wobble} id={`luca${Math.round(ms)}`}/>
				</g>
			</svg>
			<Effects ms={ms} pose={pose} place={place} layer="front"/>
			<AdLibBursts ms={ms}/>
		</AbsoluteFill>
		<EndCard ms={ms}/>
		<Header ms={ms}/>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}}/>
		{safeGuides && <SafeGuides/>}
	</AbsoluteFill>;
};
