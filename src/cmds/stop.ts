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
                    if (pid === 0) {
                        resolve();
                    }
                    else {
                        killProcessAndChildren(pid).finally(() => {
                            outputChannel.appendLine('Server Stopped');
                            outputChannel.show(true);
                            resolve();
                        });
                    }
                });
            }
        );
    }
}