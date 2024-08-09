import * as vscode from 'vscode';

export async function findSafeEmitExtension(directory: string): Promise<string | null> {
    const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(directory, '**/cubit_extension.dart')
    );
    return files.length > 0 ? files[0].fsPath : null;
}