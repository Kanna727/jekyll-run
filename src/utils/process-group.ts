import { getNumbersInString } from './get-numbers-in-string';
import { executeCMD } from './exec-cmd';

export async function childrenOfPid(pid: number): Promise<number[]> {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      executeCMD('wmic process where (ParentProcessId=' + pid + ') get ProcessId')
        .then((output) => resolve(getNumbersInString(output)))
        .catch(() => resolve([]));
    } else {
      executeCMD('ps -o pid --ppid ' + pid)
        .then((output) => resolve(getNumbersInString(output)))
        .catch(() => resolve([]));
    }
  });
}