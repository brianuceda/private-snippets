# Private Snippets by Brian Uceda

This extension allows you to use custom snippets specific to each project and programming language.

## Features

- Loads snippets from `.vscode/snippets/*.json` files
- Support for language-specific snippets (e.g., `java.json` will only work in Java files)
- Support for global snippets with `all.json`
- Dynamic snippet reloading when switching between files

## How to Use

1. Create a `.vscode/snippets/` folder in the root of your project
2. Create JSON files for each language (for example, `javascript.json`, `python.json`)
3. For global snippets, use `all.json`

### Snippet Files Path

```
.
└── .vscode/
    └── snippets/
        ├── all.json
        ├── javascript.json
        ├── python.json
        └── ...
```

### Snippet File Format

```json
{
  "Test Private Snippets": {
    "prefix": "testps",
    "body": [
      "console.log('Test Private Snippets');"
    ],
    "description": "Private Snippet description"
  }
}
```

## Commands

- `Reload Private Snippets`: Manually reload custom snippets
