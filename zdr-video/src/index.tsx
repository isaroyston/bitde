import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {ScrollingLyrics} from './ScrollingLyrics';
import {LucaSheet} from './luca/LucaSheet';
import {VerticalAd} from './vertical/VerticalAd';
import {ContactSheet} from './vertical/ContactSheet';
import {FPS} from './timing';
import {VERTICAL_TOTAL_FRAMES} from './vertical/editTimeline';

registerRoot(() => <>
	<Composition id="ZeroDataRetention" component={ScrollingLyrics} durationInFrames={4854} fps={60} width={1920} height={1080}/>
	<Composition id="ZDRVertical" component={VerticalAd} durationInFrames={VERTICAL_TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{safeGuides: false}}/>
	<Composition id="ContactSheet" component={ContactSheet} durationInFrames={1} fps={60} width={2160} height={1320}
		defaultProps={{times: [0, 2300, 6900, 17700, 30400, 37600, 49600, 53900, 60500, 75900, 79800, 83000], cols: 6, safeGuides: false}}/>
	<Composition id="LucaSheet" component={LucaSheet} durationInFrames={1} fps={60} width={2400} height={2100}/>
</>);
