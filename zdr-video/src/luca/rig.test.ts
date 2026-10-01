import {describe, expect, it} from 'vitest';
import {ik, rig, DIM, armDir} from './rig';
import {REST, pose} from './pose';

const dist = (a: {x: number; y: number}, b: {x: number; y: number}) => Math.hypot(a.x - b.x, a.y - b.y);

describe('rig', () => {
	it('keeps bone lengths in the leg IK and bends knees outwards', () => {
		const hip = {x: 54, y: -156};
		const {knee, ankle} = ik(hip, {x: 62, y: -26}, DIM.thigh, DIM.shin, 1);
		expect(dist(hip, knee)).toBeCloseTo(DIM.thigh, 3);
		expect(dist(knee, ankle)).toBeCloseTo(DIM.shin, 3);
		expect(knee.x).toBeGreaterThan(hip.x);
	});

	it('clamps unreachable feet to a straight leg', () => {
		const hip = {x: 0, y: 0};
		const {ankle} = ik(hip, {x: 0, y: 500}, DIM.thigh, DIM.shin, 1);
		expect(dist(hip, ankle)).toBeLessThanOrEqual(DIM.thigh + DIM.shin);
	});

	it('mirrors arm directions per side', () => {
		const l = armDir(90, -1, 0), r = armDir(90, 1, 0);
		expect(l.x).toBeCloseTo(-1); expect(r.x).toBeCloseTo(1);
		expect(armDir(180, 1, 0).y).toBeCloseTo(-1);
	});

	it('places the head above the pelvis at rest and moves everything with a jump', () => {
		const a = rig(REST), b = rig(pose({y: -100}));
		expect(a.head.y).toBeLessThan(a.pelvis.y);
		expect(b.head.y).toBeCloseTo(a.head.y - 100);
		expect(b.legs[0].ankle.y).toBeCloseTo(a.legs[0].ankle.y - 100);
	});

	it('keeps hands reachable for the chin gesture', () => {
		const r = rig(pose({armR: {a: 80, b: 142}}));
		expect(r.arms[1].wrist.y).toBeLessThan(r.arms[1].shoulder.y - 30);
		expect(r.arms[1].wrist.x).toBeLessThan(r.arms[1].shoulder.x + 60);
	});
});
