import { getNumbersInString } from './get-numbers-in-string';
import { executeCMD } from './exec-cmd';

export function findPidByPort(port: number): Promise<number> {
    return new Promise((resolve) => { 
        if (process.platform === 'win32') {
            executeCMD('netstat -ano | findstr ' + port)
                .then((output) => resolve(getNumbersInString(output)[0]))
                .catch(() => resolve(0));
        } else {
            executeCMD('netstat -tunlp | grep -w ' + port)
                .then((output) => resolve(getNumbersInString(output)[0]))
                .catch(() => resolve(0));
        }
    });
}