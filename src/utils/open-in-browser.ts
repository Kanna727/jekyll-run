import compareVersions = require("compare-versions");
import { version, commands, Uri, env } from "vscode";

export function openUrl(url: string = 'http://127.0.0.1') {
    if (compareVersions.compare(version, '1.31', '<')) {
        commands.executeCommand('vscode.open', Uri.parse(url));
    } else {
        env.openExternal(Uri.parse(url));
    }
}

export function openLocalJekyllSite(port: number = 4000) {
    if (compareVersions.compare(version, '1.31', '<')) {
        commands.executeCommand('vscode.open', Uri.parse('http://127.0.0.1:' + port));
    } else {
        env.openExternal(Uri.parse('http://127.0.0.1:' + port));
    }
}