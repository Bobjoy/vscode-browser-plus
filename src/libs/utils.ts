'use strict';

import * as path from "path";
import * as vscode from 'vscode';

export function getUri(file: string): vscode.Uri {
  file = getPath(file);
  if (process.platform === 'win32') {
    return vscode.Uri.parse(`file:///${file}`);
  } else {
    return vscode.Uri.file(file);
  }
};

export function getPath(file: string): string {
  return path.join(__dirname, '..', file);
};

export function logInfo(msg: any): void {
  vscode.window.showInformationMessage(msg);
};

export function logError(err: any): void {
  vscode.window.showErrorMessage(err);
}