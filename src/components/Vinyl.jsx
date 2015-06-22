import React from 'react';
import Interpol from 'interpol-js';
import Actions from '../actions';
import { rad2deg, localToGlobal, uuid } from '../utilities';

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
			uuid: uuid(),
			isPlaying: false,
			isInteracting: false,
			playbackRate: 1,
			startOffset: 0,
			startTime: 0,
			rotation: 0,
			rotationAtInteract: null,
			angleAtInteract: null,
			angleAtMove: 0,
			lastMouseX: -1, lastMouseY: -1, lastMouseTime: null,
			mouseTravel: 0, mouseSpeed: 0,
			centerX: parseInt(Styles.vinyl.base.width, 10) / 2,
			centerY: parseInt(Styles.vinyl.base.height, 10) / 2
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
	handleAudioDown() {
		let isPlaying = false;
		let { oscillator, scratch, uuid } = this.state;

		Interpol.pipeline.add(uuid, this.handleAudioMove);

		oscillator.start();
		scratch.start();
		Actions.togglePlayState(this.props.platter, isPlaying);
	},
	handleAudioMove() {

	},
	handleAudioUp() {
		let isPlaying = true;
		let { oscillator, scratch, uuid } = this.state;

		Interpol.pipeline.remove(uuid);

		oscillator.stop();
		scratch.stop();
		Actions.togglePlayState(this.props.platter, isPlaying);
		this.setState(this.setupOscillators());
	},
	handleMouseDown(e) {
		this.preventDefault(e);
		this.handleAudioDown();
		let isInteracting = true;
		let { centerX, centerY, rotation } = this.state;
		let { clientX, clientY } = e.changedTouches && e.changedTouches[0] || e;
		let { x, y } = localToGlobal(React.findDOMNode(this.refs.vinyl), { centerX, centerY });
		let angleAtInteract = rad2deg(Math.atan2(clientY - y, clientX - x));
		let rotationAtInteract = rotation;
		this.setState({ isInteracting, angleAtInteract, rotationAtInteract });
	},
	handleMouseMove(e) {
		this.preventDefault(e);
		let {
			isInteracting, rotation, rotationAtInteract,
			lastMouseX, lastMouseY, lastMouseTime,
			mouseTravel, mouseSpeed,
			angleAtMove, angleAtInteract,
			centerX, centerY
		} = this.state;
		if (!isInteracting) return;
		let { clientX, clientY } = e.changedTouches && e.changedTouches[0] || e;
		let { x, y } = localToGlobal(React.findDOMNode(this.refs.vinyl), { centerX, centerY });
		if (lastMouseX > -1) {
			mouseTravel += Math.max(Math.abs(clientX - lastMouseX), Math.abs(clientY - lastMouseY));
		}
		lastMouseX = clientX;
		lastMouseY = clientY;
		let timeNow = Date.now();
		if (lastMouseTime && lastMouseTime !== timeNow) {
			mouseSpeed = Math.round(mouseTravel / (timeNow - lastMouseTime) * 1000);
            mouseTravel = 0;
		}
		lastMouseTime = timeNow;
		angleAtMove = rad2deg(Math.atan2(clientY - y, clientX - x)) - angleAtInteract;
		rotation = rotationAtInteract + angleAtMove;
		this.setState({ lastMouseX, lastMouseY, lastMouseTime, angleAtMove, mouseTravel, mouseSpeed, rotation });
	},
	handleMouseUp(e) {
		this.preventDefault(e);
		let { isInteracting } = this.state;
		if (!isInteracting) return;
		this.handleAudioUp();
		isInteracting = false;
		let mouseSpeed = 0;
		this.setState({ isInteracting, mouseSpeed });
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
		let {
			source,
			playbackRate,
			startOffset, startTime,
			hasPlayed, tween,
			duration, rotation
		} = this.state;
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
