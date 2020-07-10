import { window, ProgressLocation, OutputChannel } from "vscode";
import { childrenOfPid } from "../utils/process-group";

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
                return new Promise(async (resolve, _reject) => {
                    console.log('stopping: ' + pid);
                    var childrenPID = await childrenOfPid(pid);
                    childrenPID.forEach(childPID => {
                        process.kill(childPID);
                    });
                    process.kill(pid);
                    outputChannel.appendLine('Server Stopped');
                    outputChannel.show();
                    resolve();
                });
            }
        );
    }
}