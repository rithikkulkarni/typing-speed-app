const quotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing is a fundamental skill for developers.",
    "Practice makes perfect."
  ];
  
  const quoteEl = document.getElementById('quote');
  const inputEl = document.getElementById('input');
  const startBtn = document.getElementById('startBtn');
  const resultEl = document.getElementById('result');
  const themeToggle = document.getElementById('themeToggle');
  
  let startTime;
  let currentQuote = "";
  
  // Display leaderboard on page load
  document.addEventListener('DOMContentLoaded', displayLeaderboard);
  
  startBtn.addEventListener('click', () => {
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = currentQuote;
    inputEl.value = "";
    inputEl.disabled = false;
    inputEl.focus();
    startTime = new Date().getTime();
    resultEl.textContent = "";
  });
  
  inputEl.addEventListener('input', () => {
    const typedText = inputEl.value;
    if (typedText === currentQuote) {
      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;
      const words = typedText.split(" ").length;
      const wpm = Math.round((words / timeTaken) * 60);
      resultEl.textContent = `🎉 Your speed: ${wpm} WPM`;
      inputEl.disabled = true;
      saveToLeaderboard(wpm);
      displayLeaderboard();
    }
  });
  
  function saveToLeaderboard(wpm) {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({
      wpm,
      timestamp: new Date().toLocaleString()
    });
    leaderboard.sort((a, b) => b.wpm - a.wpm); // Optional: sort high to low
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  }
  
  function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const list = leaderboard.map(entry => 
      `<li class="bg-white dark:bg-gray-600 shadow p-2 rounded my-1">
        ${entry.wpm} WPM - <span class="text-sm text-gray-600 dark:text-gray-300">${entry.timestamp}</span>
      </li>`
    ).join("");
    document.getElementById("leaderboard").innerHTML = `<ul>${list}</ul>`;
  }
  
  // Theme toggle: Switches between dark and light modes
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle("dark");
  });
  