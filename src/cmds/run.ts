import {
  window,
  ProgressLocation,
  StatusBarAlignment,
} from 'vscode';
import { spawn } from 'child_process';
import { openInBrowser } from '../utils/open-in-browser';
import { Stop } from '../cmds/stop';

export class Run {
  pid: number = 0;
  regenerateStatus = window.createStatusBarItem(StatusBarAlignment.Left, 497);
  constructor() {}

  async run(workspaceRootPath: string) {
    return await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Jekyll Building...',
        cancellable: true,
      },
      async (_progress, token) => {
        return new Promise( (resolve, reject) => {
          var child = spawn(`bundle exec jekyll serve`, {
            cwd: workspaceRootPath,
            shell: true,
          });
          
          console.log("Running on PID: " + child.pid);
          this.pid = child.pid;

          token.onCancellationRequested(async () => {
            console.log("User canceled. Stopping: " + child.pid);
            spawn("taskkill", ["/pid", child.pid.toString(), '/f', '/t']);
            reject();
          });

          child.stdout.on('data',  (data) => {
            console.log('stdout: ' + data);
            var strString = data.toString();
            if (strString.includes('Server running')) {
              openInBrowser('http://127.0.0.1:4000/');
              resolve();
            }
            else if (strString.includes('Regenerating')) {
              this.regenerateStatus.text = 'Jekyll Regenerating...';
              this.regenerateStatus.show();
            }
            else if (strString.includes('...done')) {;
              this.regenerateStatus.hide();
            }
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
