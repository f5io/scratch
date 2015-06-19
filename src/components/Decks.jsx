import React from 'react';
import Reflux from 'reflux';
import { Vinyl } from './';
import { RecordStore } from '../stores';

let Styles = {
	position: 'relative',
	width: '100%',
	top: '-12px'
};

let Decks = React.createClass({
	propTypes: {
		records: React.PropTypes.array.isRequired
	},
	getInitialState() {
		return {
			context: new AudioContext()
		};
	},
	render() {
		var vinyls = this.props.records.map(record => (<Vinyl key={record.platter} context={this.state.context} {...record}/>), this);
		return (
			<div className="decks" style={Styles}>
				{vinyls}
			</div>
		);
	}
});

export default Decks;
