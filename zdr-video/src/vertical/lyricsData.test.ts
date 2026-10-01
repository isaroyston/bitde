import {describe, expect, it} from 'vitest';
import {DISPLAY_LINES, ADLIBS, STAMPS, lyricWords} from './lyricsData';

describe('lyric display data', () => {
	it('keeps ad-libs out of the lyric lines', () => {
		for (const l of DISPLAY_LINES) for (const w of l.words) expect(w.text).not.toMatch(/[()]/);
		for (const l of DISPLAY_LINES) expect(l.text).not.toMatch(/^[ZDR]—/);
	});

	it('turns the Z-D-R lines into six letter stamps', () => {
		expect(STAMPS.map(s => s.letter).join('')).toBe('ZDRZDR');
		for (let i = 1; i < STAMPS.length; i++) expect(STAMPS[i].ms).toBeGreaterThan(STAMPS[i - 1].ms);
	});

	it('does not add interjection stickers beside the lyrics', () => {
		expect(ADLIBS).toEqual([]);
	});

	it('removes every word of a parenthesised aside without leaking its middle words', () => {
		const source = ['Keep', '(a', 'random', 'aside)', 'this'].map((text, i) => ({text, startMs: i * 100, endMs: (i + 1) * 100}));
		expect(lyricWords(source).map(w => w.text)).toEqual(['Keep', 'this']);
		expect(source.map(w => w.text)).toEqual(['Keep', '(a', 'random', 'aside)', 'this']);
	});

	it('keeps every sung word, in order', () => {
		const words = DISPLAY_LINES.flatMap(l => l.words.map(w => w.text.trim()));
		expect(words.slice(0, 4)).toEqual(['Tokens', 'in,', 'tokens', 'out!']);
		expect(words[words.length - 1]).toBe('again?');
		expect(words).toContain('Bye-bye');
		for (let i = 1; i < DISPLAY_LINES.length; i++) expect(DISPLAY_LINES[i].startMs).toBeGreaterThan(DISPLAY_LINES[i - 1].startMs);
	});

	it('excludes the cut brand reprise from current and neighbouring line previews', () => {
		expect(DISPLAY_LINES.some(line => line.startMs === 70100)).toBe(false);
		expect(DISPLAY_LINES.some(line => line.startMs === 63520)).toBe(true);
		expect(DISPLAY_LINES.some(line => line.startMs === 75000)).toBe(true);
	});
});
