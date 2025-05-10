# ED200_FinalProject
Final Project for ED200 | Justice-Based Education


# Project Overview 
The project is based on an Electron-based Desktop Widget that helps students manage their daily tasks while encouraging thoughtful reflections on social issues. Additionally, this includes curated prompts to promote awareness and critical thinking around their identity and equity. 

# Features 
- Add, edit, and delete tasks
- Marks them as completed
- Journal Prompts
- Bonus Feature: Weather API


# Steps to get started 

- Node.js v18+
- npm

  Installation & Run

git clone https://github.com/yourusername/justice-todo-widget.git
cd justice-todo-widget
npm install
npm start

File Structures 

todo-widget/
├── index.html            # Main UI
├── style.css             # Styling (Pixel-like aesthetic)
├── main.js               # Electron window and IPC setup
├── preload.js            # Secure context bridge for renderer
├── renderer.js           # All frontend logic (tasks, prompts, weather)
├── tasks.json            # Local data storage for to-do tasks
├── journal.json          # Local data storage for journal entries
├── package.json          # Metadata and dependencies
└── package-lock.json     # Version lock file


# Planned Improvements 
- Tag Entries by social theme
- Analysis and growth tracker

# Author 
Melissa Regalado 
Final Project for ED200| Professor Martinelle
Spring 2025
  




