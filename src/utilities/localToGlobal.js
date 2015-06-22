export default function localToGlobal(el, { centerX, centerY }) {
	let rect = el.getBoundingClientRect();
	let x = centerX + rect.left;
	let y = centerY + rect.top;
	return { x, y };
};