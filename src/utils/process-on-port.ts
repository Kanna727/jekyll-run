import { findPidByPort } from "./pid-on-port";
import { findProcessName } from "./process-at-pid";
import { executeCMD } from "./exec-cmd";

export class ProcessOnPort{
    pid: number = 0;
    name: string = '';
}

export function findProcessOnPort(port: number): Promise<ProcessOnPort>{
    return new Promise(async (resolve)=>{
        const processOnPort = new ProcessOnPort();
        if(process.platform === 'win32'){
            processOnPort.pid = await findPidByPort(port);
            if(processOnPort.pid !== 0){
                processOnPort.name = await findProcessName(processOnPort.pid);
            }
            resolve(processOnPort);
        } else {
            var output = await executeCMD('lsof -i tcp:' + port);
            if(output !== 'error'){
                var splittedOutput = output.split('\n')[1].split(' ');
                    processOnPort.name = splittedOutput[0];
                    processOnPort.pid = +splittedOutput[1];
                    // var numbersInSplittedOutput = getNumbersInString(splittedOutput[0]);
                    // if(numbersInSplittedOutput.length>0){
                    //     processOnPort.pid = numbersInSplittedOutput[numbersInSplittedOutput.length-1];
                    // }
                    resolve(processOnPort);
            } else {
                resolve(processOnPort);
            }
        }
    });
}