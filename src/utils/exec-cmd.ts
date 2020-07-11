import { exec } from "child_process";

export function executeCMD(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                reject(err.toString());
            } else {
                resolve(stdout.toString());
            }
        });
    });
}