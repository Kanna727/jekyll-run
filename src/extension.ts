// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands, window, StatusBarAlignment, StatusBarItem, workspace, WorkspaceFolder } from 'vscode';
import { existsSync } from 'fs';
import { lookpath } from './utils/look-path';
import { Run } from './cmds/run';
import { Build } from './cmds/build';
import { Stop } from './cmds/stop';
import { openUrl } from './utils/open-in-browser';
import path = require('path');
import { Install } from './cmds/install';
import { findProcessOnPort } from './utils/process-on-port';
import { Config } from './config/config';

let currWorkspace: WorkspaceFolder | undefined;
let pid: number = 0;
let address: string = '';
let isRunning = false;
let portInConfig = 4000;
let portInArgs : number;
let serverPort : number;
let baseurlInConfig : string = '/';
let baseurlInArgs : string;
let serverBaseurl: string;

let runButton: StatusBarItem | undefined;
let stopButton: StatusBarItem | undefined;
let restartButton: StatusBarItem | undefined;
let openInBrowserButton: StatusBarItem | undefined;
let outputChannel = window.createOutputChannel(`Jekyll Run`);

interface IStatusBarItemAlignment {
    position: StatusBarAlignment;
    offset: number;
}

enum Icons {
    Start = " $(debug-start) ",
    Stop = "$(debug-stop)",
    Restart = "$(debug-restart)"
}

function getConfigFromArgs() {
    const config = Config.get();
    const args = config.commandLineArguments.toString();
    const m_port = args.match(/\B(-P|--port)\s(\d+)\b/);
    const m_baseurl = args.match(/\B(-b|--baseurl)\s(\S+)\b/);
    if (m_port) {
        portInArgs = parseInt(m_port[2]);
    };
    if (m_baseurl) {
        baseurlInArgs = m_baseurl[2];
    };
    return { 
        port: m_port ? true : false,
        baseurl: m_baseurl ? true : false
    };
}

function checkConfigAndGetPort(currWorkspace: WorkspaceFolder): boolean {
    const configPath = path.join(currWorkspace.uri.fsPath, '_config.yml');
    if (existsSync(configPath)) {
        var read = require('read-yaml');
        var config = read.sync(configPath);

        console.log(config);
        if (config.port !== undefined) { portInConfig = config.port; }
        if (config.baseurl !== undefined) { baseurlInConfig = config.baseurl; }

        const configInArgs = getConfigFromArgs();
        serverPort = configInArgs.port? portInArgs : portInConfig;
        serverBaseurl = configInArgs.baseurl? baseurlInArgs : baseurlInConfig;
        return true;
    }
    return false;
}

function isStaticWebsiteWorkspace(): boolean {
    const editor = window.activeTextEditor;

    // If no workspace is opened or just a single folder, we return without any status label
    // because our extension only works when more than one folder is opened in a workspace.
    if (!workspace.workspaceFolders) {
        return false;
    }

    if (editor) {
        // If we have a file:// resource we resolve the WorkspaceFolder this file is from and update
        // the status accordingly.
        const resource = editor.document.uri;
        if (resource.scheme === 'file') {
            currWorkspace = workspace.getWorkspaceFolder(resource);
            if (currWorkspace) {
                return checkConfigAndGetPort(currWorkspace);
            }
        }
    } else {
        currWorkspace = workspace.workspaceFolders[0];
        if (currWorkspace) {
            return checkConfigAndGetPort(currWorkspace);
        }
    }
    return false;
}

const buildButton = (alignment: IStatusBarItemAlignment, iconName: string, text: string = "", command: string, tooltip: string) => {
    const button: StatusBarItem = window.createStatusBarItem(alignment.position, alignment.offset);
    button.text = iconName + text;
    button.command = command;
    button.tooltip = tooltip;
    return button;
};

