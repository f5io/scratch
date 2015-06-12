import { createActions } from 'reflux';
import {
	decodeAudioData,
	getArtwork,
	getTags,
	readFile
} from './api';

let Actions = createActions({
	decodeAudioData: { asyncResult: true },
	getMetadata: { asyncResult: true },
	getArtwork: { asyncResult: true },
	getTags: { asyncResult: true },
	readAndDecodeFile: { asyncResult: true },
	readFile: {
		asyncResult: true,
		children: ['abort', 'progress']
	}
});

Actions.decodeAudioData.listenAndPromise(decodeAudioData);
Actions.getArtwork.listenAndPromise(getArtwork);
Actions.getTags.listenAndPromise(getTags);
Actions.readFile.listenAndPromise(readFile);

Actions.getMetadata.listen(file => {
	Actions.getTags(file).then(Actions.getArtwork)
		.then(Actions.getMetadata.completed)
		.catch(Actions.getMetadata.failed);
});

Actions.readAndDecodeFile.listen(file => {
	Actions.readFile(file).then(Actions.decodeAudioData)
		.then(Actions.readAndDecodeFile.completed)
		.catch(Actions.readAndDecodeFile.failed);
});

export default Actions;