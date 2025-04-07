const quotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing is a fundamental skill for developers.",
    "Practice makes perfect."
  ];
  
  const quoteEl = document.getElementById('quote');
  const inputEl = document.getElementById('input');
  const startBtn = document.getElementById('startBtn');
  const resultEl = document.getElementById('result');
  
  let startTime;
  let currentQuote = "";
  
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
    }
  });
  