# Safe Emit for Bloc

## Overview

Safe Emit for Bloc is a VSCode extension that automatically wraps `emit` calls in bloc state management with a `safeEmit` method. This extension helps prevent common issues related to emitting states in bloc patterns, ensuring more robust and predictable state management in your Flutter applications.

## Features

- Automatically detects `emit` calls in your bloc files
- Wraps detected `emit` calls with `safeEmit` method
- Supports single-line and multi-line `emit` statements
- Configurable through VSCode settings

![safe_emit_demo](https://github.com/user-attachments/assets/e7cbcfbf-d22d-4e31-bec1-db7476cfa0b2)




For example if there is an image subfolder under your extension project workspace:

1. Open VSCode
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Safe Emit for Bloc"
4. Click Install

## Usage

Once installed, the extension will automatically wrap any `emit` calls in your bloc files with `safeEmit`. For example:

Before:
```dart
emit(SomeState());
```
After:
```
safeEmit(() => emit(SomeState()));
```
The extension works on save, so simply save your file to see the changes applied.
## Configuration

You can configure the extension's behavior in your VSCode settings:

- safeEmit.enabled: Enable or disable the extension (default: true)
- safeEmit.fileTypes: Array of file extensions to apply the transformation (default: [".dart"])
- safeEmit.ignoredFolders: Array of folder names to ignore (default: ["test", "spec"])

## Requirements

- VSCode 1.60.0 or higher
- Dart and Flutter extensions for VSCode

## Known Issues

May conflict with other code formatting extensions. It's recommended to run this extension last in your formatting pipeline.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is released under the MIT License.

## Support
If you encounter any issues or have feature requests, please file them in the issues section on GitHub.