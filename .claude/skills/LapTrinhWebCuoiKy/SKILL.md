```markdown
# LapTrinhWebCuoiKy Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the development patterns, coding conventions, and common workflows found in the `LapTrinhWebCuoiKy` repository. The project is a JavaScript-based web application with no detected framework, focusing on multi-page HTML structure and shared CSS styling. The repository emphasizes consistent UI updates and coordinated site-wide bugfixes across HTML, CSS, and JavaScript files.

## Coding Conventions

### File Naming
- **CamelCase** is used for file names.
  - Example: `mainPage.html`, `userProfile.js`

### Import Style
- **Relative imports** are used for JavaScript modules.
  ```javascript
  import { fetchData } from './utils.js';
  ```

### Export Style
- **Named exports** are preferred.
  ```javascript
  // utils.js
  export function fetchData() { ... }
  export const API_URL = '...';
  ```

### Commit Patterns
- Commit messages are freeform, often short (average ~17 characters), and may or may not use prefixes.

## Workflows

### Multi-Page HTML & CSS Update
**Trigger:** When you want to update the look, layout, or content of several pages at once, ensuring consistent styling.  
**Command:** `/update-pages-style`

1. Edit multiple `.html` files as needed (e.g., `kitchen.html`, `lighting.html`, `livingRoom.html`, `security.html`).
2. Update `style.css` to reflect new or changed styles.
3. Commit all related files together with a descriptive message.

**Example:**
```bash
# Edit kitchen.html, lighting.html, style.css
git add kitchen.html lighting.html style.css
git commit -m "Refresh kitchen and lighting pages, update shared styles"
git push
```

### Site-Wide Merge or Bugfix
**Trigger:** When you need to resolve a merge conflict or fix a bug that affects multiple parts of the site.  
**Command:** `/resolve-merge-bugfix`

1. Identify all conflicting or buggy files across HTML, JS, and CSS (e.g., `index.html`, `main.js`, `style.css`).
2. Edit and resolve issues in each file.
3. Commit all changes together to restore site integrity.

**Example:**
```bash
# Resolve conflicts in index.html, main.js, style.css
git add index.html main.js style.css
git commit -m "Fix merge conflicts and bugs across site"
git push
```

## Testing Patterns

- **Testing Framework:** Not explicitly detected.
- **Test File Pattern:** Files named with `*.test.*` (e.g., `main.test.js`).
- **Location:** Test files are typically placed alongside the code they test.

**Example:**
```javascript
// main.test.js
import { fetchData } from './main.js';

test('fetchData returns expected result', () => {
  // test implementation
});
```

## Commands

| Command                | Purpose                                                      |
|------------------------|--------------------------------------------------------------|
| /update-pages-style    | Update multiple HTML pages and shared CSS styles together     |
| /resolve-merge-bugfix  | Resolve merge conflicts or fix bugs across site-wide files   |
```
