import React from 'react';
import { connect } from 'reflux';
import { Vinyl } from './';
import { RecordStore } from '../stores';

let Decks = React.createClass({
	mixins: [connect(RecordStore), 'records'],
	getInitialState() {
		return [];
	},
	render() {
		var vinyls = this.state.records.map(function(record) {
			return (<Vinyl record={record}/>);
		});
		return (
			<div className="decks">
				{vinyls}
			</div>
		);
	}
});

export default Decks;