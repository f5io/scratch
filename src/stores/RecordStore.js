import Actions from '../actions';
import { createStore } from 'reflux';
import { toArray } from '../utilities';

const Record = {
	isPlaying: false
};

let RecordStore = createStore({
	listenables: [Actions],
	init() {
		this.records = {};
		this.joinTrailing(
			Actions.setPlatter,
			Actions.getMetadata,
			Actions.getMetadata.completed,
			Actions.readAndDecodeFile.completed,
			Actions.estimateBpm.completed,
			this.onTagsAndReadCompleted
		);
	},
	getInitialState() {
		return toArray(this.records);
	},
	onReadFileProgress(e) {
		console.log('progress');
	},
	onTogglePlayState(platter, playing) {
		this.records[platter].isPlaying = playing;
		this.trigger(toArray(this.records));
	},
	onTagsAndReadCompleted([ platter ], [ file ], [ meta ], [ buffer ], [ bpm ]) {
		this.records[platter] = Object.assign({}, Record, meta, { platter, file, buffer, bpm });
		this.trigger(toArray(this.records));
	}
});

export default RecordStore;