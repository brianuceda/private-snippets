const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Create snippets directory if it doesn't exist
function createSnippetsDirectory() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showWarningMessage('No workspace folder open. Cannot create snippets directory.');
    return;
  }

  const snippetsDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'snippets');
  
  if (!fs.existsSync(snippetsDir)) {
    try {
      fs.mkdirSync(snippetsDir, { recursive: true });
      vscode.window.showInformationMessage('Created snippets directory: ' + snippetsDir);
    } catch (error) {
      vscode.window.showErrorMessage(`Error creating snippets directory: ${error.message}`);
    }
  }
  
  return snippetsDir;
}

// Register snippets from JSON files in .vscode/snippets/
function registerSnippets(context) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  const currentLanguage = editor.document.languageId;

  for (const subscription of context.subscriptions) {
    if (subscription.dispose && subscription._isSnippetProvider) {
      subscription.dispose();
    }
  }

  for (const folder of workspaceFolders) {
    const snippetsDir = path.join(folder.uri.fsPath, '.vscode', 'snippets');
    
    try {
      if (!fs.existsSync(snippetsDir)) {
        fs.mkdirSync(snippetsDir, { recursive: true });
        vscode.window.showInformationMessage(`Directorio de snippets creado: ${snippetsDir}`);
        continue;
      }

      const files = fs.readdirSync(snippetsDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(snippetsDir, file);
        const langId = file.replace('.json', '');

        if (langId !== 'all' && langId !== currentLanguage) continue;

        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          if (!content.trim()) continue;
          
          const snippets = JSON.parse(content);
          
          // Create a completion provider for all snippets in this file
          const provider = {
            provideCompletionItems(document, position) {
              const linePrefix = document.lineAt(position).text.substr(0, position.character);
              const completionItems = [];

              Object.keys(snippets).forEach(key => {
                const snippet = snippets[key];
                const prefix = snippet.prefix;
                
                // Only add if the prefix matches what is being written
                if (linePrefix.endsWith(prefix) || prefix.startsWith(linePrefix.trim())) {
                  const item = new vscode.CompletionItem(prefix);
                  
                  // Create snippet string from body
                  if (snippet.body && Array.isArray(snippet.body)) {
                    item.insertText = new vscode.SnippetString(snippet.body.join('\n'));
                  }
                  
                  item.documentation = new vscode.MarkdownString(snippet.description || '');
                  item.kind = vscode.CompletionItemKind.Snippet;
                  item.detail = key;
                  completionItems.push(item);
                }
              });
              
              return completionItems;
            }
          };
          
          // Register for all characters, not just the exact prefix
          const subscription = vscode.languages.registerCompletionItemProvider(
            { language: currentLanguage },
            provider,
            ...'.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('')
          );
          
          subscription._isSnippetProvider = true;
          context.subscriptions.push(subscription);
        } catch (err) {
          vscode.window.showErrorMessage(`Error loading snippets from ${file}: ${err.message}`);
        }
      }
    } catch (err) {
      vscode.window.showErrorMessage(`Error accessing snippets directory: ${err.message}`);
    }
  }
}

