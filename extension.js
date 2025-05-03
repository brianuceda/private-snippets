const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Register snippets from JSON files in .vscode/snippets/
function registerSnippets(context) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  // Get current language
  const currentLanguage = editor.document.languageId;

  for (const folder of workspaceFolders) {
    const snippetsDir = path.join(folder.uri.fsPath, '.vscode', 'snippets');
    
    try {
      if (!fs.existsSync(snippetsDir)) {
        fs.mkdirSync(snippetsDir, { recursive: true });
        vscode.window.showInformationMessage(`Directorio de snippets creado: ${snippetsDir}`);
        continue;
      }

      // Read snippets directory
      const files = fs.readdirSync(snippetsDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(snippetsDir, file);
        const langId = file.replace('.json', '');

        // Check if this snippet file applies to the current language
        if (langId !== 'all' && langId !== currentLanguage) continue;

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const snippets = JSON.parse(content);
          
          // Register each snippet
          Object.keys(snippets).forEach(key => {
            const snippet = snippets[key];
            const completion = new vscode.CompletionItem(snippet.prefix);
            completion.insertText = new vscode.SnippetString(snippet.body.join('\n'));
            completion.documentation = new vscode.MarkdownString(snippet.description || '');
            
            context.subscriptions.push(
              vscode.languages.registerCompletionItemProvider(
                currentLanguage,
                {
                  provideCompletionItems() {
                    return [completion];
                  }
                }
              )
            );
          });
          
          vscode.window.showInformationMessage(`Snippets loaded from ${file}`);
        } catch (err) {
          vscode.window.showErrorMessage(`Error loading snippets from ${file}: ${err.message}`);
        }
      }
    } catch (err) {
      vscode.window.showErrorMessage(`Error accessing snippets directory: ${err.message}`);
    }
  }
}

// Activation function that runs when the extension is activated
function activate(context) {
  console.log('Extension Private Snippets is now active');

  // Register the reload command
  let disposable = vscode.commands.registerCommand('private-snippets.reload', () => {
    registerSnippets(context);
    vscode.window.showInformationMessage('Private Snippets recargados');
  });
  context.subscriptions.push(disposable);

  // Load snippets at startup
  registerSnippets(context);

  // Load snippets when changing document
  vscode.window.onDidChangeActiveTextEditor(() => {
    registerSnippets(context);
  }, null, context.subscriptions);
}


// unction that runs when the extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
