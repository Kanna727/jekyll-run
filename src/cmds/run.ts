import {
  window,
  ProgressLocation,
  StatusBarAlignment,
  OutputChannel,
} from 'vscode';
import { spawn } from 'child_process';
import { openUrl } from '../utils/open-in-browser';
import { Stop } from './stop';
import { Config } from '../config/config';

export class Run {
  pid: number = 0;
  regenerateStatus = window.createStatusBarItem(StatusBarAlignment.Left, 497);
  address: string = '';
  constructor() { }

  async run(workspaceRootPath: string, serverPort: number, serverBaseurl: string, outputChannel: OutputChannel) {
    return await window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Jekyll Building...',
        cancellable: true,
      },
      async (_progress, token) => {
        return new Promise((resolve, reject) => {
          const config = Config.get();
          var child = spawn('bundle exec jekyll serve', config.commandLineArguments.toString().trim().split(' '), {
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
            outputChannel.show(true);
            if (strString.includes('Server address')) {
              const match = strString.match(/Server address: (\S+)/m);
              this.address = match?.[1]  || `http://localhost:${serverPort}`;
            }
            if (strString.includes('Server running')) {
              openUrl(this.address);
              resolve(true);
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
            var error = data.toString();
            if(error.includes('Error') || error.includes('argument')){
              console.log('stderr: ' + data);
              this.regenerateStatus.hide();
              reject(data);
            }
            if(error.includes('ruby')){
              console.log('stderr: ' + data);
              this.regenerateStatus.hide();
              reject(error.match(/\B(.+)Errno(.+)/m));
            }
          });
          child.on('close', (code) => {
            console.log('closing code: ' + code);
            this.regenerateStatus.hide();
            resolve(false);
          });
        });
      },
    );
  }
}
