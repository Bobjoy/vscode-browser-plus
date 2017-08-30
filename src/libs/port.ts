'use strict';

import { window } from "vscode";

const detect = require('detect-port');

export function isFreePort(port) {
	return detect(port)
		.then(_port => {
			if (port === _port) {
				window.showInformationMessage('The port【' + port + '】 is available.');
				return true;
			} else {
				window.showWarningMessage('The port【' + port + '】 is occupied, please change the \'browser.preview.port\' option in setting.json!');
				return false;
			}
		})
}
