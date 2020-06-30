import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { window, workspace, ProgressLocation } from 'vscode';

export class Build {
    constructor() { }

    async build(workspaceRootPath: string) {
        return await window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: 'Jekyll Building',
                cancellable: true,
            },

            async (_progress, token) => {
                return new Promise(function (resolve, reject) {
                    var child = spawn(`bundle exec jekyll build`, {
                        cwd: workspaceRootPath,
                        shell: true,
                    });

                    token.onCancellationRequested(async () => {
                        console.log("User canceled. Stopping: " + child.pid);
                        spawn("taskkill", ["/pid", child.pid.toString(), '/f', '/t']);
                        reject();
                    });

                    child.stdout.on('data', function (data) {
                        console.log('stdout: ' + data);
                    });
                    child.stderr.on('data', function (data) {
                        console.log('stderr: ' + data);
                        reject();
                    });
                    child.on('close', function (code) {
                        console.log('closing code: ' + code);
                        resolve();
                    });
                });
            },
        );
    }
}
