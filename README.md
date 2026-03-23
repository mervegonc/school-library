# school-library
A free, mobile-friendly school library management system built with vanilla JS and GitHub Pages. Features ISBN lookup via Google Books API, barcode scanner support, and annual JSON archiving.
# 📚 School Library Management System

A free, mobile-friendly web application for managing a school library — built with vanilla HTML/CSS/JavaScript, hosted on GitHub Pages, and powered by the Google Books API.

> **No server. No monthly cost. No app store.** Just open the URL and start managing.

---

## ✨ Features

- **Book catalog** — add books by ISBN, title search, or manually; cover images and summaries auto-filled via Google Books API
- **Barcode scanner support** — plug in any USB barcode reader; it works like a keyboard, no drivers needed
- **Borrow & return** — track active loans, overdue items, and full history
- **Student records** — register students, view reading history, enforce loan limits
- **Role-based access** — Librarian, Teacher, Student, and Management each see a tailored interface
- **Statistics & reports** — most-read books, class-based reading stats, on-time return rates, printable reports
- **PWA ready** — add to home screen on any phone; works like a native app
- **Annual archiving** — at the end of each school year, one click archives the data and starts a fresh period
- **Offline-first** — LocalStorage buffers all actions; syncs to GitHub when connection is restored

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hosting | GitHub Pages (free) |
| Data storage | GitHub repository (JSON files) |
| Book metadata | Google Books API (free tier, 1000 req/day) |
| PWA | Web App Manifest + Service Worker |
| Fonts | Google Fonts — Lora + DM Sans |

No frameworks. No build tools. No dependencies. Open `index.html` and it works.

---

## 🚀 Getting Started

### 1. Fork or clone this repository

```bash
git clone https://github.com/YOUR_USERNAME/school-library.git
```

### 2. Enable GitHub Pages

Go to **Settings → Pages → Source → Deploy from branch → main → / (root)** and click Save.

Your site will be live at:
```
https://YOUR_USERNAME.github.io/school-library
```

### 3. Add your Google Books API key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **Books API**
3. Generate an API key
4. Open `js/config.js` and add your key:

```js
const CONFIG = {
  GOOGLE_BOOKS_API_KEY: "YOUR_API_KEY_HERE",
  GITHUB_TOKEN: "YOUR_GITHUB_TOKEN_HERE",
  GITHUB_REPO: "YOUR_USERNAME/school-library",
};
```

### 4. Create a GitHub Personal Access Token

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Give it **Contents: Read and Write** permission on this repository
3. Paste the token into `js/config.js`

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Librarian** | Full access — books, loans, students, ISBN scanner, reports |
| **Teacher** | View catalog, overdue list, class statistics |
| **Student** | Search catalog, view book details and availability |
| **Management** | Dashboard overview and reports only |

---

## 📁 Project Structure

```
school-library/
├── index.html          # Main application shell
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching
├── css/
│   └── style.css       # All styles
├── js/
│   ├── config.js       # API keys and settings (⚠️ keep private)
│   ├── app.js          # Main application logic
│   ├── auth.js         # Login and role management
│   ├── books.js        # Book catalog and ISBN lookup
│   ├── loans.js        # Borrow and return logic
│   ├── students.js     # Student management
│   ├── reports.js      # Statistics and reporting
│   └── storage.js      # GitHub API sync + LocalStorage
└── data/
    ├── 2025-2026.json  # Active year data
    └── archive/
        └── 2024-2025.json  # Previous year (archived)
```

---

## 📱 Mobile Usage

The app is a **Progressive Web App (PWA)**. To install on a phone:

- **Android (Chrome):** tap the three-dot menu → *Add to Home Screen*
- **iPhone (Safari):** tap the Share button → *Add to Home Screen*

Once installed, it opens full-screen with no browser chrome — exactly like a native app.

---

## 🔖 Barcode Scanner

Any USB or Bluetooth barcode scanner works — no special model required. The scanner emulates a keyboard (HID mode), so it types the ISBN directly into whatever input is focused.

**To add a book with the scanner:**
1. Navigate to **Books → ISBN Scan**
2. Click the ISBN input field
3. Scan the barcode on the back of the book
4. Book details auto-fill from Google Books — confirm and save

---

## 📊 Data & Privacy

- All data is stored in **your own GitHub repository** — Anthropic, Google, or any third party cannot access it
- Google Books API is only used to fetch public book metadata (title, author, cover) — no student or loan data is ever sent to Google
- The system runs entirely in the browser; there is no backend server

---

## 🗓 Annual Archiving

At the end of each school year:

1. Go to **Settings → New School Year**
2. Click **Archive & Reset**
3. The current `2025-2026.json` is saved to `data/archive/`
4. A fresh `2026-2027.json` is created automatically

Previous years remain fully accessible from the **Archive** tab — nothing is ever deleted.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built for a real school library. If this helps your school too, give it a ⭐*
