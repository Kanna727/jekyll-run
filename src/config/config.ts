import * as vscode from 'vscode';

export class Config{
    static get(extension = 'jekyll-run') {
        return vscode.workspace.getConfiguration().get(extension) as any;
    }
}