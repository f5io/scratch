import Actions from '../actions';
import { createStore } from 'reflux';

import { flatten } from '../utilities';

let RecordStore = createStore({
	// listenables: [Actions],
	init() {
		this.records = [];
		this.joinTrailing(
			Actions.getMetadata,
			Actions.getMetadata.completed,
			Actions.readFile.completed,
			this.onTagsAndReadCompleted
		);
	},
	getInitialState() {
		return this.records;
	},
	onTagsAndReadCompleted(...args) {
		let [ file, meta, read ] = flatten(args);
		console.log(file, meta, read);
	}
});

export default RecordStore;