function initStopButton() {
    const stopButtonAlignment: IStatusBarItemAlignment = {
        position: StatusBarAlignment.Left,
        offset: 498
    };

    const stopButtonText: string = "Jekyll Stop";

    stopButton =
        buildButton(stopButtonAlignment, Icons.Stop, "", "jekyll-run.Stop", stopButtonText);

    stopButton.show();
}

function initRestartButton() {
    const restartButtonAlignment: IStatusBarItemAlignment = {
        position: StatusBarAlignment.Left,
        offset: 499
    };

    const restartButtonText: string = "Jekyll Restart";

    restartButton =
        buildButton(restartButtonAlignment, Icons.Restart, "", "jekyll-run.Restart", restartButtonText);

    restartButton.show();
}

function initRunButton() {
    const runButtonAlignment: IStatusBarItemAlignment = {
        position: StatusBarAlignment.Left,
        offset: 500
    };

    const runText: string = "Jekyll Run";

    runButton =
        buildButton(runButtonAlignment, Icons.Start, "Jekyll Run", "jekyll-run.Run", runText);

    runButton.show();
}

function initOpenInBrowserButton() {
    const openInBrowserButtonAlignment: IStatusBarItemAlignment = {
        position: StatusBarAlignment.Left,
        offset: 500
    };

    const text: string = "Jekyll Open in Browser";

    openInBrowserButton =
        buildButton(openInBrowserButtonAlignment, "", "Jekyll Open in Browser", "jekyll-run.Open", text);

    openInBrowserButton.show();
}

function updateStatusBarItemsWhileRunning() {
    if (runButton) {
        //runButton.hide();
        runButton.dispose();
        initStopButton();
        initRestartButton();
        initOpenInBrowserButton();
    }
}

function revertStatusBarItems() {
    if (stopButton && restartButton && openInBrowserButton) {
        stopButton.hide();
        stopButton.dispose();
        restartButton.hide();
        restartButton.dispose();
        openInBrowserButton.hide();
        openInBrowserButton.dispose();
    }

    initRunButton();
}

