import React from 'react';
import Interpol from 'interpol-js';
import Actions from '../actions';

let Styles = {
	vinyl: {
		base: {
			width: '400px',
			height: '400px',
			top: '0',
			position: 'absolute',
			background: 'url(assets/img/vinyl_bg.png) center center no-repeat',
			textAlign: 'center',
			cursor: 'hand',
			cursor: 'grab',
			cursor: '-moz-grab',
			cursor: '-webkit-grab'
		},
		left: {
			left: '-25px',
			right: 'auto',
		},
		right: {
			left: 'auto',
			right: '-25px'
		}
	},
	details: {
		top: '425px',
		position: 'relative'
	},
	label: {
		position: 'relative',
		width: '172px',
		height: '172px',
		top: '114px',
		borderRadius: '100px',
		pointerEvents: 'none',
		willChange: 'transform'
	}
};

let Vinyl = React.createClass({
	getInitialState() {
		return Object.assign({
			isPlaying: false,
			isInteracting: false,
			playbackRate: 1,
			startOffset: 0,
			startTime: 0,
			rotation: 0
		}, this.setupTween(), this.setupOscillators(), this.setupSource());
	},
	setupOscillators() {
		let { context } = this.props;
		let processor = context.createScriptProcessor(2048, 1, 1);
		let gain = context.createGain();
		let oscillator = context.createOscillator();
		let scratch = context.createOscillator();

		oscillator.type = scratch.type = 'sine';
		oscillator.frequency.value = scratch.frequency.value = 0;

		oscillator.connect(context.destination);
		scratch.connect(processor);
		processor.connect(gain);
		processor.onaudioprocess = this.onAudioProcess;

		return { oscillator, scratch, processor, gain };
	},
	setupSource() {
		let { context, buffer } = this.props;
		let source = context.createBufferSource();
		let hasPlayed = false;

		source.buffer = buffer;
		source.onended = this.onAudioEnded;
		source.connect(context.destination);

		return { source, hasPlayed };
	},
	setupTween() {
		let duration = parseInt(60000 / 33.333, 10);
		let val = this.state && this.state.rotation || 0;
		let tween = Interpol.tween()
			.duration(duration)
			.from(val)
			.to(val - 360)
			.repeat(Infinity)
			.step(rotation => {
				this.setState({ rotation });
			});

		return { duration, tween };
	},
	globalToLocal({ clientX, clientY }) {

	},
	preventDefault(e) {
		e.preventDefault();
	},
	handlePlay() {
		Actions.togglePlayState(this.props.platter, !this.state.isPlaying);
	},
	handlePlaybackRate(diff) {
		let playbackRate = diff === 0 ? 1 : Math.max(0.25, this.state.playbackRate += (diff * 0.25));
		this.setState({ playbackRate });
	},
	handleMouseDown(e) {
		this.preventDefault(e);
		let isInteracting = !this.state.isInteracting;
		this.setState({ isInteracting });
	},
	handleMouseMove(e) {
		this.preventDefault(e);
		let { isInteracting } = this.state;
		if (!isInteracting) return;
	},
	handleMouseUp(e) {
		this.preventDefault(e);
		let isInteracting = !this.state.isInteracting;
		this.setState({ isInteracting });
	},
	onAudioProcess(e) {

	},
	onAudioEnded() {
		Actions.togglePlayState(this.props.platter, false);
		this.setState(this.setupSource());
		this.state.tween.stop();
	},
	componentWillMount() {
		window.addEventListener('mouseout', this.handleMouseUp);
		document.body.addEventListener('touchmove', this.preventDefault);
	},
	componentWillUnmount() {
		window.removeEventListener('mouseout', this.handleMouseUp);
		document.body.removeEventListener('touchmove', this.preventDefault);
	},
	componentWillReceiveProps(nextProps) {
		let { isPlaying, context } = nextProps;
		let { source, playbackRate, startOffset, startTime, hasPlayed, tween, duration, rotation } = this.state;
		if (isPlaying !== this.state.isPlaying) {
			let newState = { isPlaying };
			if (isPlaying) {
				tween.stop().from(rotation).to(rotation - 360).duration(duration / playbackRate).start();
				source.playbackRate.value = playbackRate;
				source.start(0, startOffset);
				Object.assign(newState, {
					hasPlayed: true,
					startTime: context.currentTime
				});
			} else if (hasPlayed) {
				Object.assign(newState, {
					startOffset: startOffset += context.currentTime - startTime
				});
				source.stop();
			}
			this.setState(newState);
		}
	},
	componentWillUpdate(nextProps, nextState) {
		let { isPlaying, source, tween, duration, rotation } = this.state;
		if (isPlaying && source.playbackRate.value !== nextState.playbackRate) {
			source.playbackRate.value = nextState.playbackRate;
			tween.stop().from(rotation).to(rotation - 360).duration(duration / nextState.playbackRate).start();
		}
		if (rotation !== nextState.rotation) {
			React.findDOMNode(this.refs.label).style.transform = `rotateZ(${nextState.rotation}deg)`;
		}
	},
	render() {
		let vinylMergedStyles = Object.assign({}, Styles.vinyl.base, Styles.vinyl[this.props.platter]);
		return (
			<div>
				<div ref="vinyl"
					style={vinylMergedStyles}
					onMouseDown={this.handleMouseDown}
					onMouseUp={this.handleMouseUp}
					onMouseOut={this.handleMouseUp}
					onMouseMove={this.handleMouseMove}
					onTouchStart={this.handleMouseDown}
					onTouchMove={this.handleMouseMove}
					onTouchEnd={this.handleMouseUp}
					onTouchCancel={this.handleMouseUp}>
					<img ref="label" style={Styles.label} src={this.props.artwork.large}/>
				</div>
				<div ref="details" style={Styles.details}>
					<h1>{this.props.title}</h1>
					<h2>{this.props.artist}</h2>
					<h3>{this.props.album}</h3>
					<p>Approximate BPM: {this.props.bpm * this.state.playbackRate}</p>
					<button onClick={this.handlePlay}>{this.state.isPlaying ? 'Pause' : 'Play'}</button>
					<button onClick={this.handlePlaybackRate.bind(this, 1)}>Increase</button>
					<button onClick={this.handlePlaybackRate.bind(this, -1)}>Decrease</button>
					<button onClick={this.handlePlaybackRate.bind(this, 0)}>Reset</button>
				</div>
			</div>
		);
	}
});



export default Vinyl;
