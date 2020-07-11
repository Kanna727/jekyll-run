import { executeCMD } from "./exec-cmd";
import { getNumbersInString } from "./get-numbers-in-string";

export async function killProcessAndChildren(ppid: number) {
    if (process.platform === 'win32') {
        await executeCMD('TASKKILL /F /T /PID ' + ppid);
    } else {
        let pidToBeKilled: number[] = [ppid];
        let currentIndexOfPIDtoFetchChildren = 0;

        while (pidToBeKilled.length !== currentIndexOfPIDtoFetchChildren) {
            var output = await executeCMD('ps -o pid --ppid ' + pidToBeKilled[currentIndexOfPIDtoFetchChildren]);
            if (output !== 'error') {
                var newChildrens = getNumbersInString(output.split('\n').join(' '));
                if (newChildrens.length !== 0) {
                    pidToBeKilled.push.apply(pidToBeKilled, newChildrens);
                }
            }
            currentIndexOfPIDtoFetchChildren++;
        }

        var strPidToBeKilled = pidToBeKilled.join(' ');
        executeCMD('kill -9 ' + strPidToBeKilled);
    }
}