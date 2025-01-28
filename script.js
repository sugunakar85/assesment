let studentResponses = [];
let selectedStation = null;

// Station data with questions and options
// To add a new station, follow the format:
// "StationNumber": { question: "Question Text", options: ["Option1", "Option2", ...] }
const stationData = {
    "1": { question: "Describe the cardiovascular examination procedure.", options: ["Check pulse rate", "Listen to heart sounds", "Examine jugular venous pressure", "Assess peripheral pulses", "Measure blood pressure", "Testing extra question"] },
    "2": { question: "Explain the respiratory system examination steps.", options: ["Inspect chest symmetry", "Percuss chest wall", "Auscultate lung sounds", "Measure respiratory rate", "Assess for cyanosis"] },
    "3": { question: "Detail the steps for abdominal examination.", options: ["Inspect abdomen contour", "Palpate for tenderness", "Percuss liver span", "Check for hernias", "Auscultate bowel sounds"] },
    "4": { question: "Discuss the neurological examination process.", options: ["Assess cranial nerves", "Evaluate muscle strength", "Test reflexes", "Check coordination", "Examine sensory function"] },
    // Corrected station 5 format
    "5": { question: "Discuss the functions of cranial nerves.", options: ["Trigeminal nerve", "Oculomotor nerve", "Trochlear nerve", "Abducens nerve","optic nerve"] },
    "6": { question: "Discuss the motor system.", options: ["bulk of the muscle", "tone of the muscle", "formatative acessment ","deep tendon reflexes"]}
};

function startOSCE() {
    const studentId = document.getElementById("student-id").value.trim();
    const stationButtons = document.querySelectorAll("input[name='station']");
    
    // Check if station is selected
    selectedStation = null;
    for (const button of stationButtons) {
        if (button.checked) {
            selectedStation = button.value;
            break;
        }
    }

    if (!studentId) {
        alert("Please enter Student ID.");
        return;
    }

    if (!selectedStation) {
        alert("Please select a station.");
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
    const optionsHTML = stationInfo.options.map(
        (option, index) => `<label><input type="checkbox" class="option" value="${option}"> ${option}</label><br>`
    ).join("");
    
    questionSection.innerHTML = questionHTML + optionsHTML;
}

function nextStudent() {
    recordResponse();

    document.getElementById("student-id").value = "";
    document.getElementById("question-section").innerHTML = "";
    document.querySelectorAll("input[name='station']").forEach(button => button.checked = false);
    
    // Reset the selected station for the next student
    selectedStation = null;

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
    let csvContent = "Student ID,Score,Selected Options,Unselected Options\n";

    studentResponses.forEach(response => {
        csvContent += `${response.studentId},${response.score},"${response.selectedOptions.join(", ")}","${response.unselectedOptions.join(", ")}"\n`;
    });

    const sanitizedFacultyName = facultyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Station_${selectedStation}_Summary_Report_${sanitizedFacultyName}.csv`;
    link.click();
    
    studentResponses = [];
}

