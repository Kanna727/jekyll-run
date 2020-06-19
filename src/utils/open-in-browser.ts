import compareVersions = require("compare-versions");
import { version, commands, Uri, env } from "vscode";

export function openInBrowser(url:string) {
    if (compareVersions.compare(version, '1.31', '<')) {
        commands.executeCommand('vscode.open', Uri.parse(url));
    } else {
        env.openExternal(Uri.parse(url));
    }
}