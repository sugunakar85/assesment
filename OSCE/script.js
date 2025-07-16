let studentResponses = [];
let selectedStation = null;
let isStationLocked = false;
let timerSeconds = 0;
let timerInterval;

const stationData = {
    "1": { question: "Demonstrate the communication skill required for recording of blood pressure on a volunteer (5 marks) (Affective domain)", options: ["Student introduces himself / herself", "Student enquires volunteer details", "Explains the procedure", "Enquires about hypertensive status", "Obtains consent for the procedure"] },
    "2": { question: "Perform knee jerk on a volunteer -(5 marks) (Psychomotor domain)", options: ["Introduce himself/herself and explain procedure", "To seat the subject in a appropriate matter", "Locate the patellar tendon", "Strike the patellar tendon midway between orgin and insertion", "Conduct the same procedure on the opposite side"] },
    "3": { question: "Perform Rinne's test on volunteer (5 marks )(Psychomotor domain)", options: ["Introduce himself and herself", "Explain procedure", "Set the tunning fork to vibration", "Pressing the base of the tunning fork against the mastoid process behind the ear not touching the prongs", "conduct the same procedure on the opposite side"] },
    "4": { question: "Examine the radial pulse in the given subject in a systemic manner and write down the report", options: ["Stands on subject's right side,formal Introducing", "Explains the procedure performed", "place the subject's forearm in semi-prone position with slight flexion at wrist joint ", "Palpate the radial pulse with tips of the three fingers, counts the radial pulse for one full minute.", " Assess the pulse rhythm, vloume, condition of vessel wall,Normal range and applied aspects"] }
};

function startOSCE() {
    const studentId = document.getElementById("student-id").value.trim();
    const stationButtons = document.querySelectorAll("input[name='station']");

    if (!selectedStation) {
        for (const button of stationButtons) {
            if (button.checked) {
                selectedStation = button.value;
                break;
            }
        }

        if (!selectedStation) {
            alert("Please select a station.");
            return;
        }

        isStationLocked = true;
        document.getElementById("station-selection").style.display = "none";
    }

    if (!studentId) {
        alert("Please enter Student ID.");
        return;
    }

    // Check if this studentId already exists
    const existingIndex = studentResponses.findIndex(resp => resp.studentId === studentId);
    if (existingIndex !== -1) {
        const overwrite = confirm(`Student ID "${studentId}" already exists. Do you want to overwrite the existing entry?`);
        if (!overwrite) return;

        // Remove previous entry
        studentResponses.splice(existingIndex, 1);
    }

    document.getElementById("display-student-id").textContent = studentId;
    document.getElementById("display-station").textContent = selectedStation;
    loadQuestion(selectedStation);

    document.getElementById("login-screen").style.display = "none";
    document.getElementById("question-screen").style.display = "block";

    startTimer(); // Start timer when OSCE begins
}

function startTimer() {
    clearInterval(timerInterval); // Ensure no previous timer is running
    let timerSeconds = 60; // Start timer from 60 seconds
    const timerDisplay = document.getElementById('timer');

    timerInterval = setInterval(() => {
        const minutes = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const seconds = String(timerSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `Time: 00:${minutes}:${seconds}`;

        // Change color to red in the last 10 seconds
        if (timerSeconds <= 10) {
            timerDisplay.style.color = "red";
        } else {
            timerDisplay.style.color = "purple"; // Default color
        }

        if (timerSeconds <= 0) {
            clearInterval(timerInterval); // Stop timer
            alert("Time's up! Auto-submitting...");
            nextStudent();
        } else {
            timerSeconds--;
        }
    }, 1000);
}

function loadQuestion(station) {
    const questionSection = document.getElementById("question-section");
    const stationInfo = stationData[station];

    if (!stationInfo) {
        questionSection.innerHTML = `<p>No question available for Station ${station}</p>`;
        return;
    }

    const questionHTML = `<p>${stationInfo.question}</p>`;
    const optionsHTML = stationInfo.options.map(
        option => `<label><input type="checkbox" class="option" value="${option}"> ${option}</label><br>`
    ).join("");

    questionSection.innerHTML = questionHTML + optionsHTML;
}

function nextStudent() {
    recordResponse(); // Ensure the last response is saved

    document.getElementById("student-id").value = "";
    document.getElementById("question-section").innerHTML = "";

    document.getElementById("login-screen").style.display = "block";
    document.getElementById("question-screen").style.display = "none";

    document.getElementById("timer").textContent = "Time: 00:00:00";
    clearInterval(timerInterval); // Stop timer
}

function recordResponse() {
    const studentId = document.getElementById("display-student-id").textContent;
    const options = document.querySelectorAll(".option");
    let score = 0;
    const selections = [];
    const unselectedOptions = [];
    const currentDate = new Date();

    options.forEach(option => {
        if (option.checked) {
            score += 1;
            selections.push(option.value);
        } else {
            unselectedOptions.push(option.value);
        }
    });

    studentResponses.push({
        studentId,
        station: selectedStation,
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
        question: stationData[selectedStation].question,
        selectedOptions: selections,
        unselectedOptions: unselectedOptions,
        score
    });

    console.log("Recorded Response:", studentResponses);
}

function promptFacultyDetails() {
    if (studentResponses.length === 0) {
        alert("No responses recorded yet.");
        return;
    }

    const facultyName = prompt("Please enter your name:");
    if (facultyName) {
        saveSummaryReport(facultyName);
    } else {
        alert("Faculty name is required to save the report.");
    }
}

function saveSummaryReport(facultyName) {
    if (studentResponses.length === 0) {
        alert("No data available to save.");
        return;
    }

    studentResponses.sort((a, b) => parseInt(a.studentId, 10) - parseInt(b.studentId, 10));

    let csvContent = "studentId,score,Station,Date,Time,Question,Selected Options,Unselected Options,\n";
    studentResponses.forEach(response => {
        csvContent += `"${response.studentId}",${response.score},"${response.station}","${response.date}","${response.time}","${response.question}","${response.selectedOptions.join("; ")}","${response.unselectedOptions.join("; ")}"\n`;
    });

    const sanitizedFacultyName = facultyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `OSCE_Report_${sanitizedFacultyName}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Report saved successfully.");
}
