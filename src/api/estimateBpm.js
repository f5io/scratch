import Bonobo from 'bonobo';

let Worker = Bonobo('bpm')
  .hoist(function() {
    const MIN_THRESHOLD = 0.3;
    const MIN_PEAKS = 30;

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
        let theoreticalTempo = 60 / (key / 44100);
        while (theoreticalTempo < 80) theoreticalTempo *= 2;
        while (theoreticalTempo > 180) theoreticalTempo /= 2;
        theoreticalTempo = theoreticalTempo.toFixed(2);
        acc[theoreticalTempo] = count += (acc[theoreticalTempo] || 0);
        return acc;
      }, {});
    }

    function averageCountsOverThreshold(neighbors) {
      let values = Object['keys'](neighbors).sort((a, b) => neighbors[b] - neighbors[a]);
      return values[0];
    }

    return {
      MIN_THRESHOLD,
      MIN_PEAKS,
      getPeaksAtThreshold,
      countIntervalsBetweenNearbyPeaks,
      groupNeighborsByTempo,
      averageCountsOverThreshold
    };
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
    var bpm = averageCountsOverThreshold(neighbors);
    this['Bonobo'].done(bpm);
  });


let renderCompleteHandler = (e) => {
	let buffer = e.renderedBuffer;
	let channelData = buffer.getChannelData(0);
  Worker.done(bpm => { console.log('BPM from Worker', bpm); }).compile().then(() => Worker.calculate(channelData));
}

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