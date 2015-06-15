import Actions from '../actions';
import { createStore } from 'reflux';

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
	onTagsAndReadCompleted([ file ], [ meta ], [ buffer ]) {
		this.records.push(Object.assign(meta, { file, buffer }));
		this.trigger(this.records);
		console.log(file, meta, buffer);
	}
});

export default RecordStore;