// Remove any hardcoded paragraphs; we now use Wikipedia content.

const quoteEl = document.getElementById('quote');
const inputField = document.getElementById('input');
const startBtn = document.getElementById('startBtn');
const resultEl = document.getElementById('result');
const themeToggle = document.getElementById('themeToggle');

const userNameScreen = document.getElementById('userNameScreen');
const userNameInput = document.getElementById('userNameInput');
const userNameSubmit = document.getElementById('userNameSubmit');

let expectedText = ""; // The full expected string (concatenation of 8 lines, no newline characters)
let expectedLines = []; // The array of 8 lines (each ending with a space)
let testActive = false;
let startTime;
let totalKeystrokes = 0;
let userName = "";

// Handle username submission
userNameSubmit.addEventListener('click', () => {
  const name = userNameInput.value.trim();
  if (name !== "") {
    userName = name;
    userNameScreen.style.display = 'none';
  } else {
    alert("Please enter your name.");
  }
});

/**
 * Processes the Wikipedia extract into exactly 8 lines.
 * Each line is built word-by-word without splitting words,
 * ensuring that the line length does not exceed 45 characters.
 * Each line ends with a space.
 */
function processExtract(text) {
  // Normalize whitespace.
  text = text.replace(/\s+/g, " ").trim();
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  let i = 0;
  
  // Build the first 7 lines.
  for (; i < words.length && lines.length < 7; i++) {
    let word = words[i];
    if (currentLine.length === 0) {
      currentLine = word;
    } else if ((currentLine + " " + word).length <= 45) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine + " "); // Append trailing space.
      currentLine = word;
    }
  }
  // If we haven't built 7 lines yet, push the current line.
  if (lines.length < 7 && currentLine) {
    lines.push(currentLine + " ");
    currentLine = "";
  }
  
  // Build the 8th line from remaining words.
  let lastLine = "";
  for (; i < words.length; i++) {
    let word = words[i];
    if (lastLine.length === 0) {
      lastLine = (word.length <= 45) ? word : word.slice(0, 45);
    } else if ((lastLine + " " + word).length <= 45) {
      lastLine += " " + word;
    } else {
      break; // Stop adding words once the limit is reached.
    }
  }
  lines.push(lastLine + " ");
  
  // Pad with empty lines if there are fewer than 8 lines.
  while (lines.length < 8) {
    lines.push(" ");
  }
  
  return lines;
}


/**
 * Fetches a random Wikipedia summary and returns an array of 8 lines.
 */
async function fetchWikipediaContent() {
  try {
    const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
    const data = await response.json();
    return processExtract(data.extract);
  } catch (error) {
    console.error("Error fetching Wikipedia content:", error);
    return ["Error fetching content. "];
  }
}

/**
 * Renders the expected text from an array of lines.
 * Each line is rendered character-by-character (spaces become &nbsp;),
 * and a <br> element is inserted after each line (except the last).
 */
function renderParagraph(lines) {
  quoteEl.innerHTML = "";
  lines.forEach((line, index) => {
    for (let char of line) {
      const span = document.createElement("span");
      span.innerHTML = (char === " " ? "&nbsp;" : char);
      span.classList.add("letter");
      quoteEl.appendChild(span);
    }
    if (index < lines.length - 1) {
      const br = document.createElement("br");
      quoteEl.appendChild(br);
    }
  });
}

// Start the test when the Start button is clicked.
startBtn.addEventListener('click', async () => {
  if (userName === "") {
    alert("Please enter your name first.");
    return;
  }
  // Fetch and process content from Wikipedia.
  expectedLines = await fetchWikipediaContent();
  // For comparison, join the lines without newline characters.
  expectedText = expectedLines.join("");
  
  renderParagraph(expectedLines);
  
  // Reset test variables.
  inputField.value = "";
  totalKeystrokes = 0;
  testActive = true;
  startTime = new Date().getTime();
  resultEl.textContent = "";
  
  // Focus the input field (which is offscreen).
  inputField.focus();
});

// Count keystrokes (including letters, Backspace, and Enter).
inputField.addEventListener('keydown', (e) => {
  if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
    totalKeystrokes++;
  }
});

// Update letter highlighting based on user input.
inputField.addEventListener('input', () => {
    if (!testActive) return;
    const userInput = inputField.value;
    const letters = document.querySelectorAll(".letter");
    
    // Update each letter's styling.
    for (let i = 0; i < letters.length; i++) {
      letters[i].classList.remove("correct", "incorrect", "current");
      if (i < userInput.length) {
        // Treat a rendered non-breaking space as a normal space.
        let expectedChar = (expectedText[i] === " " ? " " : expectedText[i]);
        if (userInput[i] === expectedChar) {
          letters[i].classList.add("correct");
        } else {
          letters[i].classList.add("incorrect");
        }
      } else if (i === userInput.length) {
        letters[i].classList.add("current");
      }
    }
    
    // Finish the test when the user has typed all the significant characters.
    if (userInput.trimEnd() === expectedText.trimEnd()) {
      finishTest();
    }
  });
  

// Finish the test: calculate speed and accuracy.
function finishTest() {
  testActive = false;
  const endTime = new Date().getTime();
  const timeTaken = (endTime - startTime) / 1000; // seconds
  // Count total characters excluding any formatting (here, expectedText has no newline).
  const totalChars = expectedText.replace(/\n/g, "").length;
  const wpm = Math.round((totalChars / 5) / (timeTaken / 60));
  const accuracy = Math.round((totalChars / totalKeystrokes) * 100);
  resultEl.textContent = `🎉 Speed: ${wpm} WPM, Accuracy: ${accuracy}%`;
  saveToLeaderboard(wpm, accuracy);
  displayLeaderboard();
}

function saveToLeaderboard(wpm, accuracy) {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({
    name: userName,
    wpm,
    accuracy,
    timestamp: new Date().toLocaleString()
  });
  leaderboard.sort((a, b) => b.wpm - a.wpm);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5)));
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const list = leaderboard.map(entry =>
    `<li class="bg-white dark:bg-gray-600 shadow p-2 rounded my-1">
      <strong>${entry.name}</strong>: ${entry.wpm} WPM, ${entry.accuracy}% Accuracy - 
      <span class="text-sm text-gray-600 dark:text-gray-300">${entry.timestamp}</span>
    </li>`
  ).join("");
  document.getElementById("leaderboard").innerHTML = `<ul>${list}</ul>`;
}

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle("dark");
});

document.addEventListener('DOMContentLoaded', displayLeaderboard);
