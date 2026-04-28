# Note Module

## Overview
The Note module is a simple note-taking feature that allows users to create, edit, and delete notes with rich text editing capabilities. All data is stored locally using IndexedDB, making the application fully offline-capable.

## Features

### Core Functionality
- **Create Notes**: Add notes with title and rich text content
- **Edit Notes**: Modify note title and content
- **Delete Notes**: Remove notes from the system
- **List Notes**: View all notes on the index page sorted by last updated

### Rich Text Editor
The note content uses TipTap rich text editor with the following features:

#### Text Formatting
- **Bold, Italic, Underline, Strikethrough**
- **Font Family**: Arial, Georgia, Courier New, Times New Roman, Verdana
- **Font Size**: 12px, 14px, 16px, 18px, 20px, 24px, 32px
- **Text Color**: Black, Red, Blue, Green
- **Highlight**: Yellow highlighter effect

#### Structure & Layout
- **Lists**: Bullet lists and ordered (numbered) lists
- **Text Alignment**: Left, center, right alignment
- **Links**: Add and edit hyperlinks

#### Export
- **Copy to Clipboard**: Copies formatted HTML content to clipboard for pasting into Word, Google Docs, or other rich text editors

## File Structure

```
src/
├── types/
│   └── note.ts                    # Note interface definition
├── lib/
│   └── storage.ts                 # IndexedDB functions for notes
├── components/
│   └── NoteEditor.tsx            # Reusable rich text editor component
└── routes/
    └── note/
        ├── index.tsx               # Notes list page
        ├── add.tsx                 # Create new note page
        └── edit.$id.tsx          # Edit existing note page
```

## Data Model

### Note Interface
```typescript
interface Note {
  id: string                // Unique identifier
  title: string             // Note title
  content: string           // HTML content from TipTap editor
  createdAt: number         // Timestamp of creation
  updatedAt: number         // Timestamp of last update
  deletedAt?: number        // Soft delete timestamp (optional)
}
```

## Storage Functions

### Note Operations
- `getAllNotes()` - Get all notes sorted by last updated
- `getNoteById(id)` - Get a specific note by ID
- `addNote(title, content)` - Create a new note
- `updateNote(id, updates)` - Update note title and/or content
- `deleteNote(id)` - Permanently delete a note

All functions use IndexedDB via the `idb` library with the database name `budget-manager` (version 7).

## Component: NoteEditor

The `NoteEditor` component is a reusable rich text editor extracted to `src/components/NoteEditor.tsx`.

### Props
```typescript
interface NoteEditorProps {
  content: string                    // Initial HTML content
  onChange: (html: string) => void   // Called when content changes
  editorRef: (editor: Editor) => void  // Expose editor instance to parent
}
```

### Usage
```typescript
<NoteEditor
  content={content}
  onChange={(html) => setContent(html)}
  editorRef={(ed) => setEditor(ed)}
/>
```

## Pages

### Notes Index (`/note`)
- Displays list of all notes sorted by last updated
- Each note shows title and last updated date
- Delete button appears on hover
- Floating action button to create new note
- Shows "No notes yet" message when empty

### Add Note (`/note/add`)
- Title input field
- Rich text editor (NoteEditor component)
- Save button (disabled until title and content are filled)
- Cancel returns to notes list

### Edit Note (`/note/edit/$id`)
- Loads existing note by ID
- Title input field (pre-filled)
- Rich text editor with existing content (NoteEditor component)
- Update button to save changes
- Delete button to remove note
- Copy to Clipboard button

## Routing

The note module uses TanStack Router with file-based routing:
- `/note` - Notes list (index page)
- `/note/add` - Create new note
- `/note/edit/$id` - Edit note by ID

## Navigation

Notes are accessible from the bottom navigation bar with the "Notes" label and FileText icon.

## Dependencies

### TipTap Extensions
- `@tiptap/react` - React integration
- `@tiptap/starter-kit` - Core editor features
- `@tiptap/extension-underline` - Underline formatting
- `@tiptap/extension-highlight` - Text highlighting
- `@tiptap/extension-link` - Hyperlink support
- `@tiptap/extension-color` - Text color
- `@tiptap/extension-text-style` - Text styling (includes font-size)
- `@tiptap/extension-font-family` - Font family selection
- `@tiptap/extension-text-align` - Text alignment

## Usage Tips

1. **Creating a Note**: Click the "+" button, enter a title, use the toolbar to format content, then click "Save Note"
2. **Editing**: Click any note title to open the editor, make changes, click "Update Note"
3. **Formatting**: Use the toolbar buttons - they highlight when active
4. **Copy to Clipboard**: Click the clipboard icon to copy formatted content, then paste into Word/Google Docs
5. **Deleting**: Click the X button on a note (in list) or the trash icon (in editor)

## Technical Notes

- The module follows the same patterns as the Todo module
- All data is stored locally in IndexedDB (offline-first)
- The editor uses HTML content storage (not Markdown or plain text)
- Copy to clipboard uses the Clipboard API with both HTML and plain text formats
- The database version was incremented to 7 for the notes store
