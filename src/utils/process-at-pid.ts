import { executeCMD } from "./exec-cmd";

export function findProcessName(pid: number): Promise<string> {
  return new Promise(async (resolve) => {
    var output = await executeCMD('tasklist /fi "pid eq ' + pid + '" /fo csv /NH');
    if(output !== 'error'){
      resolve(output.split(',')[0]);
    } else {
      resolve('');
    }
  });
}
