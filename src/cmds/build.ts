import { spawn, ChildProcessWithoutNullStreams } from 'child_process'
import { window, workspace, ProgressLocation } from 'vscode'

export class Build {
    constructor() { }

    async build(workspaceRootPath: string) {
        window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: 'Jekyll Building',
                cancellable: false,
            },

            () => {
                return new Promise(function (resolve, reject) {
                    var child = spawn(`bundle exec jekyll build`, {
                        cwd: workspaceRootPath,
                        shell: true,
                    })

                    child.stdout.on('data', function (data) {
                        console.log('stdout: ' + data)
                    })
                    child.stderr.on('data', function (data) {
                        console.log('stderr: ' + data)
                        reject()
                    })
                    child.on('close', function (code) {
                        console.log('closing code: ' + code)
                        if (code == 0) {
                            window.showInformationMessage('Built successfully!')
                            resolve()
                        } else {
                            window.showErrorMessage('Error in building')
                            reject()
                        }
                    })
                })
            },
        )
    }
}
