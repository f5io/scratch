export default function decodeAudioData(arrayBuffer) {
	let context = new AudioContext();
	return new Promise((resolve, reject) => {
		context.decodeAudioData(arrayBuffer, (buffer) => {
			context = null;
			resolve(buffer);
		}, reject);
	});
}
