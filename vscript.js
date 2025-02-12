let studentResponses = [];
let selectedStation = null;
let isStationLocked = false; // Flag to track if station selection is locked

// Station data with questions and options
const stationData = {
    "1": { question: "Examiner-1", options: ["+1", "+1", "+1", "+1", "+1"] },
    "2": { question: "Examiner-2", options: ["+1", "+1", "+1", "+1", "+1"] },
    "3": { question: "Examiner-3", options: ["+1", "+1", "+1", "+1", "+1"] },
    "4": { question: "Examiner-4", options: ["+1", "+1", "+1", "+1", "+1"] }
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
}

function loadQuestion(station) {
    const questionSection = document.getElementById("question-section");
    const stationInfo = stationData[station];

    if (!stationInfo) {
        questionSection.innerHTML = `<p>No question available for Station ${station}</p>`;
        return;
    }

    const questionHTML = `<p>${stationInfo.question}</p>`;
    let optionsHTML = "";

    if (stationInfo.options.length > 5) {
        optionsHTML = `<div class="grid-options">` +
            stationInfo.options.map(
                (option, index) => `<label><input type="checkbox" class="option" value="${option}"> ${option}</label>`
            ).join("") +
            `</div>`;
    } else {
        optionsHTML = stationInfo.options.map(
            (option, index) => `<label><input type="checkbox" class="option" value="${option}"> ${option}</label><br>`
        ).join("");
    }

    questionSection.innerHTML = questionHTML + optionsHTML;
}

function nextStudent() {
    const studentId = document.getElementById("student-id").value.trim();
    if (!studentId) {
        alert("Please enter Student ID before proceeding.");
        return;
    }

    recordResponse();

    document.getElementById("student-id").value = "";
    document.getElementById("question-section").innerHTML = "";

    document.getElementById("login-screen").style.display = "block";
    document.getElementById("question-screen").style.display = "none";
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
}

function promptFacultyDetails() {
    recordResponse();

    const facultyName = prompt("Please enter your name:");
    if (facultyName) {
        saveSummaryReport(facultyName);
    } else {
        alert("Faculty name is required to save the report.");
    }
}

function saveSummaryReport(facultyName) {
    studentResponses.sort((a, b) => parseInt(a.studentId, 10) - parseInt(b.studentId, 10));

    let csvContent = "studentID,score,Selected Options,Unselected Options\n";
    studentResponses.forEach(response => {
        csvContent += `${response.studentId},${response.score},"${response.selectedOptions.join(", ")}","${response.unselectedOptions.join(", ")}"\n`;
    });

    const sanitizedFacultyName = facultyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Station_${selectedStation}_Summary_Report_${sanitizedFacultyName}.csv`;

    isStationLocked = true;
    link.click();

    link.addEventListener("click", () => {
        isStationLocked = false;
    });

    studentResponses = [];
}

