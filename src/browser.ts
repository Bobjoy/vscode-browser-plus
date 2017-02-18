"use strict";

import * as path from "path";
import * as child_process from "child_process";
import * as vscode from "vscode";
import * as fs from 'mz/fs';

import {getUri, getPath, logInfo, logError} from './libs/utils';

import * as portServices from './libs/port';

export function startServer(port): PromiseLike<any> {
    let options = `--server --port ${port} --files "css/*.css, *.html" --no-notify --no-open`;
    return new Promise((resolve, reject) => {
        let cp = child_process.exec(`node ${path.join(__dirname, '../../node_modules/browser-sync/bin/browser-sync')} start ${options}`, {
            cwd: vscode.workspace.rootPath,
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

export function formatContent(port) {
    const previewContentTpl = getPath('../../index.html');
    const previewContent = getPath('../../content.html');

    return fs.readFile(previewContentTpl)
        .then(data => {
            return fs.writeFile(previewContent, data.toString().replace(/{{PORT}}/g, port.toString()))
        })
};

export function createPreviewer() {
    var viewColumn = vscode.ViewColumn.One;

    let editor = vscode.window.activeTextEditor;
    if (vscode.window.activeTextEditor) {
        viewColumn = +editor.viewColumn;
    }
    
    viewColumn = Math.min(viewColumn + 1, vscode.ViewColumn.Three);

    const previewUri = getUri('../../content.html');

    return vscode.commands.executeCommand('vscode.previewHtml', previewUri, viewColumn, "Browser");
}

export function getRunningServer() {
    return fs.readFile(getPath('../../port'))
        .then(data => {
            return portServices.isFreePort(data.toString())
                .then(res => {
                    return !res;
                });
        })
        .catch(err => {
            return false;
        });
}

export function startPreview() {
return getRunningServer()
    .then(running => {
        if (running) {
            return createPreviewer();
        }

        return portServices.getFreePort()
            .then(port => {
                return Promise.all([
                        formatContent(port),
                        startServer(port)
                    ])
                    .then(() => {
                        return Promise.all([createPreviewer()]);
                    });
            });
    })
    .catch(err => {
        vscode.window.showErrorMessage(`打开预览失败[${err}]！`)
    });
    

}