const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// Create example snippet files if they don't exist
function createExampleSnippetFiles() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showWarningMessage('No workspace folder open. Cannot create example snippet files.');
    return;
  }

  const snippetsDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'snippets');
  
  // Create snippets directory if it doesn't exist
  if (!fs.existsSync(snippetsDir)) {
    try {
      fs.mkdirSync(snippetsDir, { recursive: true });
      vscode.window.showInformationMessage('Created snippets directory: ' + snippetsDir);
    } catch (error) {
      vscode.window.showErrorMessage(`Error creating snippets directory: ${error.message}`);
      return;
    }
  }

  // Create all.json with test snippet if it doesn't exist
  const allJsonPath = path.join(snippetsDir, 'all.json');
  if (!fs.existsSync(allJsonPath)) {
    const allSnippetsContent = `{
    "Test": {
      "prefix": "test",
      "body": [
        "console.log('Test');"
      ],
      "description": "Test"
    }
  }`;
    
    try {
      fs.writeFileSync(allJsonPath, allSnippetsContent);
      vscode.window.showInformationMessage('Created example all.json snippet file');
    } catch (error) {
      vscode.window.showErrorMessage(`Error creating all.json: ${error.message}`);
    }
  }

  // Create javascript.json if it doesn't exist (empty file)
  const jsJsonPath = path.join(snippetsDir, 'javascript.json');
  if (!fs.existsSync(jsJsonPath)) {
    try {
      fs.writeFileSync(jsJsonPath, '');
      vscode.window.showInformationMessage('Created empty javascript.json snippet file');
    } catch (error) {
      vscode.window.showErrorMessage(`Error creating javascript.json: ${error.message}`);
    }
  }
}

// Create a new snippet file or add to existing one
async function createOrUpdateSnippetFile(language) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open');
    return;
  }

  const snippetsDir = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'snippets');
  
  // Create snippets directory if it doesn't exist
  if (!fs.existsSync(snippetsDir)) {
    fs.mkdirSync(snippetsDir, { recursive: true });
  }

  const snippetFilePath = path.join(snippetsDir, `${language}.json`);
  let existingContent = {};
  let fileExists = false;

  // Check if file exists and read its content
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

  // Create example snippet based on language
  let exampleBody;
  if (language === 'python') {
    exampleBody = ["print('Test')"];
  } else if (language === 'html') {
    exampleBody = ["<div>Test</div>"];
  } else if (language === 'css') {
    exampleBody = [".test {", "  color: red;", "}"];
  } else if (language === 'java') {
    exampleBody = ["System.out.println(\"Test\");"];
  } else if (language === 'csharp') {
    exampleBody = ["Console.WriteLine(\"Test\");"];
  } else if (language === 'cpp') {
    exampleBody = ["std::cout << \"Test\" << std::endl;"];
  } else if (language === 'php') {
    exampleBody = ["echo \"Test\";"];
  } else if (language === 'ruby') {
    exampleBody = ["puts \"Test\""];
  } else if (language === 'go') {
    exampleBody = ["fmt.Println(\"Test\")"];
  } else if (language === 'rust') {
    exampleBody = ["println!(\"Test\");"];
  } else if (language === 'swift') {
    exampleBody = ["print(\"Test\")"];
  } else if (language === 'typescript') {
    exampleBody = ["console.log('Test');"];
  } else {
    exampleBody = ["console.log('Test');"];
  }

  const testSnippet = {
    "Test": {
      "prefix": "test",
      "body": exampleBody,
      "description": "Test"
    }
  };

  // Merge with existing content or use new content
  let newContent;
  if (fileExists && Object.keys(existingContent).length > 0) {
    newContent = { ...existingContent, ...testSnippet };
  } else {
    newContent = testSnippet;
  }

  // Write back to file
  try {
    fs.writeFileSync(snippetFilePath, JSON.stringify(newContent, null, 2));
    vscode.window.showInformationMessage(`Snippet added to ${language}.json`);
    
    // Open the snippet file in the editor
    const document = await vscode.workspace.openTextDocument(snippetFilePath);
    await vscode.window.showTextDocument(document);
  } catch (error) {
    vscode.window.showErrorMessage(`Error writing snippet file: ${error.message}`);
  }
}

// Get list of available language IDs
function getLanguageOptions() {
  // Common languages as quickpicks
  const commonLanguages = [
    { label: 'Custom...', description: 'Enter a custom language ID' },
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
  // Show language selection quickpick
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

function activate(context) {
  console.log('Extension Private Snippets is now active');
  
  let addSnippetDisposable = vscode.commands.registerCommand('private-snippets.addSnippet', addNewSnippet);
  context.subscriptions.push(addSnippetDisposable);

  createExampleSnippetFiles();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
