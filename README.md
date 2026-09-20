# Meowdoku 🐱

A cat-themed logic puzzle game inspired by Meowdoku.

## 🎮 Play the Game

**Live Demo:**  
https://nirant07.github.io/meowdoku/

## 🧩 How to Play

Meowdoku is a logic puzzle played on a 7×7 grid.

The objective is to place **7 cats** on the board while following all of these rules:

- 🐱 Exactly **one cat in every row**
- 🐱 Exactly **one cat in every column**
- 🎨 Exactly **one cat in every connected colour region**
- 🚫 Cats cannot touch each other horizontally, vertically, or diagonally
- There are **no Sudoku-style 3×3 boxes**

Use the coloured regions and the no-touching rule to logically determine where each cat belongs.

## ✨ Features

- Multiple difficulty levels
- Random puzzle generation
- Hint system
- Puzzle validation
- Clear/reset functionality
- Move counter
- Responsive design
- Runs entirely in the browser
- No backend or database required
- Can be hosted directly with GitHub Pages

## 🛠️ Built With

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages

## 📁 Project Structure

```text
meowdoku/
├── index.html      # Main game page
├── style.css       # Game styling and responsive layout
├── script.js       # Puzzle generation and game logic
├── README.md       # Project documentation
├── .gitignore      # Git ignored files
└── LICENSE         # MIT License
```

## 🚀 Run Locally

Clone the repository:

```bash
git clone https://github.com/Nirant07/meowdoku.git
cd meowdoku
```

You can open `index.html` directly in a browser.

Alternatively, run a simple local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## 🌐 GitHub Pages

The project is deployed using GitHub Pages.

Every update pushed to the `main` branch can be deployed to the live site automatically.

## 📌 Project Goals

The project aims to provide a simple, lightweight and enjoyable browser implementation of Meowdoku while keeping the gameplay focused on logic rather than speed or guessing.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with cats and JavaScript.
