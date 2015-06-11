import { createActions } from 'reflux';
import { getMetadata, getArtwork, getTags, readFile } from './api';

let Actions = createActions({
	getMetadata: { asyncResult: true },
	getArtwork: { asyncResult: true },
	getTags: { asyncResult: true },
	readFile: {
		asyncResult: true,
		children: ['abort', 'progress']
	}
});

Actions.getMetadata.listenAndPromise(getMetadata);
Actions.getArtwork.listenAndPromise(getArtwork);
Actions.getTags.listenAndPromise(getTags);
Actions.readFile.listenAndPromise(readFile);

export default Actions;