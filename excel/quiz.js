
// Function to open content in a new window
function openContent(url) {
  window.open(url, '_blank');
}

let questions = []; // Store all questions loaded from Excel
let currentQuestionIndex = 0; // Track the current question index
let userResponses = []; // Store user responses
 // Replace with the logged-in user's ID variable

// Function to read the Excel file and load questions
function loadExcelFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    // Hide file upload button after loading quiz data
    document.getElementById('fileUpload').style.display = 'none';
    document.querySelector('.file-upload-label').style.display = 'none';
    parseExcelData(excelData); // Parse the Excel data and load the questions
    loadQuestion(currentQuestionIndex); // Load the first question
    document.getElementById('mcq-question-container').style.display = 'block'; // Show question area
    document.getElementById('nextButton').style.display = 'block'; // Show Next button
  };

  reader.readAsArrayBuffer(file);
}

// Parse the Excel data into questions array
function parseExcelData(excelData) {
  questions = []; // Reset questions array

  excelData.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    const question = {
      topic: row[0],
      question: row[1],
      options: [row[2], row[3], row[4], row[5]],
      correct: parseInt(row[6]),
      image: row[7] || null // Optional image URL
    };
    questions.push(question);
  });
}
// Display user info and start the timer
// Timer variables
let timerSeconds = 0;
let timerInterval;
document.addEventListener("DOMContentLoaded", function () {
  const userInfoDiv = document.getElementById("user-info");
  userInfoDiv.innerHTML = `<h3>User: ${userName} | ID: ${userId}</h3>
    <div id="timer" style="font-size: 1.2rem; color: orange;">Time: 00:00:00</div>`;

  startTimer();
  loadQuestion(currentQuestionIndex);
});

// Load the current question
function loadQuestion(index) {
  const questionTitle = document.getElementById('question-title');
  const questionOptions = document.getElementById('question-options');
  const questionImage = document.getElementById('question-image');

  const currentQuestion = questions[index];
  questionTitle.innerHTML = `${currentQuestion.topic}: ${currentQuestion.question}`;
  questionOptions.innerHTML = ''; // Clear previous options

  currentQuestion.options.forEach((option, optIndex) => {
    const optionLabel = document.createElement('label');
    optionLabel.innerHTML = `
      <input type="radio" name="question" value="${optIndex}">
      ${option}
    `;
    questionOptions.appendChild(optionLabel);
    questionOptions.appendChild(document.createElement('br'));
  });

  // Display image if available
  if (currentQuestion.image) {
    questionImage.src = currentQuestion.image;
    questionImage.style.display = 'block';
  } else {
    questionImage.style.display = 'none';
  }

  // Hide the submit button until the last question
  document.getElementById('submitButton').style.display = (index === questions.length - 1) ? 'block' : 'none';
  document.getElementById('nextButton').style.display = (index === questions.length - 1) ? 'none' : 'block';
}

// Handle "Next" button click
function nextQuestion() {
  // Get the selected option
  const selectedOption = document.querySelector('input[name="question"]:checked');
  if (!selectedOption) {
    alert("Please select an answer before moving to the next question!");
    return;
  }

  // Store the response
  userResponses[currentQuestionIndex] = parseInt(selectedOption.value);
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    loadQuestion(currentQuestionIndex); // Load the next question
  }
}

// Handle quiz submission
function submitQuiz() {
  const selectedOption = document.querySelector('input[name="question"]:checked');
  if (!selectedOption) {
    alert("Please select an answer before submitting!");
    return;
  }

  userResponses[currentQuestionIndex] = parseInt(selectedOption.value); // Store the last response
  displayResults(); // Display the results
}

// Display quiz results
function displayResults() {
  const resultsContainer = document.getElementById('results-container');
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  let correctAnswers = 0;

  questions.forEach((q, index) => {
    const userAnswer = userResponses[index];
    if (userAnswer === q.correct) correctAnswers++;
  });

  const totalQuestions = questions.length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const score = (correctAnswers / totalQuestions) * 100;

  // Clear the question container before displaying results
  document.getElementById('mcq-question-container').style.display = 'none';

  // Display result summary
  resultsDiv.innerHTML += `<p style="color: green;">Correct Answers: ${correctAnswers}</p>`;
  resultsDiv.innerHTML += `<p style="color: red;">Wrong Answers: ${wrongAnswers}</p>`;
  resultsDiv.innerHTML += `<h3>Your Score: ${score.toFixed(2)}%</h3>`;

  // ✅ Display congratulations message if 100%
  if (score === 100) {
    resultsDiv.innerHTML += `<p style="color: darkblue; font-weight: bold;">🎉 Congratulations! You scored 100%!</p>`;
  }

  resultsContainer.style.display = 'block'; // Show results
  document.getElementById('submitButton').style.display = 'none'; // Hide submit button
}

// Save results to a text file
function saveResults() {
  const totalQuestions = questions.length;
  const correctAnswers = userResponses.filter((response, index) => response === questions[index].correct).length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = (correctAnswers / totalQuestions) * 100;

  // Get the current time and date
  const date = new Date();
  const dateTimeStamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  // Prepare the content for the text file
  let fileContent = `Quiz Results\n\n`;
  fileContent += `userid: ${username}\n\n`;
  fileContent += `Date & Time: ${dateTimeStamp}\n\n`;
  fileContent += `Total Questions: ${totalQuestions}\n`;
  fileContent += `Questions Attempted: ${totalQuestions}\n`;
  fileContent += `Correct Answers: ${correctAnswers}\n`;
  fileContent += `Wrong Answers: ${wrongAnswers}\n`;
  fileContent += `Score: ${percentage.toFixed(2)}%\n\n`;

  // Add individual question details
  questions.forEach((q, index) => {
    const userAnswer = userResponses[index];
    fileContent += `Question: ${q.question}\n`;
    fileContent += `Your Answer: ${q.options[userAnswer] || 'No answer'}\n`;
    fileContent += `Correct Answer: ${q.options[q.correct]}\n\n`;
  });

  // Create and download the text file
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `quiz_results_${date.getTime()}.txt`;
  link.click();
}

