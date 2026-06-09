---
name: site-wide-merge-or-bugfix
description: Workflow command scaffold for site-wide-merge-or-bugfix in LapTrinhWebCuoiKy.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /site-wide-merge-or-bugfix

Use this workflow when working on **site-wide-merge-or-bugfix** in `LapTrinhWebCuoiKy`.

## Goal

Resolve merge conflicts or fix bugs by updating many core site files at once, including HTML, JS, and CSS.

## Common Files

- `*.html`
- `main.js`
- `style.css`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify conflicting or buggy files across HTML, JS, and CSS
- Edit and resolve issues in each file (e.g., index.html, main.js, style.css, etc.)
- Commit all changes together to restore site integrity

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.