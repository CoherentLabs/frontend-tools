import * as vscode from "vscode";

class Logger {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel("Gameface UI Extension");
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.showErrorMessage = this.showErrorMessage.bind(this);
        this.showInformationMessage = this.showInformationMessage.bind(this);
    }

    log(message: any) {
        this.outputChannel.appendLine(message as string);
    }

    error(message: string) {
        this.outputChannel.appendLine(`Error: ${message}`);
    }
    showErrorMessage(message: string) {
        this.outputChannel.appendLine(`Error outputted: ${message}`);
        vscode.window.showErrorMessage(message);
    }
    showInformationMessage(message: string) {
        this.outputChannel.appendLine(`Info: ${message}`);
        vscode.window.showInformationMessage(message);
    }
}

export default new Logger();