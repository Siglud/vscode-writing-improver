// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AzureOpenAIPolishService } from './core/AzurePolishService';
import { OpenAiPolishService } from './core/OpenAIPolishService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('writing-improver is now active!')

    let rightClick = vscode.commands.registerCommand('writing-improver.showContextMenu', () => {

        const editor = vscode.window.activeTextEditor
        if (!editor) {
            return
        }

        const selection = editor.selection
        if (!selection || selection.isEmpty) {
            return
        }

        const range = new vscode.Range(selection.start, selection.end)
        const text = editor.document.getText(range)

        const settingType = vscode.workspace.getConfiguration('writing-improver').get('APIType')


        const key = vscode.workspace.getConfiguration('writing-improver').get('APIKey') as string
        const url = vscode.workspace.getConfiguration('writing-improver').get('API') as string
        const systemPrompt = vscode.workspace.getConfiguration('writing-improver').get('systemPrompt') as string
        const userPrompt = vscode.workspace.getConfiguration('writing-improver').get('systemPrompt') as string
        const model = vscode.workspace.getConfiguration('writing-improver').get('model') as string

        const service = settingType === 'Azure' ?
            new AzureOpenAIPolishService(key, url, systemPrompt, userPrompt)
            : new OpenAiPolishService(model, key, url, systemPrompt, userPrompt);

        service.polish(text).then((result) => {
            editor.edit((editBuilder) => {
                if (!result) {
                    return
                }
                editBuilder.replace(range, result)
                console.log('replaced text ${text} with ${result}')
            })
        })

        // vscode.window.showInformationMessage(`Selected text: ${text}`)
    })

    context.subscriptions.push(rightClick)
}

// This method is called when your extension is deactivated
export function deactivate() {
}
