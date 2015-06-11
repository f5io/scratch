let eventMap = { completed: 'load', failed: 'error' };

export default function readFile(file) {
	return new Promise((resolve, reject) => {
		let fileReader = new FileReader();
		this.children.forEach(event => fileReader.addEventListener(eventMap[event] || event, this[event]), this);
		fileReader.readAsArrayBuffer(file);
	});
}