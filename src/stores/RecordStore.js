import Actions from '../actions';
import { createStore } from 'reflux';

import { flatten } from '../utilities';

let RecordStore = createStore({
	listenables: [Actions],
	init() {
		this.records = [];
		this.joinTrailing(
			Actions.getMetadata,
			Actions.getMetadata.completed,
			Actions.readAndDecodeFile.completed,
			this.onTagsAndReadCompleted
		);
	},
	getInitialState() {
		return this.records;
	},
	onReadFileProgress(e) {
		console.log('progress');
	},
	onTagsAndReadCompleted(...args) {
		let [ file, meta, buffer ] = flatten(args);
		console.log(file, meta, buffer);
	}
});

export default RecordStore;