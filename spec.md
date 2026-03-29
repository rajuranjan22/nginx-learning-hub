# Nginx Learning Website

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Full nginx learning website with structured lessons
- Sidebar navigation with topic sections
- Syntax-highlighted code blocks for nginx config snippets
- Lesson topics: Introduction, Installation, Server Blocks, Location Blocks, Reverse Proxy, SSL/TLS, Load Balancing, Security Headers, Logging, Performance Tuning
- Each lesson has explanation text, nginx config code examples, and tips/notes
- Copy-to-clipboard for code blocks
- Progress tracking (frontend only, local state)
- Search/filter lessons
- Responsive layout

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: minimal (no persistent data needed, all static content)
2. Frontend: full learning UI with sidebar, lesson viewer, code blocks with copy feature
3. All nginx code examples embedded in frontend as structured data
4. Use shadcn components for layout and UI elements
