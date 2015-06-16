const MIN_THRESHOLD = 0.3;
const MIN_PEAKS = 30;

let renderCompleteHandler = (e) => {
	let buffer = e.renderedBuffer;
	let channelData = buffer.getChannelData(0);
  let threshold = 0.9;
	let peaks;
  do {
    peaks = getPeaksAtThreshold(channelData, threshold);
    threshold -= 0.05;
  } while (peaks.length < MIN_PEAKS && threshold >= MIN_THRESHOLD);
  let intervals = countIntervalsBetweenNearbyPeaks(peaks);
  let neighbors = groupNeighborsByTempo(intervals);
  let avg = averageCountsOverThreshold(neighbors);
  console.log(avg);
}

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
  return Object.keys(intervalCounts).reduce((acc, key) => {
    if (isNaN(key) || key == 0) return acc;
    let count = intervalCounts[key];
    let theoreticalTempo = 60 / (key / 44100);
    while (theoreticalTempo < 80) theoreticalTempo *= 2;
    while (theoreticalTempo > 180) theoreticalTempo /= 2;
    theoreticalTempo = theoreticalTempo.toFixed(2);
    acc[theoreticalTempo] = acc[theoreticalTempo] || 0;
    acc[theoreticalTempo] += count;
    return acc;
  }, {});
}

function averageCountsOverThreshold(neighbors) {
  let values = Object.keys(neighbors).sort((a, b) => neighbors[b] - neighbors[a]);
  return values[0];
};

export default function estimateBpm(buffer) {
	let offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
	let source = offlineContext.createBufferSource();
	let filter = offlineContext.createBiquadFilter();
	filter.type = 'lowpass';
	source.buffer = buffer;
	source.connect(filter)
	filter.connect(offlineContext.destination);
	source.start(0);
	offlineContext.addEventListener('complete', renderCompleteHandler);
	offlineContext.startRendering();
}