// Create a new snippet file or add to an existing one
async function createOrUpdateSnippetFile(language) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const snippetsDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'snippets');
  
  if (!fs.existsSync(snippetsDir)) {
    fs.mkdirSync(snippetsDir, { recursive: true });
  }

  const snippetFilePath = path.join(snippetsDir, `${language}.json`);
  let existingContent = {};
  let fileExists = false;

  if (fs.existsSync(snippetFilePath)) {
    fileExists = true;
    try {
      const content = fs.readFileSync(snippetFilePath, 'utf-8');
      if (content.trim()) {
        existingContent = JSON.parse(content);
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error reading snippet file: ${error.message}`);
      return;
    }
  }

  let exampleBody = [];

  switch (language) {
    case 'python':
      exampleBody = ["print('Test')"];
      break;
    case 'html':
      exampleBody = ["<div></div>"];
      break;
    case 'css':
      exampleBody = [".test {", "  color: red;", "}"];
      break;
    case 'java':
      exampleBody = ["System.out.println(\"Test\");"];
      break;
    case 'csharp':
      exampleBody = ["Console.WriteLine(\"Test\");"];
      break;
    case 'cpp':
      exampleBody = ["std::cout << \"Test\" << std::endl;"];
      break;
    case 'php':
      exampleBody = ["echo \"Test\";"];
      break;
    case 'ruby':
      exampleBody = ["puts \"Test\""];
      break;
    case 'go':
      exampleBody = ["fmt.Println(\"Test\")"];
      break;
    case 'rust':
      exampleBody = ["println!(\"Test\");"];
      break;
    case 'typescript':
      exampleBody = ["console.log('Test');"];
      break;
    default:
      exampleBody = ["console.log('Test');"];
      break;
  }

  const testSnippet = {
    "Test": {
      "prefix": "test",
      "description": "Test",
      "body": exampleBody
    }
  };

  let newContent;
  if (fileExists && Object.keys(existingContent).length > 0) {
    newContent = { ...existingContent, ...testSnippet };
  } else {
    newContent = testSnippet;
  }

  try {
    fs.writeFileSync(snippetFilePath, JSON.stringify(newContent, null, 2));
    vscode.window.showInformationMessage(`Snippet added to ${language}.json`);
    
    const document = await vscode.workspace.openTextDocument(snippetFilePath);
    await vscode.window.showTextDocument(document);
  } catch (error) {
    vscode.window.showErrorMessage(`Error writing snippet file: ${error.message}`);
  }
}

// Get list of available languages
function getLanguageOptions() {
  const commonLanguages = [
    { label: 'Custom...', description: 'Enter a custom language ID' },
    { label: 'all', description: 'Global snippets for all languages' },
    { label: 'javascript', description: 'JavaScript' },
    { label: 'typescript', description: 'TypeScript' },
    { label: 'python', description: 'Python' },
    { label: 'html', description: 'HTML' },
    { label: 'css', description: 'CSS' },
    { label: 'java', description: 'Java' },
    { label: 'csharp', description: 'C#' },
    { label: 'cpp', description: 'C++' },
    { label: 'php', description: 'PHP' },
    { label: 'ruby', description: 'Ruby' },
    { label: 'go', description: 'Go' }
  ];
  
  return commonLanguages;
}

// Command to add a new snippet
async function addNewSnippet() {
  const languageOptions = getLanguageOptions();
  
  const selectedLanguage = await vscode.window.showQuickPick(languageOptions, {
    placeHolder: 'Select a language for the snippet file'
  });
  
  if (!selectedLanguage) return;
  
  let languageId;
  
  if (selectedLanguage.label === 'Custom...') {
    languageId = await vscode.window.showInputBox({
      placeHolder: 'Enter language ID (e.g. javascript, python, etc.)'
    });
    
    if (!languageId) return;
  } else {
    languageId = selectedLanguage.label;
  }
  
  await createOrUpdateSnippetFile(languageId);
}

// Configure file watcher for snippets directory
function setupFileWatcher(context) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;
  
  const snippetsDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'snippets');
  
  if (!fs.existsSync(snippetsDir)) {
    fs.mkdirSync(snippetsDir, { recursive: true });
  }
  
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(workspaceFolders[0], '.vscode/snippets/**/*.json')
  );
  
  watcher.onDidChange(() => {
    registerSnippets(context);
    vscode.window.showInformationMessage('Snippets reloaded due to file changes');
  });
  
  watcher.onDidCreate(() => {
    registerSnippets(context);
    vscode.window.showInformationMessage('New snippet file detected, snippets reloaded');
  });
  
  watcher.onDidDelete(() => {
    registerSnippets(context);
    vscode.window.showInformationMessage('Snippet file deleted, snippets reloaded');
  });
  
  context.subscriptions.push(watcher);
}

// Activate the extension
function activate(context) {
  console.log('Extension Private Snippets is now active');
  
  createSnippetsDirectory();
  
  let reloadDisposable = vscode.commands.registerCommand('private-snippets.reload', () => {
    registerSnippets(context);
    vscode.window.showInformationMessage('Private Snippets recargados');
  });
  context.subscriptions.push(reloadDisposable);
    
  let addSnippetDisposable = vscode.commands.registerCommand('private-snippets.addSnippet', addNewSnippet);
  context.subscriptions.push(addSnippetDisposable);

  registerSnippets(context);

  setupFileWatcher(context);
  
  vscode.window.onDidChangeActiveTextEditor(() => {
    registerSnippets(context);
  }, null, context.subscriptions);
}

// Deactivate the extension
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
