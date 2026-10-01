import {describe, expect, it} from 'vitest';
import {AUDIO_MS, BEATS, TOTAL_FRAMES, beatAt, msAtBeat, isDownbeat, FPS, END_CARD_MS} from './timing';

describe('timing', () => {
	it('maps beat times to integer beat positions', () => {
		expect(beatAt(BEATS[5])).toBeCloseTo(5, 6);
		expect(beatAt(BEATS[100])).toBeCloseTo(100, 6);
	});

	it('interpolates between beats and inverts', () => {
		for (const ms of [0, 1234, 29420, 51500, 80000, 82500]) expect(msAtBeat(beatAt(ms))).toBeCloseTo(ms, 3);
	});

	it('is monotonic across the whole video, including the end card', () => {
		let prev = -Infinity;
		for (let f = 0; f < TOTAL_FRAMES; f++) {
			const b = beatAt(f / FPS * 1000);
			expect(b).toBeGreaterThan(prev);
			prev = b;
		}
	});

	it('marks one beat in four as a downbeat', () => {
		const downs = BEATS.map((_, i) => isDownbeat(i)).filter(Boolean).length;
		expect(Math.abs(downs - BEATS.length / 4)).toBeLessThanOrEqual(1);
	});

	it('covers the audio plus the end card', () => {
		expect(TOTAL_FRAMES).toBe(Math.ceil((AUDIO_MS + END_CARD_MS) / 1000 * FPS));
	});
});
