import { executeCMD } from "./exec-cmd";

export function findProcessName(pid: number): Promise<string> {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      executeCMD('tasklist /fi "pid eq ' + pid + '" /fo csv /NH')
        .then((output) => resolve(output.split(',')[0]))
        .catch(() => resolve(''));
    } else {
      executeCMD('ps -q ' + pid + ' -o comm=')
        .then((output) => resolve(output))
        .catch(() => resolve(''));
    }
  });
}
