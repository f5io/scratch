import { getTags, getArtwork } from './';

export default function getMetadata(file) {
	return new Promise((resolve, reject) => {
		getTags(file).then(getArtwork).then(resolve).catch(reject);
	});
}