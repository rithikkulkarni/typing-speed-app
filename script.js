// Define sample paragraphs (each with 8 lines)
const paragraphs = [
    [
      "Lorem ipsum dolor sit amet,",
      "consectetur adipiscing elit.",
      "Sed do eiusmod tempor incididunt",
      "ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam,",
      "quis nostrud exercitation ullamco",
      "laboris nisi ut aliquip ex ea",
      "commodo consequat."
    ],
    [
      "The quick brown fox jumps over",
      "the lazy dog in the park.",
      "While children laugh and play,",
      "the sun sets beyond the hills.",
      "Waves crash upon the shore,",
      "creating a symphony of sound.",
      "Evening brings a gentle calm,",
      "as stars emerge in the sky."
    ]
  ];
  
  const quoteEl = document.getElementById('quote');
  const startBtn = document.getElementById('startBtn');
  const resultEl = document.getElementById('result');
  const themeToggle = document.getElementById('themeToggle');
  
  // Elements for user name entry
  const userNameScreen = document.getElementById('userNameScreen');
  const userNameInput = document.getElementById('userNameInput');
  const userNameSubmit = document.getElementById('userNameSubmit');
  
  let startTime;
  let currentParagraph = [];   // Array of 8 lines
  let currentLineIndex = 0;    // Index of the active line in the paragraph
  let activeCharIndex = 0;     // Index of the current character in the active line
  let testActive = false;
  let userName = "";
  
  // Handle user name submission
  userNameSubmit.addEventListener('click', () => {
    const enteredName = userNameInput.value.trim();
    if (enteredName !== "") {
      userName = enteredName;
      userNameScreen.style.display = 'none';
    } else {
      alert("Please enter your name.");
    }
  });
  
  // Render the three-line window from the current paragraph
  function renderParagraph() {
    quoteEl.innerHTML = "";
    for (let i = 0; i < currentParagraph.length; i++) {
      const lineDiv = document.createElement("p");
      lineDiv.classList.add("line", "mb-2", "text-xl", "text-gray-700", "dark:text-gray-300");
      for (let j = 0; j < currentParagraph[i].length; j++) {
        const span = document.createElement("span");
        // If the character is a space, use a non-breaking space so that it displays and can be styled.
        if (currentParagraph[i][j] === " ") {
          span.innerHTML = "&nbsp;";
        } else {
          span.textContent = currentParagraph[i][j];
        }
        span.classList.add("letter");
        // If this is the active letter in the active line, add the 'current' class (which adds an underline).
        if (i === currentLineIndex && j === activeCharIndex) {
          span.classList.add("current");
        }
        lineDiv.appendChild(span);
      }
      quoteEl.appendChild(lineDiv);
    }
  }
  
  
  
  
  // Global keydown event for per-character input on the active line
  document.addEventListener("keydown", (e) => {
    if (!testActive) return;
    if (e.key.length !== 1) return; // Only process single character keys
  
    // Get the active line based on currentLineIndex
    const activeLine = quoteEl.children[currentLineIndex];
    if (!activeLine) return;
    const letters = activeLine.querySelectorAll(".letter");
  
    if (activeCharIndex >= letters.length) return;
  
    const currentSpan = letters[activeCharIndex];
    // Get expected character
    let expectedChar = currentSpan.textContent;
    // If expected character is a non-breaking space, treat it as a normal space for comparison
    if (expectedChar === "\u00a0") {
      expectedChar = " ";
    }
  
    if (e.key === expectedChar) {
      // Correct key: mark letter as correct and move to next character
      currentSpan.classList.remove("current");
      currentSpan.classList.add("correct");
      activeCharIndex++;
  
      if (activeCharIndex < letters.length) {
        letters[activeCharIndex].classList.add("current");
      } else {
        // Finished current line; move to the next line
        currentLineIndex++;
        activeCharIndex = 0;
        if (currentLineIndex >= quoteEl.children.length) {
          finishTest();
        } else {
          const nextLine = quoteEl.children[currentLineIndex];
          const nextLetters = nextLine.querySelectorAll(".letter");
          if (nextLetters.length > 0) {
            nextLetters[0].classList.add("current");
          }
        }
      }
    } else {
      // Incorrect key: flash error effect on the current letter
      currentSpan.classList.add("error");
      setTimeout(() => {
        currentSpan.classList.remove("error");
      }, 200);
    }
  });
  
  
  
  // Start the test when the Start button is clicked
  startBtn.addEventListener('click', () => {
    if (userName === "") {
      alert("Please enter your name first.");
      return;
    }
    // Choose a random paragraph (8 lines)
    currentParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    // (Optional) Ensure each line ends with a space:
    currentParagraph = currentParagraph.map(line => line.endsWith(" ") ? line : line + " ");
    currentLineIndex = 0;
    activeCharIndex = 0;
    testActive = true;
    resultEl.textContent = "";
    startTime = new Date().getTime();
    renderParagraph();
    startBtn.blur(); // Remove focus from the start button
  });
  
  
  // When the test is finished, calculate WPM and update the leaderboard
  function finishTest() {
    testActive = false;
    const endTime = new Date().getTime();
    const timeTaken = (endTime - startTime) / 1000; // seconds elapsed
    // Calculate total characters typed (sum of all line lengths)
    const totalChars = currentParagraph.reduce((sum, line) => sum + line.length, 0);
    const wpm = Math.round((totalChars / 5) / (timeTaken / 60));
    resultEl.textContent = `🎉 Your speed: ${wpm} WPM`;
    saveToLeaderboard(wpm);
    displayLeaderboard();
  }
  
  function saveToLeaderboard(wpm) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({
      name: userName,
      wpm,
      timestamp: new Date().toLocaleString()
    });
    leaderboard.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5)));
  }
  
  function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const list = leaderboard.map(entry => 
      `<li class="bg-white dark:bg-gray-600 shadow p-2 rounded my-1">
        <strong>${entry.name}</strong>: ${entry.wpm} WPM - <span class="text-sm text-gray-600 dark:text-gray-300">${entry.timestamp}</span>
      </li>`
    ).join("");
    document.getElementById("leaderboard").innerHTML = `<ul>${list}</ul>`;
  }
  
  // Toggle dark/light theme
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle("dark");
  });
  
  // Display leaderboard on page load
  document.addEventListener('DOMContentLoaded', displayLeaderboard);
  