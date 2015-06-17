import { bpmWorker } from '../workers';

function setupSampleRate(sampleRate) {
	return new Promise((resolve, reject) => {
		try {
			bpmWorker.on('setup', resolve);
			if (bpmWorker.worker) {
				bpmWorker.setup(sampleRate);
			} else {
				bpmWorker.compile().then(() => bpmWorker.setup(sampleRate));
			}
		} catch(err) {
			reject(err);
		}
	});
}

export default function estimateBpm(buffer) {
	return new Promise((resolve, reject) => {
		let offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

		let filter = offlineContext.createBiquadFilter();
		filter.type = 'lowpass';

		let source = offlineContext.createBufferSource();
		source.buffer = buffer;

		source.connect(filter)
		filter.connect(offlineContext.destination);

		source.start(0);

		offlineContext.addEventListener('complete', (e) => {
			let { renderedBuffer } = e;
			let channelData = renderedBuffer.getChannelData(0);
			bpmWorker.done(resolve).error(reject);
			setupSampleRate(buffer.sampleRate).then(() => bpmWorker.calculate(channelData), reject);
		});
		offlineContext.startRendering();
	});
}