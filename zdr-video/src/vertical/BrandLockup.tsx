import React from 'react';
import {CanvasImage, staticFile} from 'remotion';

// Complete supplied artwork, including its original transparent padding.
export const LOCKUP_ASPECT = 300 / 1200;

export const BrandLockup: React.FC<{width: number; id?: string}> = ({width}) => (
	<CanvasImage src={staticFile('bitdeer-ai-logo.png')} style={{display: 'block', width, height: width * LOCKUP_ASPECT}}/>
);
