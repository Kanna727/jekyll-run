// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands, window, Terminal, StatusBarAlignment, StatusBarItem, workspace, WorkspaceFolder } from 'vscode';
import { existsSync } from 'fs';
import { lookpath } from 'lookpath';
import { Run } from './cmds/run';
import { Build } from './cmds/build';
import { Stop } from './cmds/stop';

let currWorkspace: WorkspaceFolder | undefined;
let pid: number = 0;
let isRunning = false;

let runButton: StatusBarItem | undefined;
let stopButton: StatusBarItem | undefined;
let restartButton: StatusBarItem | undefined;

interface IStatusBarItemAlignment {
    position: StatusBarAlignment;
    offset: number;
}

enum Icons {
    Start = " $(debug-start) ",
    Stop = "$(debug-stop)",
    Restart = "$(debug-restart)"
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
                if (existsSync(currWorkspace.uri.fsPath + '/_config.yml')) {
                    return true;
                }
            }
        }
    } else {
        currWorkspace = workspace.workspaceFolders[0];
        if (currWorkspace) {
            if (existsSync(currWorkspace.uri.fsPath + '/_config.yml')) {
                return true;
            }
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

function updateStatusBarItemsWhileRunning() {
    if (runButton) {
        runButton.hide();
        runButton.dispose();
        initStopButton();
        initRestartButton();
    }
}

function revertStatusBarItems() {
    if(stopButton && restartButton) {
        stopButton.hide();
        stopButton.dispose();
        restartButton.hide();
        restartButton.dispose();
    }

    initRunButton();
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    const run = commands.registerCommand('jekyll-run.Run', async () => {
        if (isStaticWebsiteWorkspace() && currWorkspace) {
            if (await lookpath('jekyll')) {
                if (await lookpath('bundle')) {
                    isRunning = true;
                    commands.executeCommand('setContext', 'isRunning', true);
                    updateStatusBarItemsWhileRunning();
                    const run = new Run();
                    run.run(currWorkspace.uri.fsPath).
                        catch((error) => {
                            console.error(error);
                            isRunning = false;
                            commands.executeCommand('setContext', 'isRunning', false);
                            revertStatusBarItems();
                        }).
                        finally(() => pid = run.pid);
                } else {
                    window.showErrorMessage('Bundler not installed');
                }
            } else {
                window.showErrorMessage('Jekyll not installed');
            }
        } else {
            if (currWorkspace) {
                window.showInformationMessage('The workspace/folder: ' + currWorkspace.name + ' is not Jekyll compatible');
            } else {
                window.showErrorMessage('No active workspace/folder');
            }
        }
    });

    const build = commands.registerCommand('jekyll-run.Build', async () => {
        if (isStaticWebsiteWorkspace() && currWorkspace) {
            if (await lookpath('jekyll')) {
                if (await lookpath('bundle')) {
                    const build = new Build();
                    build.build(currWorkspace.uri.fsPath).catch((error) => console.error(error));
                } else {
                    window.showErrorMessage('Bundler not installed');
                }
            } else {
                window.showErrorMessage('Jekyll not installed');
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
        if (isStaticWebsiteWorkspace() && currWorkspace && isRunning) {
            const stop = new Stop();
            stop.Stop(pid).then(() => {
                isRunning = false;
                commands.executeCommand('setContext', 'isRunning', false);
                revertStatusBarItems();
            });
        } else {
            window.showErrorMessage('No instance of Jekyll is running');
        }
    });

    const restart = commands.registerCommand('jekyll-run.Restart', async () => {
        if (isStaticWebsiteWorkspace() && currWorkspace && isRunning) {
            const stop = new Stop();
            stop.Stop(pid);

            const run = new Run();
            run.run(currWorkspace.uri.fsPath).
                then(() => { }).
                catch((error) => {
                    console.error(error);
                    isRunning = false;
                    commands.executeCommand('setContext', 'isRunning', false);
                    revertStatusBarItems();
                }).
                finally(() => pid = run.pid);
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
export function deactivate() { }