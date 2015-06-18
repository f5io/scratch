export default function toArray(obj) {
	return Object.keys(obj).map(key => obj[key]);
}