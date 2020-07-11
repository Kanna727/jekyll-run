import { getNumbersInString } from './get-numbers-in-string';
import { executeCMD } from './exec-cmd';

export async function findGpid(pid: number): Promise<number> {
  return new Promise(async (resolve) => {
      var output = await executeCMD('ps -p '+ pid + ' -o "%r" --no-headers');
      if(output !== 'error'){
        resolve(getNumbersInString(output)[0]);
      } else {
        resolve(0);
      }
  });
}