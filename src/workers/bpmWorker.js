import Bonobo from 'bonobo';

let bpmWorker = Bonobo('bpm')
	.hoist(() => {
		const MIN_THRESHOLD = 0.3;
		const MIN_PEAKS = 30;

		var SAMPLE_RATE = 44100;

		function getPeaksAtThreshold(data, threshold) {
			var arr = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i] > threshold) {
					arr.push(i);
					i += 9999;
				}
			}
			return arr;
		}

		function countIntervalsBetweenNearbyPeaks(peaks) {
			return peaks.reduce((acc, peak, index, arr) => {
				for (let i = 0; i < 10; i++) {
					var interval = arr[index + i] - peak;
					acc[interval] = ++acc[interval] || 1;
				}
				return acc;
			}, {});
		}

		function groupNeighborsByTempo(intervalCounts) {
			return Object['keys'](intervalCounts).reduce((acc, key) => {
				if (isNaN(key) || key == 0) return acc;
				let count = intervalCounts[key];
				let theoreticalTempo = 60 / (key / this['SAMPLE_RATE']);
				while (theoreticalTempo < 70) theoreticalTempo *= 2;
				while (theoreticalTempo > 180) theoreticalTempo /= 2;
				theoreticalTempo = theoreticalTempo.toFixed(2);
				acc[theoreticalTempo] = count += (acc[theoreticalTempo] || 0);
				return acc;
			}, {});
		}

		function retrieveHighestCount(neighbors) {
		 	return Object['keys'](neighbors).sort((a, b) => neighbors[b] - neighbors[a])[0];
		}

		return {
			MIN_THRESHOLD, MIN_PEAKS, SAMPLE_RATE,
			getPeaksAtThreshold,
			countIntervalsBetweenNearbyPeaks,
			groupNeighborsByTempo,
			retrieveHighestCount
		};
	})
	.define('setup', function setup(sampleRate) {
		SAMPLE_RATE = sampleRate;
		this['Bonobo'].emit('setup');
	})
	.define('calculate', function calculate(channel) {
		var threshold = 0.9;
		var peaks;
		do {
			peaks = getPeaksAtThreshold(channel, threshold);
			threshold -= 0.05;
		} while (peaks.length < MIN_PEAKS && threshold >= MIN_THRESHOLD);
		var intervals = countIntervalsBetweenNearbyPeaks(peaks);
		var neighbors = groupNeighborsByTempo(intervals);
		var bpm = retrieveHighestCount(neighbors);
		this['Bonobo'].done(bpm);
	});

export default bpmWorker;