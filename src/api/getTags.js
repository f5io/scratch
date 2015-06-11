import id3 from 'id3js';

export default function getTags(file) {
	return new Promise((resolve, reject) => {
		id3(file, (err, tags) => err && reject(err) || resolve(tags));
	});
};