'use strict';

import * as vscode from 'vscode';

import * as Browser from './browser';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "browser-plus" is now active!');

    // 注册 Open Browser 命令
    let browser = vscode.commands.registerCommand('extension.openBrowser', () => {

        Browser.startPreview();

    });
    context.subscriptions.push(browser);
}
