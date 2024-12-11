// Capture user details from URL
const params = new URLSearchParams(window.location.search);
const userName = params.get('name') || "Unknown User";
const userId = params.get('id') || "No ID";

// Timer variables
let timerSeconds = 0;
let timerInterval;

// Display user info at the top of the page and initialize the timer
document.addEventListener("DOMContentLoaded", function () {
  const userInfoDiv = document.getElementById("user-info");
  userInfoDiv.innerHTML = `<h3>User: ${userName} | ID: ${userId}</h3><div id="timer" style="font-size: 1.2rem; color: orange;">Time: 00:00:00</div>`;
  
  startTimer(); // Start the timer when the page loads
});

// Sample questions
const questions = [
  { question: "Identify the cell organelle?", options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"], correct: 1, image: "images/mitochondria.png" },
  { question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correct: 2, image: null },
  { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Venus", "Jupiter"], correct: 1, image: null },
  { question: "Which planet is known as the gaint Planet?", options: ["Earth", "Mars", "Venus", "Jupiter"], correct: 3, image: null },
  { question: "Mr. Ravi Kumar, a 55-year-old male, arrives at the Emergency Department with severe chest pain radiating to the left arm and jaw for the past 2 hours. He appears anxious, diaphoretic (sweating profusely), and breathless. His medical history includes long-standing hypertension and smoking. Vitals show BP: 160/95 mmHg, HR: 98 bpm. An ECG reveals ST-segment elevation in leads II, III, and aVF, and a positive Troponin I confirms myocardial injury. Immediate treatment is initiated to reduce further cardiac damage and improve outcomes.",
   options: ["Administer Aspirin", "Oral analgesics ", "Oxygen, Nitroglycerin, Morphine, and prepare for PC", "Start antibiotics and IV fluids"], correct: 3, image: null },
];

let currentQuestionIndex = 0;
let userResponses = [];

// Function to start the timer
function startTimer() {
  const timerDisplay = document.getElementById('timer');
  timerInterval = setInterval(() => {
    timerSeconds++;
    const hours = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(timerSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `Time: ${hours}:${minutes}:${seconds}`;
  }, 1000);
}

// Function to load a question
function loadQuestion(index) {
  const quizContainer = document.getElementById('mcq-questions');
  quizContainer.innerHTML = ''; // Clear previous content
  const q = questions[index];

  const questionDiv = document.createElement('div');
  questionDiv.innerHTML = `<h3>${q.question}</h3>`;
  
  // Display question image if available
  if (q.image) {
    const img = document.createElement('img');
    img.src = q.image;
    img.alt = "Question Image";
    img.style.maxWidth = "200px";
    questionDiv.appendChild(img);
  }

  // Display options
  q.options.forEach((option, i) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="q${index}" value="${i}"> ${option}`;
    questionDiv.appendChild(label);
    questionDiv.appendChild(document.createElement('br'));
  });

  // Add "Next" or "Submit" button
  if (index < questions.length - 1) {
    questionDiv.innerHTML += `<button onclick="validateAndProceed(${index}, ${index + 1})">Next</button>`;
  } else {
    questionDiv.innerHTML += `<button onclick="validateAndProceed(${index}, 'submit')">Submit</button>`;
  }

  quizContainer.appendChild(questionDiv);
}

// Function to validate selection and proceed
function validateAndProceed(currentIndex, nextAction) {
  const selected = document.querySelector(`input[name="q${currentIndex}"]:checked`);
  if (!selected) {
    alert("Please select an answer before proceeding!");
    return;
  }

  saveResponse(currentIndex);

  if (nextAction === "submit") {
    submitQuiz();
  } else {
    loadQuestion(nextAction);
  }
}

// Function to save user response for the current question
function saveResponse(index) {
  const selected = document.querySelector(`input[name="q${index}"]:checked`);
  userResponses[index] = selected ? parseInt(selected.value) : null;
}

// Function to submit the quiz and display results
function submitQuiz() {
  clearInterval(timerInterval); // Stop the timer

  let correctAnswers = 0;
  const totalQuestions = questions.length;

  // Calculate correct answers
  userResponses.forEach((response, i) => {
    if (response === questions[i].correct) {
      correctAnswers++;
    }
  });

  const wrongAnswers = totalQuestions - correctAnswers;
  const scorePercentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);

  // Display summary on the page
  const quizContainer = document.getElementById('mcq-questions');
  quizContainer.innerHTML = `
    <h3>Quiz Summary</h3>
    <p><strong>User:</strong> ${userName}</p>
    <p><strong>ID:</strong> ${userId}</p>
    <p><strong>Total Time:</strong> ${formatTime(timerSeconds)}</p>
    <p><strong>Total Questions:</strong> ${totalQuestions}</p>
    <p style="color: green;"><strong>Correct Answers:</strong> ${correctAnswers}</p>
    <p style="color: red;"><strong>Wrong Answers:</strong> ${wrongAnswers}</p>
    <p><strong>Score:</strong> ${scorePercentage}%</p>
  `;

  // Prepare results text for saving
  const resultsText = `
Quiz Results

User: ${userName}
ID: ${userId}
Total Time: ${formatTime(timerSeconds)}
Total Questions: ${totalQuestions}
Correct Answers: ${correctAnswers}
Wrong Answers: ${wrongAnswers}
Score: ${scorePercentage}%

Question Details:
${questions.map((q, i) => `
Question: ${q.question}
Your Answer: ${q.options[userResponses[i]] || "No answer"}
Correct Answer: ${q.options[q.correct]}
`).join("\n")}
`;

  saveResultsToFile(resultsText);
}

// Function to save results to a text file
function saveResultsToFile(content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `quiz_results_${userName}_${Date.now()}.txt`;
  link.click();
}

// Helper function to format time in HH:MM:SS
function formatTime(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Load the first question when the page loads
loadQuestion(currentQuestionIndex);

