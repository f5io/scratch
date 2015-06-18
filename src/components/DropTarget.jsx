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
		let file = e.dataTransfer.files[0];
		let platter = e.clientX > window.innerWidth / 2 ? 'RIGHT' : 'LEFT';
		Actions.setPlatter(platter);
		Actions.getMetadata(file);
		Actions.parseFile(file);
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
		return (<div style={styles} onDrop={this.handleDrop}>{this.props.children}</div>);
	}
});

export default DropTarget;

