// Luca's move library. Every move is a pure function of time; beat-based fields
// come from the tracked beat grid so the dancing stays on the (drifting) tempo.
import {pose, Pose, PartialPose, Arm, REST} from './pose';

export type Ctx = {
	ms: number;
	/** Global beat position. */
	b: number;
	/** Beats since the segment started. */
	lb: number;
	/** Segment length in beats. */
	dur: number;
	/** Milliseconds since the segment started. */
	lms: number;
	p: Record<string, number | string | number[]>;
};
export type Move = (c: Ctx) => Pose;

const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {const t = clamp01(x); return t * t * (3 - 2 * t);};
const outBack = (x: number) => {const t = clamp01(x), c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;};
/** 1 exactly on each beat, falling to 0 half-way between. */
const onBeat = (b: number, sharp = 2) => (0.5 + 0.5 * Math.cos(TAU * b)) ** sharp;
/** Smooth square wave: -1 at even beats, +1 at odd beats, fast transition between. */
const sq = (b: number, k = 4) => Math.tanh(k * Math.sin(Math.PI * (b - 0.5))) / Math.tanh(k);
/** Snap between held values: returns integer step and an eased 0..1 within a fast transition. */
const snapStep = (b: number, len = 0.14) => {const i = Math.floor(b), f = b - i; return {i, t: smooth(f / len)};};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Bounce and head-bob layered under most gestures. */
const groove = (b: number, amount = 1): PartialPose => {
	const k = onBeat(b);
	return {
		drop: 6 + 16 * k * amount,
		squash: 1 + 0.035 * k * amount,
		headY: 5 * onBeat(b - 0.15) * amount,
		headTilt: -4 * Math.sin(Math.PI * b) * amount,
		x: 10 * Math.sin(Math.PI * b) * amount,
		lean: 3 * Math.sin(Math.PI * b) * amount,
	};
};
const on = (base: PartialPose, over: PartialPose): Pose => pose(over, pose(base));

const HIP: Partial<Arm> = {a: 34, b: -118, hand: 'fist'};
const armMix = (a: Partial<Arm>, b: Partial<Arm>, t: number): Partial<Arm> => ({
	a: lerp(a.a ?? 0, b.a ?? 0, t), b: lerp(a.b ?? 0, b.b ?? 0, t), rot: lerp(a.rot ?? 0, b.rot ?? 0, t),
	hand: t < 0.5 ? a.hand : b.hand, front: t < 0.5 ? a.front : b.front,
});

