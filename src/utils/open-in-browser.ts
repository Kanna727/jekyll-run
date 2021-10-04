import compareVersions = require("compare-versions");
import { version, commands, Uri, env } from "vscode";

export function openUrl(url: string = 'http://127.0.0.1') {
    if (compareVersions.compare(version, '1.31', '<')) {
        commands.executeCommand('vscode.open', Uri.parse(url));
    } else {
        env.openExternal(Uri.parse(url));
    }
}

/**
 * Deprecated from v1.7.0,
 * @param port 
 * @param baseurl 
 */
// export function openLocalJekyllSite(port: number = 4000, baseurl: string = '') {
//     let path = baseurl.replace(/^\/?(\S+[^\/]|\S+)(\/?)$/, '/$1/');
//     if (compareVersions.compare(version, '1.31', '<')) {
//         commands.executeCommand('vscode.open', Uri.parse('http://127.0.0.1:' + port + path));
//     } else {
//         env.openExternal(Uri.parse('http://127.0.0.1:' + port + path));
//     }
// }