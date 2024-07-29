import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "Bloc Safe Emit" is activating...');

  const disposable = vscode.languages.registerCodeActionsProvider(
    "dart",
    new SafeEmitActionProvider(),
    {
      providedCodeActionKinds: [
        vscode.CodeActionKind.RefactorRewrite,
      ],
    }
  );

  context.subscriptions.push(disposable);
}

class SafeEmitActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] {
    console.log("provideCodeActions called");
    
    // Find the start and end of the statement
    let startLine = range.start.line;
    let endLine = range.end.line;
    
    // Find the start of the emit call
    while (startLine > 0 && !document.lineAt(startLine).text.trim().startsWith("emit(")) {
      startLine--;
    }
    
    // Find the end of the emit call (next semicolon)
    while (endLine < document.lineCount - 1 && !document.lineAt(endLine).text.includes(";")) {
      endLine++;
    }
    
    const startPos = new vscode.Position(startLine, 0);
    const endPos = new vscode.Position(endLine, document.lineAt(endLine).text.length);
    const fullRange = new vscode.Range(startPos, endPos);
    const fullText = document.getText(fullRange);
    
    if (fullText.trim().startsWith("emit(")) {
      const action = new vscode.CodeAction(
        "Wrap with safeEmit",
        vscode.CodeActionKind.RefactorRewrite
      );
      action.edit = new vscode.WorkspaceEdit();
      
      // Wrap the entire emit call with safeEmit
      const newText = `safeEmit(() {\n${fullText.trim()}\n});`;
      
      action.edit.replace(
        document.uri,
        fullRange,
        newText
      );
      return [action];
    }
    return [];
  }
}

export function deactivate() {}
