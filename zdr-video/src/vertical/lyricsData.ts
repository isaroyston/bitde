import lines from '../scroll-lyrics.json';
import {REMOVED_INTERVALS} from './editTimeline';

export type DisplayWord = {text: string; startMs: number; endMs: number};
export type DisplayLine = {text: string; startMs: number; endMs: number; words: DisplayWord[]};

/** Remove the whole parenthesised phrase, including any words between its ends. */
export const lyricWords = (source: DisplayWord[]): DisplayWord[] => {
	const words: DisplayWord[] = [];
	let parenthesisDepth = 0;
	for (const word of source) {
		const opens = (word.text.match(/\(/g) ?? []).length;
		const closes = (word.text.match(/\)/g) ?? []).length;
		const isAside = parenthesisDepth > 0 || opens > 0 || closes > 0;
		parenthesisDepth = Math.max(0, parenthesisDepth + opens - closes);
		if (isAside) continue;
		const previous = words[words.length - 1];
		// "Bye-" + "bye" are timed separately but read as one word.
		if (previous?.text.endsWith('-')) {
			previous.text += word.text.trim();
			previous.endMs = word.endMs;
		} else {
			words.push({text: word.text.trim(), startMs: word.startMs, endMs: word.endMs});
		}
	}
	return words;
};

/** Main lyrics only; the two spelled Z-D-R responses are rendered separately. */
export const DISPLAY_LINES: DisplayLine[] = lines
	.filter(line => !REMOVED_INTERVALS.some(cut => line.startMs >= cut.startMs && line.endMs <= cut.endMs))
	.map(l => {
		const words = lyricWords(l.words);
		return {text: words.map(w => w.text).join(' '), startMs: words[0]?.startMs ?? l.startMs, endMs: words[words.length - 1]?.endMs ?? l.endMs, words};
	})
	.filter(l => l.words.length > 0);

/** No standalone interjection stickers: they read as stray words, not lyrics. */
export const ADLIBS: {text: string; ms: number; endMs: number}[] = [];

/** Individual Z, D and R hits, each with the end of its line so stamps hold until then. */
export const STAMPS = lines.flatMap(l => l.words
	.filter(w => /Z—|D—|R!/.test(w.text))
	.map(w => ({letter: w.text.replace(/[^ZDR]/g, ''), ms: w.startMs, lineEndMs: l.endMs})));
