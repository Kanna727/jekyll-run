import {
  window,
  commands,
  Uri,
  env,
  version,
  ProgressLocation,
  StatusBarAlignment,
} from 'vscode'
import compareVersions = require('compare-versions')
import { spawn } from 'child_process'

export class Run {
  pid: number = 0
  regenerateStatus = window.createStatusBarItem(StatusBarAlignment.Left, 497)
  constructor() {}

  async run(workspaceRootPath: string) {
    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Jekyll Building...',
        cancellable: false,
      },
      () => {
        return new Promise( (resolve, reject) => {
          var child = spawn(`bundle exec jekyll serve`, {
            cwd: workspaceRootPath,
            shell: true,
          })

          this.pid = child.pid

          child.stdout.on('data',  (data) => {
            console.log('stdout: ' + data)
            var strString = data.toString()
            if (strString.includes('Server running')) {
              if (compareVersions.compare(version, '1.31', '<')){
                commands.executeCommand('vscode.open', Uri.parse('http://127.0.0.1:4000/'))
              } else {
                env.openExternal(Uri.parse('http://127.0.0.1:4000/'));
              }
              resolve()
            }
            else if (strString.includes('Regenerating')) {
              this.regenerateStatus.text = 'Jekyll Regenerating...'
              this.regenerateStatus.show()
            }
            else if (strString.includes('...done')) {
              this.regenerateStatus.hide()
            }
          })
          child.stderr.on('data', function (data) {
            console.log('stderr: ' + data)
            reject()
          })
          child.on('close', function (code) {
            console.log('closing code: ' + code)
            resolve()
          })
        })
      },
    )
  }
}
