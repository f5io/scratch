import React from 'react';
import Actions from '../actions';

let styles = {
	background: 'red',
	width: '100%',
	height: '100%',
	flex: 1,
	position: 'fixed'
};

let DropTarget = React.createClass({
	prevent(e) {
		e.preventDefault();
		e.stopPropagation();
	},
	handleDrop(e) {
		var file = e.dataTransfer.files[0];
		Actions.getMetadata(file);
		Actions.readAndDecodeFile(file);
	},
	componentDidMount() {
		window.addEventListener('drop', this.prevent);
		window.addEventListener('dragover', this.prevent);
	},
	compnentWillUnmount() {
		window.addEventListener('drop', this.prevent);
		window.addEventListener('dragover', this.prevent);
	},
	render() {
		let str = 'Hello Bubba!';
		return (<div style={styles} onDrop={this.handleDrop}>{str}</div>);
	}
});

export default DropTarget;

