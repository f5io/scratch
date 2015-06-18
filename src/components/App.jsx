import React  from 'react';
import { connect } from 'reflux';
import { DropTarget, Decks } from './';
import { RecordStore } from '../stores';

let App = React.createClass({
	mixins: [connect(RecordStore, 'records')],
	render() {
		return (
			<div>
				<DropTarget>
					<Decks records={this.state.records}/>
				</DropTarget>
			</div>
		);
	}
});

export default App;