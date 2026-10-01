import {describe, expect, it} from 'vitest';
import {AUDIO_MS, END_CARD_MS, FPS} from '../timing';
import {REMOVED_INTERVALS, sourceTimeAt, VERTICAL_AUDIO_MS, VERTICAL_TOTAL_FRAMES} from './editTimeline';

describe('privacy advert edit', () => {
	it('keeps the opening, returning chorus and first brand vocal on their source clock', () => {
		expect(sourceTimeAt(0)).toBe(0);
		expect(sourceTimeAt(56900)).toBe(56900);
		expect(sourceTimeAt(59599)).toBe(59599);
		expect(sourceTimeAt(59600)).toBe(63200);
		expect(sourceTimeAt(59920)).toBe(63520);
	});

	it('skips the repeated late interlude and keeps the final spoken words', () => {
		expect(sourceTimeAt(62199)).toBe(65799);
		expect(sourceTimeAt(62200)).toBe(74800);
		expect(sourceTimeAt(62400)).toBe(75000);
		expect(sourceTimeAt(67640)).toBe(80240);
		expect(sourceTimeAt(VERTICAL_AUDIO_MS)).toBe(AUDIO_MS);
	});

	it('aligns cuts to video frames and preserves the closing brand-card duration', () => {
		for (const cut of REMOVED_INTERVALS) {
			expect(Number.isInteger(cut.startMs / 1000 * FPS)).toBe(true);
			expect(Number.isInteger(cut.endMs / 1000 * FPS)).toBe(true);
		}
		expect(VERTICAL_AUDIO_MS).toBe(68280);
		expect(VERTICAL_TOTAL_FRAMES).toBe(Math.ceil((VERTICAL_AUDIO_MS + END_CARD_MS) / 1000 * FPS));
	});
});
