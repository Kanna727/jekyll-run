import { exec, spawn } from "child_process";
import { stripLine, extractColumns, parseTable } from "./utils";

import path = require('path');

function fetchBin (cmd: string) {
  const pieces = cmd.split(path.sep);
  const last = pieces[pieces.length - 1];
  if (last) {
    pieces[pieces.length - 1] = last.split(' ')[0];
  }
  const fixed = [];
  for (const part of pieces) {
    const optIdx = part.indexOf(' -');
    if (optIdx >= 0) {
      // case: /aaa/bbb/ccc -c
      fixed.push(part.substring(0, optIdx).trim());
      break;
    } else if (part.endsWith(' ')) {
      // case: node /aaa/bbb/ccc.js
      fixed.push(part.trim());
      break;
    }
    fixed.push(part);
  }
  return fixed.join(path.sep);
}

function fetchName (fullpath: string) {
  if (process.platform === 'darwin') {
    const idx = fullpath.indexOf('.app/');
    if (idx >= 0) {
      return path.basename(fullpath.substring(0, idx));
    }
  }
  return path.basename(fullpath);
}

 function darwin (pid: number): Promise<string> {
    return new Promise((resolve, reject) => {
      let cmd;
      if (pid) {
        cmd = `ps -p ${pid} -ww -o pid,ppid,uid,gid,args`;
      } else {
        cmd = `ps ax -ww -o pid,ppid,uid,gid,args`;
      }

      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          resolve('');
        } else {
          //err = stderr.toString().trim();
          if (err) {
            resolve('');
            return;
          }

          let data = stripLine(stdout.toString(), 1);
          let columns = extractColumns(data, [0, 1, 2, 3, 4], 5).filter((column: any[]) => {
            if (column[0] && pid) {
              return column[0] === String(pid);
            } else {
              return !!column[0];
            }
          });

          let list = columns.map((column: any[]) => {
            const cmd = String(column[4]);
            const bin = fetchBin(cmd);
            return fetchName(bin);
          });

          // if (cond.strict && cond.name) {
          //   list = list.filter((item: { name: any; }) => item.name === cond.name);
          // }

          resolve(list[0]);
        }
      });
    });
  };
  function win32 (pid: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const cmd = 'WMIC path win32_process get Name,Processid,ParentProcessId,Commandline,ExecutablePath';
      const lines: any[] = [];

      const proc = spawn('cmd', ['/c', cmd], { detached: false, windowsHide: true });
      proc.stdout.on('data', data => {
        lines.push(data.toString());
      });
      proc.on('close', code => {
        if (code !== 0) {
          return resolve('');
        }
        let list = parseTable(lines.join('\n'))
          .filter((row) => {
            if (pid) {
              return row.ProcessId === String(pid);
            } else {
              return true;
            }
          })
          .map((row) => {
            return row.Name;
          });
        resolve(list[0]);
      });
    });
  };

export function findProcessName (pid: number): Promise<string> {
  let platform = process.platform;
      switch(platform){
        case "linux":
        case "sunos":
        case "freebsd":
        case "darwin":
            return darwin(pid);
        case "win32":
            return win32(pid);
        default:
          return new Promise((resolve, reject)=>{resolve('');});
      }
}
