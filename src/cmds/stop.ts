import { window, ProgressLocation } from "vscode";

export class Stop {
    constructor() { }
    
    async Stop(pid: number) {
        return await window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: 'Jekyll Stopping...',
                cancellable: false,
            },
            async () => {
                return new Promise((resolve, _reject) => {
                    console.log('stopping: ' + pid);
                    process.kill(pid);
                    const { killPortProcess } = require('kill-port-process');
                    const PORT = 4000;

                    (async () => {
                        await killPortProcess(PORT);
                    })().then(() => resolve());
                });
            }
        );
    }
}