import React  from 'react';
import { connect } from 'reflux';
import { DropTarget } from './';
import { RecordStore } from '../stores';

let App = React.createClass({
	mixins: [connect(RecordStore)],
	getInitialState() {
		return {};
	},
	render() {
		return (<DropTarget/>);
	}
});

export default App;