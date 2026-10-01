import React from 'react';
import {STAMPS} from './lyricsData';
import {LYRIC, FONT} from './layout';

const easeOut = (x: number) => 1 - (1 - Math.max(0, Math.min(1, x))) ** 3;

/** Kept as a compatibility component; interjection stickers are no longer shown. */
export const AdLibBursts: React.FC<{ms: number}> = () => null;

const LETTER_X = [300, 540, 780];

/** Whether the Z-D-R stamps own the text zone. */
export const stampsActive = (ms: number) => STAMPS.some(s => ms >= s.ms - 60 && ms < s.lineEndMs + 260);

/** The sung Z / D / R responses enter cleanly on their original word timings. */
export const ZdrStamps: React.FC<{ms: number}> = ({ms}) => <>
	{STAMPS.map((s, i) => {
		const since = ms - s.ms, out = ms - (s.lineEndMs + 60);
		if (since < 0 || out > 200) return null;
		const k = i % 3, enter = easeOut(since / 180), leave = out > 0 ? Math.max(0, 1 - out / 200) : 1;
		return <svg key={i} width={300} height={300} viewBox="-150 -150 300 300" style={{position: 'absolute', left: LETTER_X[k] - 150, top: LYRIC.centerY - 150, overflow: 'visible'}}>
			<g transform={`translate(0 ${18 * (1 - enter)})`} opacity={enter * leave}>
				<text x={0} y={88} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={250} fill="#66E6BF">{s.letter}</text>
			</g>
		</svg>;
	})}
</>;
