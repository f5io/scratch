export default function readFile(file) {
	return new Promise((resolve, reject) => {
		let fileReader = new FileReader();
		fileReader.addEventListener('load', e => resolve(fileReader.result));
		fileReader.addEventListener('error', e => reject(e));
		fileReader.addEventListener('abort', e => this.abort(e));
		fileReader.addEventListener('progress', e => this.progress(e));
		fileReader.readAsArrayBuffer(file);
	});
}