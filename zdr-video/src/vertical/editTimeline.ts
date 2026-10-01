import {AUDIO_MS, END_CARD_MS, FPS} from '../timing';

/** Source-song intervals removed from this advert; all boundaries are 60 fps frames. */
export const REMOVED_INTERVALS = [
	{startMs: 59600, endMs: 63200},
	{startMs: 65800, endMs: 74800},
] as const;

const removedMs = REMOVED_INTERVALS.reduce((sum, cut) => sum + cut.endMs - cut.startMs, 0);
export const VERTICAL_AUDIO_MS = AUDIO_MS - removedMs;
export const VERTICAL_TOTAL_FRAMES = Math.ceil((VERTICAL_AUDIO_MS + END_CARD_MS) / 1000 * FPS);

/** Map the edited video clock back to the original lyric, beat, pose and envelope clock. */
export const sourceTimeAt = (outputMs: number): number => {
	let sourceMs = outputMs;
	for (const cut of REMOVED_INTERVALS) {
		if (sourceMs >= cut.startMs) sourceMs += cut.endMs - cut.startMs;
	}
	return sourceMs;
};
