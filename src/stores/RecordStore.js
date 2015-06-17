import Actions from '../actions';
import { createStore } from 'reflux';

const Record = {
	isPlaying: false,
	playbackRate: 1
};

let RecordStore = createStore({
	listenables: [Actions],
	init() {
		this.records = [];
		this.joinTrailing(
			Actions.getMetadata,
			Actions.getMetadata.completed,
			Actions.readAndDecodeFile.completed,
			Actions.estimateBpm.completed,
			this.onTagsAndReadCompleted
		);
	},
	getInitialState() {
		return this.records;
	},
	onReadFileProgress(e) {
		console.log('progress');
	},
	onTagsAndReadCompleted([ file ], [ meta ], [ buffer ], [ bpm ]) {
		this.records.push(Object.assign(Object.create(Record), meta, { file, buffer, bpm }));
		console.log(this.records);
		this.trigger(this.records);
	}
});

export default RecordStore;