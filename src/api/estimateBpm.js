let offlineContext;

let renderCompleteHandler = (e) => {
	let buffer = e.renderedBuffer;
	let channelData = buffer.getChannelData(0);
	let peaks = getPeaksAtThreshold(channelData, -0.55);
	let intervals = countIntervalsBetweenNearbyPeaks(peaks);
	let neighbors = groupNeighborsByTempo(intervals);
	console.log(neighbors);
}

function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 10000;
    }
    i++;
  }
  return peaksArray;
}

function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  console.log(peaks.length);
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

function groupNeighborsByTempo(intervalCounts) {
	console.log(intervalCounts.length);
  var tempoCounts = []
  intervalCounts.forEach(function(intervalCount, i) {
    // Convert an interval to tempo
    var theoreticalTempo = 60 / (intervalCount.interval / 44100 );

    // Adjust the tempo to fit within the 90-180 BPM range
    while (theoreticalTempo < 90) theoreticalTempo *= 2;
    while (theoreticalTempo > 180) theoreticalTempo /= 2;

    var foundTempo = tempoCounts.some(function(tempoCount) {
      if (tempoCount.tempo === theoreticalTempo)
        return tempoCount.count += intervalCount.count;
    });
    if (!foundTempo) {
      tempoCounts.push({
        tempo: theoreticalTempo,
        count: intervalCount.count
      });
    }
  });
}

export default function estimateBpm(buffer) {
	offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
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