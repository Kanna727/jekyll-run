import { window, ProgressLocation, OutputChannel } from "vscode";
import { killProcessAndChildren } from "../utils/kill-process-children";

export class Stop {
    constructor() { }

    async Stop(pid: number, outputChannel: OutputChannel) {
        return await window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: 'Jekyll Stopping...',
                cancellable: false,
            },
            async () => {
                return new Promise(async (resolve) => {
                    console.log('stopping: ' + pid);
                    await killProcessAndChildren(pid);
                    outputChannel.appendLine('Server Stopped');
                    outputChannel.show(true);
                    resolve();
                });
            }
        );
    }
}