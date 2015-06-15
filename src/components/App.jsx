import React  from 'react';
import { connect } from 'reflux';
import { DropTarget, Decks } from './';
import { RecordStore } from '../stores';

let App = React.createClass({
	mixins: [connect(RecordStore)],
	getInitialState() {
		return {};
	},
	render() {
		return (
			<Decks/>
			<DropTarget/>
		);
	}
});

export default App;