export const MOVES: Record<string, Move> = {
	idle: ({ms}) => pose({
		drop: 6 + 4 * Math.sin(TAU * ms / 2600), headTilt: 2 * Math.sin(TAU * ms / 3100),
		armL: {a: 12 + 3 * Math.sin(TAU * ms / 2600)}, armR: {a: 12 + 3 * Math.sin(TAU * ms / 2600 + 1)},
	}),

	groove: ({b}) => {
		const s = Math.sin(Math.PI * b), k = onBeat(b);
		return on(groove(b), {
			armL: {a: 24 + 16 * s, b: -50 - 12 * k}, armR: {a: 24 - 16 * s, b: -50 - 12 * k},
			legL: {lift: 9 * Math.max(0, s)}, legR: {lift: 9 * Math.max(0, -s)},
			eyes: Math.floor(b / 8) % 2 ? 'happy' : 'open',
		});
	},

	twoStep: ({b}) => {
		const c = Math.cos(Math.PI * (b - 0.5));
		return on(groove(b, 0.6), {
			x: 36 * sq(b), lean: 5 * sq(b),
			legR: {lift: 22 * Math.max(0, c) ** 2, x: 6}, legL: {lift: 22 * Math.max(0, -c) ** 2, x: 6},
			armL: {a: 36 + 26 * c, b: -88}, armR: {a: 36 - 26 * c, b: -88},
			headTilt: -6 * sq(b),
		});
	},

	/** Opening: Luca drops in, "Tokens in" pulls in, "tokens out" pushes out, "Hey!" jumps. */
	intro: ({ms, b}) => {
		const land = 340;
		if (ms < land) {
			const t = ms / land;
			return pose({y: -110 * (1 - t * t), squash: 0.9, drop: 0, armL: {a: 116, b: 22, hand: 'open', front: true}, armR: {a: 116, b: 22, hand: 'open', front: true}, legL: {lift: 26}, legR: {lift: 26}, eyes: 'wide'});
		}
		const since = ms - land;
		const impact = Math.exp(-since / 90) * Math.cos(since / 40);
		const inT = smooth((ms - 620) / 160), outT = smooth((ms - 1460) / 160), hey = ms - 2000;
		const pull: Partial<Arm> = {a: 26, b: -104, hand: 'open', rot: -20};
		const push: Partial<Arm> = {a: 96, b: -6, hand: 'open', rot: -80};
		const fall: Partial<Arm> = {a: 116, b: 22, hand: 'open', front: true};
		let armL = armMix(armMix(fall, pull, smooth(since / 220)), push, outT);
		let armR = armL;
		let y = 0, squash = 1 + 0.22 * Math.max(0, impact), drop = 6 + 30 * Math.max(0, impact);
		if (hey > 0) {
			const h = clamp01(hey / 380);
			y = -120 * Math.sin(Math.PI * h);
			armR = armMix(armR, {a: 116, b: 40, hand: 'fist', front: true}, smooth(hey / 90));
			armL = armMix(armL, {a: 40, b: -20, hand: 'fist'}, smooth(hey / 90));
			if (h >= 1) {const s = hey - 380; squash = 1 + 0.16 * Math.exp(-s / 90); drop = 6 + 22 * Math.exp(-s / 110);}
		}
		return on(groove(b, 0.25 * inT), {
			y, squash, drop, armL, armR,
			legL: {lift: y < -20 ? 18 : 0}, legR: {lift: y < -20 ? 18 : 0},
			eyes: ms < 520 ? 'wide' : hey > 0 ? 'happy' : 'open', lean: -5 * inT * (1 - outT) + 4 * outT,
		});
	},

	heartHands: ({b, lms}) => {
		const e = smooth(lms / 260);
		const hand: Partial<Arm> = {a: 10, b: -118, hand: 'open', rot: 40, front: true};
		return on(groove(b, 0.55), {
			armL: armMix(REST.armL, hand, e), armR: armMix(REST.armR, hand, e),
			eyes: 'happy', blush: 0.85, headTilt: 7 * Math.sin(Math.PI * b), lean: 4 * Math.sin(Math.PI * b),
		});
	},

	point: ({b, lms, p}) => {
		const e = outBack(lms / 260);
		const armR = armMix(REST.armR, {a: 98, b: -16, hand: 'point'}, e);
		const armL = armMix(REST.armL, HIP, smooth(lms / 260));
		const wink = typeof p.winkMs === 'number' && lms > p.winkMs;
		return on(groove(b, 0.7), {armR, armL, lean: -6 * e, headTilt: 9 * e, eyes: wink ? 'wink' : 'open', lookX: 0.4});
	},

	/** "Uh!" hip hit. */
	hipHit: ({lms}) => {
		const k = Math.exp(-lms / 160);
		return pose({x: -22 * (1 - k), lean: 11 * (1 - Math.exp(-lms / 60)), squash: 1 + 0.1 * k, drop: 22, headTilt: -12,
			armL: HIP, armR: {a: 60, b: -120, hand: 'fist'}, eyes: 'happy', legR: {lift: 16}});
	},

	/** Ta-da toward the logo. side = 'right' raises one arm only. */
	presenter: ({b, lms, p}) => {
		const e = outBack(lms / 300), jazz = 16 * Math.sin(TAU * 2 * b);
		const up: Partial<Arm> = {a: 112, b: 24, hand: 'open', rot: jazz - 30, front: true};
		const armR = armMix(REST.armR, p.side === 'right' ? {a: 118, b: 28, hand: 'open', rot: jazz - 30, front: true} : up, e);
		const armL = p.side === 'right' ? armMix(REST.armL, HIP, smooth(lms / 260)) : armMix(REST.armL, up, e);
		return on(groove(b, 0.5), {y: -12 * e, armL, armR, lookY: -1, lookX: p.side === 'right' ? 0.5 : 0, headTilt: 6 * Math.sin(Math.PI * b), eyes: 'open', browL: 0.6, browR: 0.6});
	},

	callMe: ({b, lms}) => {
		const e = outBack(lms / 240);
		return on(groove(b, 0.6), {
			armR: armMix(REST.armR, {a: 38, b: 112, hand: 'shaka', rot: 12 * Math.sin(TAU * 2 * b)}, e),
			armL: armMix(REST.armL, HIP, smooth(lms / 240)),
			headTilt: 10 * e, eyes: lms > 260 ? 'wink' : 'open', lookX: 0.5, blush: 0.6,
		});
	},

	fistPump: ({b, lb, dur, lms}) => {
		const second = lb > dur / 2, k = onBeat(b, 3);
		const up: Partial<Arm> = {a: 110 + 10 * k, b: 38, hand: 'fist', front: true};
		const down: Partial<Arm> = {a: 30, b: -70, hand: 'fist'};
		const e = smooth(lms / 160);
		return on(groove(b, 0.8), {
			armR: second ? armMix(up, down, smooth((lb - dur / 2) / 0.4)) : armMix(REST.armR, up, e),
			armL: second ? armMix(down, up, smooth((lb - dur / 2) / 0.4)) : armMix(REST.armL, down, e),
			y: -26 * k, eyes: 'happy', lean: second ? 5 : -5,
		});
	},

	/** Wax-on circles: "Clear the cache", "wiped so clean". both = two hands. */
	wipe: ({b, lb, lms, p}) => {
		const e = smooth(lms / 260), ph = TAU * lb / 2;
		const circle = (dir: number): Partial<Arm> => ({a: 72 + 30 * Math.sin(ph * dir), b: -62 + 34 * Math.cos(ph * dir), hand: 'open', rot: -60});
		return on(groove(b, 0.5), {
			armR: armMix(REST.armR, circle(1), e),
			armL: p.both ? armMix(REST.armL, circle(-1), e) : armMix(REST.armL, HIP, e),
			lean: 6 * Math.sin(ph), headTilt: -6 * Math.sin(ph), eyes: 'closed', lookX: 0.3,
		});
	},

	/** Dismissive wave with the head turned away. */
	waveOff: ({b, lms}) => {
		const e = outBack(lms / 260);
		return on(groove(b, 0.45), {
			armR: armMix(REST.armR, {a: 108 + 10 * Math.sin(TAU * b), b: 26, hand: 'open', rot: -40 + 20 * Math.sin(TAU * b), front: true}, e),
			armL: armMix(REST.armL, HIP, smooth(lms / 260)),
			headTurn: -0.85 * smooth(lms / 300), headTilt: -8, eyes: 'closed', lean: -4, browL: 0.5, browR: 0.5,
		});
	},

	/** Z / D / R hit poses snapping on each stamp time (p.hits, ms from segment start). */
	zdrHits: ({lms, p}) => {
		const hits = p.hits as number[];
		let k = -1;
		for (let i = 0; i < hits.length; i++) if (lms >= hits[i]) k = i;
		const since = k >= 0 ? lms - hits[k] : 0, bump = Math.exp(-since / 80);
		const poses: PartialPose[] = [
			{armR: {a: 126, b: 0, hand: 'open', front: true}, armL: {a: 40, b: 0, hand: 'open'}, lean: 8, headTilt: 10},
			{armR: HIP, armL: HIP, lean: -6, headTilt: -8, drop: 20},
			{armR: {a: 118, b: 40, hand: 'point', front: true}, armL: HIP, legR: {lift: 34}, lean: 4, headTilt: 6},
		];
		return pose({...(poses[Math.max(0, k)] ?? {}), squash: 1 + 0.12 * bump, eyes: 'wide', y: -10 * bump});
	},

	/** "I will forget everything between us": palms-up shrug and a no-no head shake. */
	shrugNo: ({b, lms}) => {
		const e = outBack(lms / 280), shake = Math.sin(TAU * b);
		const shrug: Partial<Arm> = {a: 52, b: 58, hand: 'open', rot: 70};
		return on(groove(b, 0.4), {armL: armMix(REST.armL, shrug, e), armR: armMix(REST.armR, shrug, e),
			headTilt: 9 * shake, headTurn: 0.3 * shake, eyes: 'closed', drop: 14, browL: 0.7, browR: 0.7});
	},

	/** "API key was never seen": talk to the hand, head turned away. */
	talkHand: ({b, lms}) => {
		const e = outBack(lms / 260);
		return on(groove(b, 0.45), {
			armR: armMix(REST.armR, {a: 96, b: -4, hand: 'open', rot: -95}, e),
			armL: armMix(REST.armL, HIP, smooth(lms / 260)),
			headTurn: -1 * smooth(lms / 300), headTilt: -10, eyes: 'closed', lean: -7, browL: 0.8, browR: 0.8,
		});
	},

	/** Crouching anticipation before the chorus. */
	build: ({lms, dur, lb}) => {
		const u = clamp01(lb / dur), shake = Math.sin(lms * 0.35) * 1.5 * u;
		return pose({drop: 10 + 44 * smooth(u), squash: 1 + 0.08 * u, x: shake, headY: 10 * u,
			armL: {a: 24 + 30 * u, b: -60 - 50 * u, hand: 'fist'}, armR: {a: 24 + 30 * u, b: -60 - 50 * u, hand: 'fist'},
			eyes: 'wide', browL: -0.8, browR: -0.8, expression: 'grin'});
	},

	/** Signature chorus move: jump with V arms on each "zero", flex, then raise the roof. */
	chorus: ({b, lb}) => {
		const V: Partial<Arm> = {a: 112, b: 22, hand: 'open', rot: -20, front: true};
		const flex: Partial<Arm> = {a: 90, b: 90, hand: 'fist', front: true};
		const roof: Partial<Arm> = {a: 102 + 10 * onBeat(b, 3), b: 62, hand: 'open', rot: -60, front: true};
		if (lb < 4) {
			const beat = Math.floor(lb), f = lb - beat, jump = beat % 2 === 0;
			if (jump) {
				const y = -96 * Math.sin(Math.PI * clamp01(f / 0.8));
				const land = f > 0.8 ? Math.exp(-(f - 0.8) * 10) : 0;
				return pose({y, armL: V, armR: V, legL: {lift: y < -30 ? 20 : 0, x: 12}, legR: {lift: y < -30 ? 20 : 0, x: 12},
					squash: y < -10 ? 0.94 : 1 + 0.16 * land, drop: 6 + 26 * land, eyes: 'happy', expression: 'grin'});
			}
			const e = smooth(f / 0.18);
			return pose({armL: armMix(V, flex, e), armR: armMix(V, flex, e), drop: 26 - 16 * f, squash: 1.06 - 0.06 * f,
				headTilt: 8 * Math.sin(Math.PI * f), eyes: 'wide', browL: -0.6, browR: -0.6});
		}
		const e = smooth((lb - 4) / 0.3);
		return on(groove(b, 0.9), {x: 30 * sq(b), armL: armMix(flex, roof, e), armR: armMix(flex, roof, e), eyes: 'happy', expression: 'grin',
			legL: {lift: 16 * Math.max(0, -Math.cos(Math.PI * (b - 0.5)))}, legR: {lift: 16 * Math.max(0, Math.cos(Math.PI * (b - 0.5)))}});
	},

	/** Arms crossed in an X: "We are through!" */
	crossX: ({b, lms}) => {
		const e = outBack(lms / 220), X: Partial<Arm> = {a: 36, b: -128, hand: 'fist', front: true};
		return on(groove(b, 0.4), {armL: armMix(REST.armL, X, e), armR: armMix(REST.armR, X, e),
			headTilt: 8 * Math.sin(TAU * b), eyes: 'closed', lean: -3, browL: 0.4, browR: 0.4});
	},

	/** Pop-lock robot: held angular poses snapping on every beat. */
	robot: ({b}) => {
		const {i, t} = snapStep(b);
		const P: PartialPose[] = [
			{armL: {a: 90, b: 90}, armR: {a: 90, b: -90}, headTilt: 10, x: -10},
			{armL: {a: 90, b: -90}, armR: {a: 90, b: 90}, headTilt: -10, x: 10},
			{armL: {a: 90, b: 90}, armR: {a: 90, b: 90}, headTilt: 0, x: 0},
			{armL: {a: 4, b: 90}, armR: {a: 4, b: 90}, headTilt: 6, x: 0},
		];
		const a = pose({...P[(i + 3) % 4], drop: 8}), c = pose({...P[i % 4], drop: 8});
		const out = pose({}, a);
		const mixArm = (x: Arm, y: Arm): Arm => ({...y, a: lerp(x.a, y.a, t), b: lerp(x.b, y.b, t), hand: 'open', rot: -90, front: true});
		return pose({armL: mixArm(a.armL, c.armL), armR: mixArm(a.armR, c.armR), headTilt: lerp(a.headTilt, c.headTilt, t), x: lerp(a.x, c.x, t),
			drop: 8 + 6 * (1 - t), eyes: 'open', expression: 'flat', lookX: 0}, out);
	},

	/** "I'm cutting the cord": scissor fingers snipping. */
	scissor: ({b, lms}) => {
		const e = outBack(lms / 240);
		return on(groove(b, 0.5), {
			armR: armMix(REST.armR, {a: 104, b: -24, hand: 'peace', rot: 0}, e),
			armL: armMix(REST.armL, HIP, smooth(lms / 240)),
			snip: 0.5 + 0.5 * Math.cos(TAU * 2 * b), eyes: 'wink', headTilt: 8, lookX: 0.6,
		});
	},

	/** Umpire "safe" sweep: arms cross at the chest, then sweep out flat on the beat. */
	safe: ({b, lb}) => {
		const phase = lb % 2, crossT = smooth(phase / 0.25), outT = smooth((phase - 1) / 0.2);
		const cross: Partial<Arm> = {a: 30, b: -128, hand: 'open', rot: -90, front: true};
		const flat: Partial<Arm> = {a: 92, b: 0, hand: 'open', rot: -90};
		const arm = phase < 1 ? armMix(flat, cross, crossT) : armMix(cross, flat, outT);
		return on(groove(b, 0.5), {armL: arm, armR: arm, drop: 10 + 14 * outT * (phase >= 1 ? 1 : 0), eyes: phase >= 1 ? 'closed' : 'open', headTilt: phase >= 1 ? -6 : 4});
	},

	/** "Who are you?": hand at the chin, head tilted. */
	think: ({b, lms}) => {
		const e = outBack(lms / 280);
		return on(groove(b, 0.3), {
			armR: armMix(REST.armR, {a: 80, b: 142, hand: 'fist', front: true}, e),
			armL: armMix(REST.armL, {a: 14, b: -104, hand: 'fist', front: true}, e),
			headTilt: 13 * e, lookY: -0.7, lookX: 0.6, browR: 1, browL: -0.2, eyes: 'open', expression: 'o',
		});
	},

	byeBye: ({b, lb, lms}) => {
		const e = outBack(lms / 280), w = Math.sin(TAU * lb);
		const wave = (sgn: number): Partial<Arm> => ({a: 112 + 12 * w * sgn, b: 22 + 14 * w * sgn, hand: 'open', rot: -20 + 24 * w * sgn, front: true});
		return on(groove(b, 0.6), {armL: armMix(REST.armL, wave(1), e), armR: armMix(REST.armR, wave(-1), e), eyes: 'happy', expression: 'grin', blush: 0.6});
	},

	/** Instrumental freestyle: spin, floss, running man, final hit. v = 2 reorders. */
	freestyle: ({b, lb, p}) => {
		const order = p.v === 2 ? ['floss', 'spin', 'run', 'floss', 'hit'] : ['spin', 'floss', 'run', 'hit'];
		const lens: Record<string, number> = {spin: 2, floss: 4, run: 4, hit: 99};
		let t = lb, part = order[0];
		for (const name of order) {if (t < lens[name]) {part = name; break;} t -= lens[name];}
		if (part === 'spin') {
			const u = smooth(t / 1.2);
			return pose({spin: u, y: -40 * Math.sin(Math.PI * clamp01(t / 1.2)), armL: {a: 84, b: 0, hand: 'open'}, armR: {a: 84, b: 0, hand: 'open'}, eyes: 'happy', expression: 'grin'});
		}
		if (part === 'floss') {
			const s = sq(b, 3);
			return on(groove(b, 0.6), {x: -18 * s, lean: 0,
				armL: {a: 32 * s, b: 0, hand: 'fist', front: s > 0}, armR: {a: -32 * s, b: 0, hand: 'fist', front: s < 0}, eyes: 'happy', expression: 'grin'});
		}
		if (part === 'run') {
			const s = Math.sin(Math.PI * b);
			return on(groove(b, 0.8), {legL: {lift: 42 * Math.max(0, s), x: -10 * s}, legR: {lift: 42 * Math.max(0, -s), x: 10 * s},
				armL: {a: 40 + 32 * s, b: -100, hand: 'fist'}, armR: {a: 40 - 32 * s, b: -100, hand: 'fist'}, eyes: 'open', expression: 'grin'});
		}
		const k = Math.exp(-(t % 4) * 3);
		return on(groove(b, 0.7), {armR: {a: 118, b: 36, hand: 'point', front: true}, armL: HIP, squash: 1 + 0.1 * k, legR: {lift: 20 * k}, eyes: 'happy', expression: 'grin'});
	},

	thumbsUp: ({b, lms}) => {
		const e = outBack(lms / 260), T: Partial<Arm> = {a: 56, b: -112, hand: 'thumb'};
		return on(groove(b, 0.6), {armL: armMix(REST.armL, T, e), armR: armMix(REST.armR, T, e), eyes: 'happy', expression: 'grin', blush: 0.6, y: -8 * onBeat(b)});
	},

	lookAround: ({ms, lms}) => {
		const look = Math.sin(TAU * lms / 1700);
		return pose({drop: 6 + 3 * Math.sin(TAU * ms / 2600), lookX: look, headTurn: 0.35 * look, headTilt: 4 * look, eyes: 'open', expression: 'flat',
			armL: {a: 10, b: -6}, armR: {a: 10, b: -6}});
	},

	confused: ({ms, lms}) => {
		const e = outBack(lms / 320), shrug: Partial<Arm> = {a: 50, b: 56, hand: 'open', rot: 70};
		return pose({armL: armMix(REST.armL, shrug, e), armR: armMix(REST.armR, shrug, e), headTilt: 14 * e + 2 * Math.sin(TAU * ms / 1400),
			eyes: 'blank', browL: 1, browR: -0.4, drop: 14, squash: 1.02, expression: 'o'});
	},

	endWave: ({b, lms}) => {
		const waving = lms < 1700, w = Math.sin(TAU * lms / 420);
		const wave: Partial<Arm> = {a: 112 + 12 * w, b: 24 + 14 * w, hand: 'open', rot: -20 + 20 * w, front: true};
		return on(groove(b, 0.35), {armR: waving ? armMix(REST.armR, wave, outBack(lms / 260)) : armMix(wave, REST.armR, smooth((lms - 1700) / 300)),
			eyes: 'happy', expression: 'grin', blush: 0.7});
	},
};
