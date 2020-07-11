import { getNumbersInString } from './get-numbers-in-string';
import { executeCMD } from './exec-cmd';

export function findPidByPort(port: number): Promise<number> {
    return new Promise(async (resolve) => {
        var output = await executeCMD('netstat -ano | findstr ' + port);
        if(output !== 'error'){
            resolve(getNumbersInString(output)[0]);
        } else {
            resolve(0);
        }
    });
}