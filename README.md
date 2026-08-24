# FreeWord

A free, installable desktop word processor. Opens and saves **real .docx files**
(readable in actual Microsoft Word), no license needed.

## Features
- Word-style ribbon: fonts, sizes, bold/italic/underline/strikethrough, colors, highlight
- Headings, paragraph styles, alignment, bullet/numbered lists, indent
- Tables, hyperlinks
- Open real `.docx` files (also `.html`, `.txt`)
- Save / Save As → writes real `.docx`
- Undo/redo, live word count
- Runs as a native installable desktop app (Windows / Mac / Linux) via Electron

## Setup (one-time)

You need [Node.js](https://nodejs.org) installed (free). Then in this folder:

```bash
npm install
npm start
```

That opens the app window immediately — no license, no account, no payment.

## Build an installer (optional)

To get a real installable `.exe` (Windows), `.dmg` (Mac), or `.AppImage` (Linux)
that you can double-click like any other app:

```bash
npm run dist
```

The installer will appear in the `dist/` folder.

## Notes
- This is a lightweight editor covering everyday word-processing needs
  (formatting, tables, headings, save/open .docx). It does not include
  advanced Word features like mail merge, macros/VBA, or track changes.
- Built on Electron + `mammoth` (docx → HTML) + `html-to-docx` (HTML → docx).
