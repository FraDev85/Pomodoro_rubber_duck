# 🍅 Pomodoro & Duck

> A minimal study companion combining the **Pomodoro Technique** and **Rubber Duck Debugging** in a single, distraction-free interface.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)
![License MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## ✨ Features

### 🍅 Pomodoro Timer
- **20-minute focus sessions** with automatic 5-minute breaks
- Animated tomato that **fills with liquid** as time progresses
- **6 color themes** to personalize the experience
- Session tracker — up to 4 pips per cycle
- Synthesized **bell sounds** at every phase transition (via WebAudio API)
- Toast notifications on phase change

### 🦆 Rubber Duck Mode
- A bouncy, blinking **animated rubber duck** drawn on canvas
- Chat interface — type anything, the duck responds with a `quack`
- Click the duck directly for an instant quack + squish animation
- Synthesized **quack sound** on every interaction

### General
- **Zero dependencies** — pure HTML, CSS, JS
- **Dark mode** support via `prefers-color-scheme`
- Accessible markup (`role="tab"`, `aria-live`, `aria-label`)
- ES6 modules, no bundler required

---

## 🧠 The Techniques

**Pomodoro Technique** *(Francesco Cirillo, 1980s)* — Work in focused intervals separated by short breaks. The ticking timer creates urgency and the breaks prevent burnout. This app uses 20-minute sessions instead of the traditional 25, a common and effective variation.

**Rubber Duck Debugging** *(Hunt & Thomas, "The Pragmatic Programmer")* — Explain your problem out loud to an inanimate object. The act of verbalizing forces your brain to reorganize information, often revealing the solution without any external help. The duck doesn't need to understand — you do.

---

## 🚀 Getting Started

No build step, no npm install. Just clone and serve.

```bash
git clone https://github.com/FraDev85/Pomodoro_rubber_duck.git
cd pomodoro-duck
```

Then start a local server (required for ES6 modules):

```bash
# Node.js
npx serve .

# Python 3
python3 -m http.server 8080

# PHP
php -S localhost:8080
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

> ⚠️ Opening `index.html` directly via `file://` will not work due to ES6 module CORS restrictions.

---

## 📁 Project Structure

```
pomodoro-duck/
├── index.html   # Semantic markup, tab roles, aria attributes
├── style.css    # CSS variables, dark mode, animations
└── script.js    # ES6 module — timer logic, canvas drawing, WebAudio
```

The project is intentionally kept in three files with no framework or bundler. The goal is readability and portability.

---

## 🎵 Audio

All sounds are synthesized at runtime using the **Web Audio API** — no audio files are loaded or bundled.

| Event | Sound | Waveform |
|---|---|---|
| Focus session starts | Ascending three-note bell | `sine` |
| Break starts | Descending three-note bell | `sine` |
| Duck interaction | Short quack burst | `sawtooth` |

---

## 🛠️ Customization

All key values are defined at the top of `script.js`:

```js
const WORK_SECS  = 20 * 60;  // change focus duration
const BREAK_SECS = 5  * 60;  // change break duration
```

Colors are declared as CSS custom properties in `style.css` and fully support dark mode via `prefers-color-scheme: dark`.

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-idea`)
3. Commit your changes (`git commit -m 'add: your feature'`)
4. Push to the branch (`git push origin feature/your-idea`)
5. Open a Pull Request

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with focus and a rubber duck. quack.</sub>
</div>
# Pomodoro_rubber_duck
