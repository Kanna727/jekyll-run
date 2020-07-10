import { exec } from 'child_process';
import { stripLine, extractColumns } from './utils';

export async function childrenOfPid(pid: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    var headers: string[];
    var row: { [key: string]: string } = {};
    var childrenPID: number[] = [];
    var strPID: string;

    if (typeof pid === 'number') {
      strPID = pid.toString();
    }
    if (process.platform === 'win32') {
      // See also: https://github.com/nodejs/node-v0.x-archive/issues/2318
      exec('wmic.exe PROCESS GET Name,ProcessId,ParentProcessId,Status', (err, stdout, stderr) => {
        if (err) {
          resolve([]);
        } else {
          const warn = stderr.toString().trim();
          if (warn) {
            // netstat -p ouputs warning if user is no-root
            console.warn(warn);
          }

          // replace header
          let data = stripLine(stdout.toString(), 1);
          let columns = extractColumns(data, [1, 2], 2).filter((x) => {
            return x[0] === strPID;
          });

          columns.forEach(child => {
            var pid = child[1].split(' ')[0];
            var k = parseInt(pid);
            childrenPID[childrenPID.length] = k;
          });
          resolve(childrenPID);
        }
      });
    } else {
      exec('ps -A -o ppid,pid,stat,comm', (err, stdout, stderr) => {
        if (err) {
          resolve([]);
        } else {
          const warn = stderr.toString().trim();
          if (warn) {
            // netstat -p ouputs warning if user is no-root
            console.warn(warn);
          }

          // replace header
          let data = stripLine(stdout.toString(), 1);
          let columns = extractColumns(data, [0, 1], 2).filter((x) => {
            return x[0] === strPID;
          });

          columns.forEach(child => {
            var pid = child[1].split(' ')[0];
            var k = parseInt(pid);
            childrenPID[childrenPID.length] = k;
          });
          resolve(childrenPID);
        }
      });
    }
  });
}
/**
 * Normalizes the given header `str` from the Windows
 * title to the *nix title.
 *
 * @param {string} str Header string to normalize
 */
function normalizeHeader(str: string) {
  switch (str) {
    case 'Name':  // for win32
    case 'COMM':  // for darwin
      return 'COMMAND';
      break;
    case 'ParentProcessId':
      return 'PPID';
      break;
    case 'ProcessId':
      return 'PID';
      break;
    case 'Status':
      return 'STAT';
      break;
    default:
      return str;
  }
}