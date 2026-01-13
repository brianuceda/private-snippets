# Private Snippets by Brian Uceda

This extension allows you to use custom snippets specific to each project and programming language.

## Features

- Loads snippets from `.vscode/snippets/*.json` files
- Support for language-specific snippets (e.g., `java.json` will only work in Java files)
- Support for global snippets with `all.json`
- Dynamic snippet reloading when switching between files

## How to Use

1. Press `Ctrl+Shift+P` and search for `Add New Snippet`
2. Select a language from the dropdown or choose "Custom..." to specify a custom language
3. For global snippets that work in all languages, select "all" from the language options
4. Edit the generated snippet file according to your needs

The extension automatically creates the `.vscode/snippets/` folder and snippet files as needed.

## 📁 New Snippets Route

![New Snippets Route](https://github.com/brianuceda/private-snippets/blob/main/images/snippets-path.png?raw=true)

## 💡 Snippet Structure

Each snippet follows this structure:

```json
{
  "SnippetName": {
    "prefix": "trigger",
    "description": "Description of what this snippet does",
    "body": [
      "Your code snippet line 1",
      "Your code snippet line 2"
    ]
  }
}
```

### Attributes Explained

- **prefix**: The text you type to trigger the snippet (required)
- **description**: Description of the snippet shown in the completion item
- **body**: Array of code lines for the main snippet content (required)

## Commands

- `Add New Snippet`: Quickly add a new snippet for a specific language
- `Reload Private Snippets`: Manually reload custom snippets
