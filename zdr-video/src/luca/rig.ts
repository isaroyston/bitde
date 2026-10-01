// Joint positions for Luca, in puppet units: ground at y = 0, up is negative,
// about 945 units from sole to antler tip. Screen-left limbs use side -1.
import {Pose, Arm} from './pose';

export type Pt = {x: number; y: number};
export const DIM = {
	pelvisY: -144, hipX: 54, hipDY: 6, thigh: 56, shin: 54, ankleH: 26, footX: 62,
	shoulder: {x: 118, y: -198}, neckY: -230, headDY: -208, upper: 86, fore: 76,
};

const rad = (d: number) => d * Math.PI / 180;
const rot = (p: Pt, deg: number): Pt => {const c = Math.cos(rad(deg)), s = Math.sin(rad(deg)); return {x: p.x * c - p.y * s, y: p.x * s + p.y * c};};
const add = (a: Pt, b: Pt): Pt => ({x: a.x + b.x, y: a.y + b.y});
const scale = (a: Pt, k: number): Pt => ({x: a.x * k, y: a.y * k});

/** Unit direction for a mirrored arm angle: 0 down, 90 outwards, 180 up. */
export const armDir = (deg: number, side: number, lean: number): Pt => rot({x: side * Math.sin(rad(deg)), y: Math.cos(rad(deg))}, lean);

/** Two-bone IK with the knee bending outwards (away from the body's centre line). */
export const ik = (hip: Pt, target: Pt, l1: number, l2: number, side: number): {knee: Pt; ankle: Pt} => {
	const dx = target.x - hip.x, dy = target.y - hip.y;
	const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 0.5, Math.hypot(dx, dy)));
	const base = Math.atan2(dy, dx), alpha = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
	const k1 = {x: hip.x + l1 * Math.cos(base + alpha), y: hip.y + l1 * Math.sin(base + alpha)};
	const k2 = {x: hip.x + l1 * Math.cos(base - alpha), y: hip.y + l1 * Math.sin(base - alpha)};
	const knee = side * (k1.x - hip.x) > side * (k2.x - hip.x) ? k1 : k2;
	const ankle = {x: hip.x + d * Math.cos(base), y: hip.y + d * Math.sin(base)};
	return {knee, ankle};
};

export type ArmRig = {shoulder: Pt; elbow: Pt; wrist: Pt; angle: number; arm: Arm; side: number};
export type Rig = {
	pelvis: Pt; neck: Pt; head: Pt; headAngle: number;
	arms: [ArmRig, ArmRig];
	legs: {hip: Pt; knee: Pt; ankle: Pt; side: number; lift: number}[];
};

/** All joints for a pose, before the whole-body squash/spin transform. */
export const rig = (p: Pose): Rig => {
	const pelvis = {x: p.x, y: p.y + DIM.pelvisY + p.drop};
	const toWorld = (local: Pt) => add(pelvis, rot(local, p.lean));
	const neck = toWorld({x: 0, y: DIM.neckY});
	const headAngle = p.lean + p.headTilt;
	const head = add(neck, rot({x: 0, y: DIM.headDY + p.headY}, headAngle));
	const arms = ([-1, 1] as const).map(side => {
		const arm = side < 0 ? p.armL : p.armR;
		const shoulder = toWorld({x: side * DIM.shoulder.x, y: DIM.shoulder.y});
		const elbow = add(shoulder, scale(armDir(arm.a, side, p.lean), DIM.upper));
		const fd = armDir(arm.a + arm.b, side, p.lean);
		const wrist = add(elbow, scale(fd, DIM.fore));
		return {shoulder, elbow, wrist, angle: Math.atan2(fd.y, fd.x) * 180 / Math.PI, arm, side};
	}) as [ArmRig, ArmRig];
	const legs = ([-1, 1] as const).map(side => {
		const leg = side < 0 ? p.legL : p.legR;
		const hip = {x: pelvis.x + side * DIM.hipX, y: pelvis.y + DIM.hipDY};
		const target = {x: p.x + side * (DIM.footX + leg.x), y: p.y - DIM.ankleH - leg.lift};
		const {knee, ankle} = ik(hip, target, DIM.thigh, DIM.shin, side);
		return {hip, knee, ankle, side, lift: leg.lift};
	});
	return {pelvis, neck, head, headAngle, arms, legs};
};
