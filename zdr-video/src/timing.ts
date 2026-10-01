import beatsData from './data/beats.json';

export const FPS = 60;
export const AUDIO_MS = beatsData.durationMs;
export const END_CARD_MS = 3000;
export const TOTAL_MS = AUDIO_MS + END_CARD_MS;
export const TOTAL_FRAMES = Math.ceil(TOTAL_MS / 1000 * FPS);

const shift = beatsData.override.shiftMs ?? 0;
export const BEATS: number[] = beatsData.beats.map(b => b + shift);
export const DOWNBEAT: number = beatsData.override.downbeatOffset ?? beatsData.downbeatOffset;
const first = BEATS[1] - BEATS[0], last = BEATS[BEATS.length - 1] - BEATS[BEATS.length - 2];

/** Continuous beat position at a time; beat i sits exactly at BEATS[i]. */
export const beatAt = (ms: number): number => {
	if (ms <= BEATS[0]) return (ms - BEATS[0]) / first;
	const n = BEATS.length - 1;
	if (ms >= BEATS[n]) return n + (ms - BEATS[n]) / last;
	let lo = 0, hi = n;
	while (hi - lo > 1) {const mid = (lo + hi) >> 1; if (BEATS[mid] <= ms) lo = mid; else hi = mid;}
	return lo + (ms - BEATS[lo]) / (BEATS[lo + 1] - BEATS[lo]);
};

export const msAtBeat = (b: number): number => {
	const n = BEATS.length - 1;
	if (b <= 0) return BEATS[0] + b * first;
	if (b >= n) return BEATS[n] + (b - n) * last;
	const i = Math.floor(b);
	return BEATS[i] + (b - i) * (BEATS[i + 1] - BEATS[i]);
};

export const isDownbeat = (i: number) => ((i - DOWNBEAT) % 4 + 4) % 4 === 0;
/** Position within the bar, 0..4, with 0 on the downbeat. */
export const barPhase = (b: number) => (((b - DOWNBEAT) % 4) + 4) % 4;
