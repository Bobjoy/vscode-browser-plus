"use strict";

import * as path from "path";
import * as child_process from "child_process";
import * as vscode from "vscode";

const previewContentTpl = path.join(__dirname, "../../index.html");
const previewContent = path.join(__dirname, "../../content.html");
const previewUri = vscode.Uri.file(process.platform == "win32" ? `file:///${previewContent}`: previewContent);

export function startServer(port): PromiseLike<any> {
    return new Promise((resolve, reject) => {
        let cp = child_process.exec(`node ${path.join(__dirname, "../../node_modules/wept/bin/wept")} --port ${port}`, {
            cwd: vscode.workspace.rootPath,
            encoding: "utf-8"
        });

        cp.stdout.once('data', data => {
            resolve();
        });

        cp.stderr.on('data', err => {
            reject(err);
        })
    });
}


export function createPreviewer() {
    var viewColumn = +vscode.window.activeTextEditor.viewColumn;
    viewColumn = Math.min(viewColumn + 1, vscode.ViewColumn.Three);

    return vscode.commands.executeCommand('vscode.previewHtml', previewUri, viewColumn, "Integrated Browser");
}

export function startPreview() {

    return Promise.all([
        startServer(3000)
    ])
    .then(() => {
        return Promise.all([createPreviewer()]);
    })

}