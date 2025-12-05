# Call Transcript Insights Web App - Plan

## Overview
A simple, modern web application that lets you paste daily call transcripts from Notion's meeting recorder and see basic insights.

## Design Philosophy
- **Notion-inspired**: Clean, minimal interface with subtle shadows and neutral colors
- **Ultra Simple**: Single-page app, just paste and view

## Core Features

### 1. Transcript Input
- **Textarea** for pasting transcripts
- **Date picker** (defaults to today)
- **Save button**

### 2. Simple Insights
- **Total calls** count
- **Most common keywords** (top 10 words)
- **List of all calls** with dates and previews

## Technical Architecture

### File Structure
```
/
├── index.html          # Everything in one file (or split into 3 files max)
├── styles.css          # Styling
└── app.js              # All logic
```

### Technology Stack
- **HTML/CSS/JS**: Pure vanilla, no frameworks
- **localStorage**: Store transcripts in browser

### Data Storage
- Simple array of calls stored in localStorage:
  ```javascript
  {
    date: "YYYY-MM-DD",
    transcript: "full text"
  }
  ```

## UI/UX Design

### Colors (Notion-style)
- **Background**: White (#ffffff)
- **Text**: Dark gray (#37352f)
- **Accent**: Blue (#2383e2)
- **Borders**: Light gray (#e9e9e7)

### Layout
1. **Input area** (top):
   - Date picker
   - Textarea
   - Save button

2. **Insights** (middle):
   - Total calls card
   - Top keywords card

3. **Call list** (bottom):
   - Simple list showing date + first 100 chars of transcript
   - Click to view full transcript

## Insights Logic

### Simple Analysis
1. **Count total calls**: Just count the array length
2. **Extract keywords**: 
   - Combine all transcripts
   - Remove common words (the, and, or, etc.)
   - Count word frequency
   - Show top 10 most common words

## User Flow

1. **Open app** → See input form
2. **Paste transcript** → Select date → Click Save
3. **View insights** → See total calls and keywords automatically
4. **Browse calls** → Click any call to see full transcript

## Implementation Steps

1. Create HTML with input form
2. Style with Notion-inspired CSS
3. Add JavaScript to save to localStorage
4. Display saved calls list
5. Calculate and show total calls
6. Extract and show top keywords

## Key Principles
- **Ultra simple**: Minimal features, easy to use
- **No backend**: Everything in browser
- **Clean design**: Notion-like aesthetic

