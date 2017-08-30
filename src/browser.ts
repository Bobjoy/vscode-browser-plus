"use strict";

import * as path from "path";
import * as child_process from "child_process";
import { commands, ViewColumn, window, workspace } from "vscode";
import * as fs from 'mz/fs';

import { getUri, getPath, logInfo, logError } from './libs/utils';

import * as portServices from './libs/port';

export function startServer(port): PromiseLike<any> {
	window.showErrorMessage(port)
	let options = `--server --port ${port} --files "css/*.css, *.html" --no-notify --no-open`;
	return new Promise((resolve, reject) => {
		let cp = child_process.exec(`node ${path.join(__dirname, '../../node_modules/browser-sync/bin/browser-sync')} start ${options}`, {
			cwd: workspace.rootPath,
			encoding: "utf-8"
		});

		cp.stdout.once('data', data => {
			resolve();
		});

		cp.stderr.on('data', err => {
			logError(JSON.stringify(err));
			reject(err);
		})
	});
}

export function formatContent(port: number) {
	const previewContentTpl = getPath('../../index.html');
	const previewContent = getPath('../../content.html');

	return fs.readFile(previewContentTpl)
		.then(data => {
			return fs.writeFile(previewContent, data.toString().replace(/{{PORT}}/g, port))
		})
};

export function createPreviewer() {
	var viewColumn = ViewColumn.One;

	let editor = window.activeTextEditor;
	if (window.activeTextEditor) {
		viewColumn = +editor.viewColumn;
	}

	viewColumn = Math.min(viewColumn + 1, ViewColumn.Three);

	const previewUri = getUri('../../content.html');

	return commands.executeCommand('vscode.previewHtml', previewUri, viewColumn, "Browser");
}

/**
 *
 * Check Server Running
 *
 * @export
 * @returns
 */
export function getRunningServer(port: number) {
	return portServices.isFreePort(port)
		.then(res => {
			return !res;
		});
}

/**
 *
 * Open Preview Window
 *
 * @export
 * @returns
 */
export function startPreview() {
	let port = 10086;

	let settings = workspace.getConfiguration('browser');
	if (settings) {
		port = settings.get('preview.port', port);
	}

	return getRunningServer(port)
		.then(running => {
			if (running) {
				return createPreviewer();
			}

			return Promise.all([
				formatContent(port),
				startServer(port)
			])
				.then(() => {
					return Promise.all([createPreviewer()]);
				});
		})
		.catch(err => {
			window.showErrorMessage(`Open browser preview faild[${err}]！`)
		});


}
