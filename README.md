# Tinkl - Learn to Code!

Tinkl is a single-page educational website designed to teach kids ages 4–12 the fundamentals of coding through fun, interactive, and visual puzzles. 

## Features
- **Visual Block Coding:** Drag and drop blocks to solve puzzles without typing code.
- **Progressive Learning:** Starts with basic sequencing, moves to loops, conditionals, and functions.
- **Gamified Progression:** Earn XP, level up, and unlock cute accessories for your virtual pet companion.
- **Weekly Challenges:** A special bonus level that rotates every week for continuous learning and extra XP!
- **Local Storage:** All progress, levels, and items are safely stored in your browser without needing an account.
- **Offline Capable:** Run the app completely offline in your browser. No external API dependencies.

## File Structure
- `index.html`: The main application view.
- `css/styles.css`: Custom CSS animations and utility styles alongside Tailwind.
- `js/`: Core game logic broken down into professional modules:
  - `data.js`: Level configurations, block data, rewards.
  - `state.js`: Local storage and state management.
  - `audio.js`: Sound synthesis and Web Audio API.
  - `ui.js`: UI updates, modal interactions, DOM manipulation.
  - `engine.js`: AST compiler, game logic loop, conditional evaluation.
  - `render.js`: Canvas rendering for grid, turtle, logic, and pattern puzzles.
  - `main.js`: Initialization scripts.

## How to Play
Just open `index.html` in any modern web browser! No build tools or servers are required.

## Target Audience
- **Ages 4-7:** Picture-based block dragging, no reading required.
- **Ages 8-12:** Simple text snippets, logic puzzles, mini challenges.
