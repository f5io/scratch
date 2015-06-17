export default function getArtwork(tags) {
	return fetch(`http://ws.audioscrobbler.com/2.0/
		?method=album.search
		&album=${encodeURIComponent(tags.album)}
		&api_key=e53a30d5c5f1991c28d57b4562f3fd76
		&format=json`)
		.then(response => response.json())
		.then(json => json.results.albummatches.album)
		.then(matches => matches.length && matches[0].image || matches.image)
		.then(images => images.reduce((acc, image) => (acc[image.size] = image['#text']) && acc, {}))
		.then(images => Object.assign(tags, { artwork: images }));
};