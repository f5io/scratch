import { getArtwork, getTags } from './';

export default function getMetadata(file) {
	return new Promise((resolve, reject) => {
		getTags(file).then(tags => getArtwork(tags))
			.then(resolve).catch(reject);
	});
};