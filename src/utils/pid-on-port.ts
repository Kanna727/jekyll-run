import { exec } from 'child_process';
import { stripLine, extractColumns } from './utils';

function darwin(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
        exec('netstat -anv -p TCP && netstat -anv -p UDP', function (err, stdout, stderr) {
            if (err) {
                resolve(0);
            } else {
                if (err) {
                    resolve(0);
                    return;
                }

                // replace header
                let data = stripLine(stdout.toString(), 2);
                let found = extractColumns(data, [0, 3, 8], 10)
                    .filter(row => {
                        return !!String(row[0]).match(/^(udp|tcp)/);
                    })
                    .find(row => {
                        let matches = String(row[1]).match(/\.(\d+)$/);
                        if (matches && matches[1] === String(port)) {
                            return true;
                        }
                    });

                if (found && found[2].length) {
                    resolve(parseInt(found[2], 10));
                } else {
                    resolve(0);
                }
            }
        });
    });
};
function linux(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
        let cmd = 'netstat -tunlp';

        exec(cmd, function (err, stdout, stderr) {
            if (err) {
                resolve(0);
            } else {
                const warn = stderr.toString().trim();
                if (warn) {
                    // netstat -p ouputs warning if user is no-root
                    console.warn(warn);
                }

                // replace header
                let data = stripLine(stdout.toString(), 2);
                let columns = extractColumns(data, [3, 6], 7).find(column => {
                    let matches = String(column[0]).match(/:(\d+)$/);
                    if (matches && matches[1] === String(port)) {
                        return true;
                    }
                });

                if (columns && columns[1]) {
                    let pid = columns[1].split('/', 1)[0];

                    if (pid.length) {
                        resolve(parseInt(pid, 10));
                    } else {
                        resolve(0);
                    }
                } else {
                    resolve(0);
                }
            }
        });
    });
};
function win32(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
        exec('netstat -ano', function (err, stdout, stderr) {
            if (err) {
                resolve(0);
            } else {
                // err = stderr.toString().trim();
                if (err) {
                    reject(err);
                    return;
                }

                // replace header
                let data = stripLine(stdout.toString(), 4);
                let columns = extractColumns(data, [1, 4], 5).find(column => {
                    let matches = String(column[0]).match(/:(\d+)$/);
                    if (matches && matches[1] === String(port)) {
                        return true;
                    }
                });

                if (columns && columns[1].length && parseInt(columns[1], 10) > 0) {
                    resolve(parseInt(columns[1], 10));
                } else {
                    resolve(0);
                }
            }
        });
    });
};

export function findPidByPort(port: number): Promise<number> {
    let platform = process.platform;
    switch (platform) {
        case "freebsd":
        case "sunos":
        case "darwin":
            return darwin(port);
        case "linux":
            return linux(port);
        case "win32":
            return win32(port);
        default:
            return new Promise((resolve) => { resolve(0); });
    }
}