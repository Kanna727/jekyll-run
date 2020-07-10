import { window, ProgressLocation, OutputChannel } from "vscode";
import { spawn } from "child_process";

export class Install {
    constructor() { }
    
    async Install(workspaceRootPath: string, outputChannel: OutputChannel) {
        return await window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: 'Bundle Installing...',
                cancellable: false,
            },
            async () => {
                return new Promise((resolve, reject) => {
                    var child = spawn(`bundle install`, {
                        cwd: workspaceRootPath,
                        shell: true,
                      });

                      console.log("Running on PID: " + child.pid);
            
                      child.stdout.on('data',  (data) => {
                        console.log('stdout: ' + data);
                        var strString = data.toString();
                        outputChannel.append(strString);
                        outputChannel.show();
                      });
                      child.stderr.on('data',  (data) => {
                        console.log('stderr: ' + data);
                        reject();
                      });
                      child.on('close',  (code) => {
                        console.log('closing code: ' + code);
                        resolve();
                      });
                });
            }
        );
    }
}