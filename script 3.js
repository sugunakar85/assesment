let studentResponses = [];
let selectedStation = null;
let isStationLocked = false; // Flag to track if station selection is locked

// Station data with questions and options
const stationData = {
    "1": { question: "Demonstrate the communication skill required for recording of blood pressure on a volunteer (5 marks) (Affective domain) ", options: ["Student introduces himself / herself", "Student enquires volunteer details", "Explains the procedure", "Enquires about hypertensive status", "Obtains consent for the procedure"] },
    "2": { question: "Measure the blood pressure by palpatory method in a systemic manner -(5 marks) (Psychomotor domain)", options: ["Wraps uninflated cuff of sphygmomanometer firmly around the bare upper arm 2.5 - 5cm above the elbow joint at the heart level", "places his /her three middle fingers over the radial artery","Keeps the fore arm in mid prone position", "Inflates the cuff rapidly until the pressure in it is well above the systolic blood pressure", "Deflates the cuff slowly,releasing the pressure at 2 - 3 mm Hg/sec"] },
    "3": { question: "Perform knee jerk reflex on a volunteer (5 marks )(Psychomotor domain)", options: ["Introducing himself / herself and explain procedure", "To seat the subject appropriately for examination", "Locating patellar tendon", "Strike gently with broader end of hammer on patellar tendon midway between origin and insertion", "Conduct the same procedure on opposite side"] },
    "4": { question: "Perform Rinne's test on volunteer (5 marks) (Psychomotor domain)", options: ["Introducing himself / herself", "Explains the procedure", "Set the tunning fork to vibration", "Pressing the base against the mastoid process behind ear not touching prongs", "Conducting the same procedure on the opposite side"] }
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
    const optionsHTML = stationInfo.options.map(
        (option, index) => `<label><input type="checkbox" class="option" value="${option}"> ${option}</label><br>`
    ).join("");
    
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
    // Sort studentResponses by studentId in ascending numerical order
    studentResponses.sort((a, b) => {
        const idA = parseInt(a.studentId, 10);
        const idB = parseInt(b.studentId, 10);
        return idA - idB;
    });

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


