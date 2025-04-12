let studentResponses = [];
let selectedStation = null;
let isStationLocked = false;
let timerSeconds = 0;
let timerInterval;

const stationData = {
    "1": { question: "Demonstrate the communication skill required for recording of blood pressure on a volunteer (5 marks) (Affective domain) ", options: ["Student introduces himself / herself", "Student enquires volunteer details", "Explains the procedure", "Enquires about hypertensive status", "Obtains consent for the procedure"] },
    "2": { question: "Measure the blood pressure by palpatory method in a systemic manner -(5 marks) (Psychomotor domain)", options: ["Wraps uninflated cuff of sphygmomanometer firmly around the bare upper arm 2.5 - 5cm above the elbow joint at the heart level", "places his /her three middle fingers over the radial artery","Keeps the fore arm in mid prone position", "Inflates the cuff rapidly until the pressure in it is well above the systolic blood pressure", "Deflates the cuff slowly,releasing the pressure at 2 - 3 mm Hg/sec"] },
    "3": { question: "Perform B.P. recording by ausculatatory method (5 marks )(Psychomotor domain)", options: ["  explain procedure", "To seat the subject appropriately for examination", "placing the cuff", "applying the pressure and placing the steth", "hearing the kortikoff sounds"] },
    "4": { question: "Explaining the performed procedures", options: ["Introducing himself / herself", "Explains the procedure performed", "palpatory method", "Auscultatory method", "Normal range and applied aspects"] }
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

    document.getElementById("display-student-id").textContent = studentId;
    document.getElementById("display-station").textContent = selectedStation;
    loadQuestion(selectedStation);

    document.getElementById("login-screen").style.display = "none";
    document.getElementById("question-screen").style.display = "block";

    startTimer(); // Start timer when OSCE begins
}

function startTimer() {
    clearInterval(timerInterval); // Ensure no previous timer is running
    let timerSeconds = 60; // Start timer from 30 seconds
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

        if (timerSeconds <= 0) { // Auto-submit when time is up
            clearInterval(timerInterval); // Stop timer
            alert("Time's up! Auto-submitting...");
            nextStudent(); // Automatically submit and proceed
        } else {
            timerSeconds--; // Decrement timer
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

    document.getElementById("timer").textContent = "Time: 00:00:00"; // Reset timer display
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

