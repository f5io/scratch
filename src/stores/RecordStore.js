import Actions from '../actions';
import { createStore } from 'reflux';

let RecordStore = createStore({
	listenables: [Actions],
	init() {
		this.records = [];
	},
	getInitialState() {
		return this.records;
	},
	onReadFileAbort(ev) {
		console.log('abort', ev);
	},
	onReadFileFailed(ev) {
		console.log('failed', ev);
	},
	onReadFileCompleted(ev) {
		console.log('completed', ev);
	},
	onReadFileProgress(ev) {
		console.log('progress', ev);
	}
});

export default RecordStore;