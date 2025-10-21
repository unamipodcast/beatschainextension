# BeatsChain Extension Zip Creation Rules
*Created: October 21, 2025 - 23:00*

## Package Structure
```
BeatsChain-[Description]-[YYYY-MM-DD-HH:MM].zip
├── BeatsChainExtension/
│   ├── manifest.json
│   ├── popup/
│   │   ├── index.html
│   │   ├── popup.js
│   │   ├── popup.css
│   │   ├── admin-styles.css
│   │   └── admin-dashboard-styles.css
│   ├── lib/
│   │   ├── auth.js
│   │   ├── phantom-detector.js
│   │   └── admin-dashboard.js
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
```

## Exclusion Rules
- **NO** markdown files (*.md) execept for the current readme.md
- **NO** development files (.gitignore, package.json, etc.)
- **NO** documentation folders
- **NO** temporary files

## Naming Convention
`BeatsChain-[Feature/Fix Description]-[YYYY-MM-DD-HH:MM].zip`

Examples:
- `BeatsChain-Admin-Dashboard-2025-01-21-14:30.zip`
- `BeatsChain-Campaign-Management-2025-01-21-15:45.zip`
- `BeatsChain-Authentication-Fix-2025-01-21-16:20.zip`

## Creation Command
```bash
cd /workspaces/chromextension/BeatsChainExtension
zip -r "../BeatsChain-[Description]-$(date +%Y-%m-%d-%H-%M).zip" . -x "*.md" "*.git*" "*node_modules*" "*package*.json"
```

## Critical Rules
- **MUST** zip from INSIDE BeatsChainExtension directory
- **MUST** use `-H-M` format (no colons) for Windows compatibility
- **MUST** have manifest.json at root level of zip
- **NEVER** include parent directory in zip structure

## Quality Checklist
- [ ] All core files included
- [ ] No markdown files
- [ ] Proper timestamp format
- [ ] Descriptive package name
- [ ] Extension loads without errors