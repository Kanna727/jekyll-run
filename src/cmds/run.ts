import {
  window,
  ProgressLocation,
  StatusBarAlignment,
  OutputChannel,
} from 'vscode';
import { spawn } from 'child_process';
import { openLocalJekyllSite } from '../utils/open-in-browser';
import { Stop } from './stop';

export class Run {
  pid: number = 0;
  regenerateStatus = window.createStatusBarItem(StatusBarAlignment.Left, 497);
  constructor() { }

  async run(workspaceRootPath: string, portInConfig: number, outputChannel: OutputChannel) {
    return await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Jekyll Building...',
        cancellable: true,
      },
      async (_progress, token) => {
        return new Promise((resolve, reject) => {
          var child = spawn(`bundle exec jekyll serve`, {
            cwd: workspaceRootPath,
            shell: true,
          });

          console.log("Running on PID: " + child.pid);
          this.pid = child.pid;

          token.onCancellationRequested(async () => {
            console.log("User canceled. Stopping: " + child.pid);
            const stop = new Stop();
            await stop.Stop(this.pid, outputChannel);
            reject();
          });

          child.stdout.on('data', (data) => {
            console.log('stdout: ' + data);
            var strString = data.toString();
            outputChannel.append(strString);
            outputChannel.show();
            if (strString.includes('Server running')) {
              openLocalJekyllSite(portInConfig);
              resolve();
            }
            else if (strString.includes('Regenerating')) {
              this.regenerateStatus.text = 'Jekyll Regenerating...';
              this.regenerateStatus.show();
            }
            else if (strString.includes('...done')) {
              this.regenerateStatus.hide();
            }
          });
          child.stderr.on('data', (data) => {
            if(data.toString().includes('Error')){
              console.log('stderr: ' + data);
              this.regenerateStatus.hide();
              reject(data);
            }
          });
          child.on('close', (code) => {
            console.log('closing code: ' + code);
            this.regenerateStatus.hide();
            resolve();
          });
        });
      },
    );
  }
}
