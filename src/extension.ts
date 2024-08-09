import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {wrapEmitsInFile} from './methods/wrap-emits-in-file.js';
import {findSafeEmitExtension} from './methods/find-safe-emit-extension.js';


let originalContents: Map<string, string> = new Map();

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.detectAndWrapEmitMethods', async () => {
        await detectAndWrapEmitMethods();
    });

    context.subscriptions.push(disposable);
}



async function promptForTargetDirectory(): Promise<string | undefined> {
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: "Select a folder to detect and wrap emit methods",
        canSelectFolders: true,
    };

    const result = await vscode.window.showOpenDialog(options);
    return result && result[0] ? result[0].fsPath : undefined;
}



function showSummary(changedFiles: string[]) {
    const message = changedFiles.length > 0
        ? `Changed ${changedFiles.length} files. Would you like to see the list?`
        : 'No changes were made.';

    vscode.window.showInformationMessage(message, 'Show Changes', 'Revert Changes').then(selection => {
        if (selection === 'Show Changes') {
            vscode.workspace.openTextDocument({
                content: changedFiles.join('\n'),
                language: 'plaintext'
            }).then(doc => vscode.window.showTextDocument(doc));
        } else if (selection === 'Revert Changes') {
            revertChanges(changedFiles);
        }
    });
}

function revertChanges(changedFiles: string[]) {
    for (const file of changedFiles) {
        const originalContent = originalContents.get(file);
        if (originalContent) {
            fs.writeFileSync(file, originalContent, 'utf8');
        }
    }
    vscode.window.showInformationMessage('All changes have been reverted.');
}

export function deactivate() {}


async function detectAndWrapEmitMethods() {
    const targetDirectory = await promptForTargetDirectory();
    if (!targetDirectory) {
        vscode.window.showErrorMessage("Please select a valid directory");
        return;
    }

    const dartFiles = await findDartFiles(targetDirectory);
    await showDartFilesList(dartFiles);

    const safeEmitExtensionPath = await findAndConfirmSafeEmitExtension(targetDirectory, dartFiles);
    if (!safeEmitExtensionPath) {
        return; // User cancelled the operation
    }

    const changedFiles: string[] = [];

    for (const file of dartFiles) {
        const fileContent = fs.readFileSync(file, 'utf8');
        const updatedContent = wrapEmitsInFile(fileContent, safeEmitExtensionPath, file);

        if (updatedContent !== fileContent) {
            fs.writeFileSync(file, updatedContent, 'utf8');
            changedFiles.push(file);
        }
    }

    showSummary(changedFiles);
}

async function findDartFiles(directory: string): Promise<string[]> {
    const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(directory, '**/*.dart'),
        '**/.*'
    );
    return files.map(file => file.fsPath);
}

async function showDartFilesList(files: string[]) {
    const filesList = files.join('\n');
    const document = await vscode.workspace.openTextDocument({
        content: `Dart files found:\n\n${filesList}`,
        language: 'plaintext'
    });
    await vscode.window.showTextDocument(document);
}

async function findAndConfirmSafeEmitExtension(directory: string, dartFiles: string[]): Promise<string | null> {
    for (const file of dartFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('extension CubitExtension<T> on Cubit<T>') &&
            content.includes('void safeEmit(void Function() callBack)')) {
            const useExisting = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Found existing Cubit extension in ${file}. Use this?`
            });
            if (useExisting === 'Yes') {
                return file;
            }
            break;
        }
    }

    const createNew = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'No existing Cubit extension found. Create a new one?'
    });

    if (createNew === 'Yes') {
        return await createSafeEmitExtension(directory);
    }

    return null;
}

async function createSafeEmitExtension(directory: string): Promise<string> {
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: "Select a location for the new Cubit extension file",
        canSelectFolders: true,
        defaultUri: vscode.Uri.file(path.join(directory, 'lib', 'extensions'))
    };

    const result = await vscode.window.showOpenDialog(options);
    if (!result || result.length === 0) {
        vscode.window.showErrorMessage("No location selected for the Cubit extension file.");
        return '';
    }

    const extensionsDir = result[0].fsPath;
    const filePath = path.join(extensionsDir, 'cubit_extension.dart');
    const content = `
import 'package:bloc/bloc.dart';

extension CubitExtension<T> on Cubit<T> {
  void safeEmit(void Function() callBack) {
    if (!isClosed) {
      callBack();
    }
  }
}
`;

    fs.writeFileSync(filePath, content, 'utf8');
    vscode.window.showInformationMessage(`Created Cubit extension file at: ${filePath}`);
    return filePath;
}