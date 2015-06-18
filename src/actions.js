import { createActions } from 'reflux';
import {
	decodeAudioData,
	estimateBpm,
	getArtwork,
	getMetadata,
	getTags,
	readFile
} from './api';

let Actions = createActions({
	decodeAudioData: { asyncResult: true },
	estimateBpm: { asyncResult: true },
	getMetadata: { asyncResult: true },
	getArtwork: { asyncResult: true },
	getTags: { asyncResult: true },
	parseFile: { asyncResult: true },
	readAndDecodeFile: { asyncResult: true },
	readFile: {
		asyncResult: true,
		children: ['abort', 'progress']
	},
	setPlatter: {},
	togglePlayState: {}
});

Actions.decodeAudioData.listenAndPromise(decodeAudioData);
Actions.estimateBpm.listenAndPromise(estimateBpm);
Actions.getArtwork.listenAndPromise(getArtwork);
Actions.getTags.listenAndPromise(getTags);
Actions.readFile.listenAndPromise(readFile);

Actions.getMetadata.listenAndPromise(getMetadata);

Actions.readAndDecodeFile.listen(file => {
	Actions.readFile(file).then(Actions.decodeAudioData)
		.then(Actions.readAndDecodeFile.completed)
		.catch(Actions.readAndDecodeFile.failed);
});

Actions.parseFile.listen(file => {
	Actions.readAndDecodeFile(file).then(Actions.estimateBpm)
		.then(Actions.parseFile.completed)
		.catch(Actions.parseFile.failed);
});

export default Actions;