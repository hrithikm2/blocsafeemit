import * as path from 'path';
import * as vscode from 'vscode';


export function wrapEmitsInFile(content: string, safeEmitPath: string, currentFilePath: string): string {
    const lines = content.split('\n');
    let modified = false;
    let importAdded = false;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('emit(') && !lines[i].includes('safeEmit')) {
            lines[i] = lines[i].replace(/emit\((.*)\)/, 'safeEmit(() => emit($1))');
            modified = true;
        }
    }

    if (modified) {
        if (!content.includes("import 'package:bloc/bloc.dart';")) {
            lines.unshift("import 'package:bloc/bloc.dart';");
            importAdded = true;
        }

        if (!content.includes('CubitExtension')) {
            const relativePath = path.relative(path.dirname(currentFilePath), safeEmitPath)
                .replace(/\\/g, '/'); // Replace backslashes with forward slashes for Dart imports
            const importStatement = relativePath.startsWith('.') 
                ? `import '${relativePath}';`
                : `import 'package:${vscode.workspace.name}/${relativePath}';`;
            lines.unshift(importStatement);
            importAdded = true;
        }
    }

    return lines.join('\n');
}

