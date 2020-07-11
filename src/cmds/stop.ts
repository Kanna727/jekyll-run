import { window, ProgressLocation, OutputChannel } from "vscode";
import { childrenOfPid } from "../utils/process-group";
import { executeCMD } from "../utils/exec-cmd";

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
                    await executeCMD('TASKKILL /F /T /PID ' + pid);
                    outputChannel.appendLine('Server Stopped');
                    outputChannel.show();
                    resolve();
                });
            }
        );
    }
}