import { createActions } from 'reflux';
import { readFile } from './utilities';

let Actions = createActions({
	readFile: {
		asyncResult: true,
		children: ['abort', 'progress']
	},
	getArtwork: {}
});

Actions.readFile.listenAndPromise(readFile);

export default Actions;