function runBundleInstall(currWorkspace: WorkspaceFolder) {
    runButton?.hide();
    commands.executeCommand('setContext', 'isBuilding', true);
    const install = new Install();
    install.Install(currWorkspace.uri.fsPath, outputChannel).
        then(() => {
            commands.executeCommand('jekyll-run.Run');
        }, (error) => {
            console.error(error);
        }).
        catch((error) => {
            console.error(error);
        });
    runButton?.show();
    commands.executeCommand('setContext', 'isBuilding', false);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    const open = commands.registerCommand('jekyll-run.Open', async () => {
        if (isStaticWebsiteWorkspace() && currWorkspace && isRunning) {
            openUrl(address);
        } else {
            window.showErrorMessage('No instance of Jekyll is running');
        }
    });

    const run = commands.registerCommand('jekyll-run.Run', async () => {
        if (isStaticWebsiteWorkspace() && currWorkspace) {
            outputChannel.appendLine('Starting Server...');
            outputChannel.show(true);
            commands.executeCommand('setContext', 'isBuilding', true);
            runButton?.hide();
            outputChannel.appendLine('Checking if server is already running...');
            outputChannel.show(true);
            var processOnPort = await findProcessOnPort(serverPort);
            if (processOnPort.pid !== 0) {
                isRunning = true;
            }
            if (!isRunning) {
                if (!(await lookpath("jekyll"))?.startsWith('/mnt')) {
                    if (!(await lookpath("bundle"))?.startsWith('/mnt')) {
                        const run = new Run();
                        outputChannel.appendLine('Jekyll Building...');
                        outputChannel.show(true);
                        run.run(currWorkspace.uri.fsPath, serverPort, serverBaseurl, outputChannel).
                            then((status) => {
                                isRunning = true;
                                commands.executeCommand('setContext', 'isRunning', true);
                                if (status) {
                                    updateStatusBarItemsWhileRunning();
                                    outputChannel.appendLine('Your site is live on port: ' + serverPort);
                                    outputChannel.show(true);
                                }
                                else {
                                    isRunning = false;
                                    commands.executeCommand('setContext', 'isRunning', false);
                                    commands.executeCommand('setContext', 'isBuilding', false);
                                    revertStatusBarItems();
                                }
                            }, (error) => {
                                    console.error(error);
                                    if (error !== undefined && error !== '') {
                                        var strString = error.toString().split('\n')[0];
                                        window.showErrorMessage(strString, 'Run bundle install')
                                            .then(selection => {
                                                if (selection !== undefined && currWorkspace) {
                                                    runBundleInstall(currWorkspace);
                                                }
                                            });
                                    }
                                    revertStatusBarItems();    
                            }).
                            catch((error) => {
                                console.error(error);
                                if (error !== undefined && error !== '') {
                                    var strString = error.toString().split('\n')[0];
                                    window.showErrorMessage(strString, 'Run bundle install')
                                        .then(selection => {
                                            if (selection !== undefined && currWorkspace) {
                                                runBundleInstall(currWorkspace);
                                            }
                                        });
                                }
                                revertStatusBarItems();
                            }).
                            finally(() => {
                                pid = run.pid;
                                address = run.address;
                                commands.executeCommand('setContext', 'isBuilding', false);
                            });
                    } else {
                        commands.executeCommand('setContext', 'isBuilding', false);
                        runButton?.show();
                        window.showErrorMessage('Bundler not installed', 'Install Jekyll')
                            .then(selection => {
                                if (selection !== undefined) {
                                    openUrl('https://jekyllrb.com/docs/installation/');
                                }
                            });
                    }
                } else {
                    commands.executeCommand('setContext', 'isBuilding', false);
                    runButton?.show();
                    window.showErrorMessage('Jekyll not installed', 'Install Jekyll')
                        .then(selection => {
                            if (selection !== undefined) {
                                openUrl('https://jekyllrb.com/docs/installation/');
                            }
                        });
                }
            } else {
                if (processOnPort.name.includes('ruby')) {
                    pid = processOnPort.pid;
                    outputChannel.appendLine('Server is already running. Opening your site...');
                    outputChannel.show(true);
                    openUrl(address);
                    isRunning = true;
                    commands.executeCommand('setContext', 'isRunning', true);
                    commands.executeCommand('setContext', 'isBuilding', false);
                    updateStatusBarItemsWhileRunning();
                }
                else {
                    commands.executeCommand('setContext', 'isBuilding', false);
                    runButton?.show();
                    window.showErrorMessage('Port ' + serverPort + ' is already occupied by process: ' + processOnPort.pid + ' Either kill that process or use another port in _config.yml');
                }
            }
        } else {
            if (currWorkspace) {
                window.showInformationMessage('Either the workspace/folder: ' + currWorkspace.name + ' is not Jekyll compatible or the opened file is not part of the Jekyll folder');
            } else {
                window.showErrorMessage('No active workspace/folder');
            }
        }
    });

    const build = commands.registerCommand('jekyll-run.Build', async () => {
        if (isStaticWebsiteWorkspace() && currWorkspace) {
            if (!(await lookpath("jekyll"))?.startsWith('/mnt')) {
                if (!(await lookpath("bundle"))?.startsWith('/mnt')) {
                    commands.executeCommand('setContext', 'isBuilding', true);
                    runButton?.hide();
                    const build = new Build();
                    build.build(currWorkspace.uri.fsPath, outputChannel).
                        catch((error) => {
                            console.error(error);
                            if (error !== undefined) {
                                var strString = error.toString().split('\n')[0];
                                window.showErrorMessage(strString, 'Run bundle install')
                                    .then(selection => {
                                        if (selection !== undefined && currWorkspace) {
                                            runBundleInstall(currWorkspace);
                                        }
                                    });
                            }
                            revertStatusBarItems();
                        }).
                        finally(() => {
                            commands.executeCommand('setContext', 'isBuilding', false);
                            runButton?.show();
                        });
                } else {
                    commands.executeCommand('setContext', 'isBuilding', false);
                    runButton?.show();
                    window.showErrorMessage('Bundler not installed', 'Install Jekyll')
                        .then(selection => {
                            if (selection !== undefined) {
                                openUrl('https://jekyllrb.com/docs/installation/');
                            }
                        });
                }
            } else {
                commands.executeCommand('setContext', 'isBuilding', false);
                runButton?.show();
                window.showErrorMessage('Jekyll not installed', 'Install Jekyll')
                    .then(selection => {
                        if (selection !== undefined) {
                            openUrl('https://jekyllrb.com/docs/installation/');
                        }
                    });
            }
        } else {
            if (currWorkspace) {
                window.showInformationMessage('The workspace/folder: ' + currWorkspace.name + ' is not Jekyll compatible');
            } else {
                window.showErrorMessage('No active workspace/folder');
            }
        }
    });

    const stop = commands.registerCommand('jekyll-run.Stop', async () => {
        if (currWorkspace && isRunning) {
            const stop = new Stop();
            stop.Stop(pid, outputChannel).then(() => {
                isRunning = false;
                commands.executeCommand('setContext', 'isRunning', false);
                commands.executeCommand('setContext', 'isBuilding', false);
                revertStatusBarItems();
            });
        } else {
            window.showErrorMessage('No instance of Jekyll is running');
        }
    });

    const restart = commands.registerCommand('jekyll-run.Restart', async () => {
        if (currWorkspace && isRunning) {
            const stop = new Stop();
            stop.Stop(pid, outputChannel);
            //runButton?.hide();
            stopButton?.hide();
            stopButton?.dispose();
            restartButton?.hide();
            restartButton?.dispose();
            openInBrowserButton?.hide();
            openInBrowserButton?.dispose();
            commands.executeCommand('setContext', 'isBuilding', true);
            const run = new Run();
            run.run(currWorkspace.uri.fsPath, serverPort, serverBaseurl, outputChannel).
                then(() => {
                    isRunning = true;
                    commands.executeCommand('setContext', 'isRunning', true);
                    updateStatusBarItemsWhileRunning();
                }, (error) => {
                    console.error(error);
                    if (error !== undefined) {
                        var strString = error.toString().split('\n')[0];
                        window.showErrorMessage(strString, 'Run bundle install')
                            .then(selection => {
                                if (selection !== undefined && currWorkspace) {
                                    runBundleInstall(currWorkspace);
                                }
                            });
                    }
                    revertStatusBarItems();
                }).
                catch((error) => {
                    console.error(error);
                    if (error !== undefined) {
                        var strString = error.toString().split('\n')[0];
                        window.showErrorMessage(strString, 'Run bundle install')
                            .then(selection => {
                                if (selection !== undefined && currWorkspace) {
                                    runBundleInstall(currWorkspace);
                                }
                            });
                    }
                    revertStatusBarItems();
                }).
                finally(() => {
                    pid = run.pid;
                    address = run.address;
                    commands.executeCommand('setContext', 'isBuilding', false);
                });
        } else {
            window.showErrorMessage('No instance of Jekyll is running');
        }
    });

    if (isRunning) {
        updateStatusBarItemsWhileRunning();
    }
    else {
        initRunButton();
    }

    context.subscriptions.push(run);
    context.subscriptions.push(build);
    context.subscriptions.push(stop);
    context.subscriptions.push(restart);

    commands.executeCommand('setContext', 'jekyll-run', true);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log("Exit VSCode. Stopping: " + pid);
    if (currWorkspace && isRunning) {
        const stop = new Stop();
        stop.Stop(pid, outputChannel).then(() => {
            isRunning = false;
            commands.executeCommand('setContext', 'isRunning', false);
            commands.executeCommand('setContext', 'isBuilding', false);
            revertStatusBarItems();
        });
    } else {
        window.showErrorMessage('No instance of Jekyll is running');
    }
}
