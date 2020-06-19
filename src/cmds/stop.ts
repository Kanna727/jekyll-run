export class Stop {
    constructor() { }
    
    async Stop(pid: number) {
        console.log('stopping: ' + pid);
        process.kill(pid);
        const { killPortProcess } = require('kill-port-process');
        const PORT = 4000;

        (async () => {
            await killPortProcess(PORT);
        })();
    }
}