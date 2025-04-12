document.getElementById('mergeForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const files = [
        document.getElementById('file1').files[0],
        document.getElementById('file2').files[0],
        document.getElementById('file3').files[0],
        document.getElementById('file4').files[0]
    ];

    const scores = {};

    for (const file of files) {
        const text = await file.text();
        const lines = text.split('\n');
        lines.shift(); // Remove header

        for (const line of lines) {
            if (line.trim()) { // Skip empty lines
                const columns = line.split(',').map(col => col.trim()); // Trim spaces

                if (columns.length >= 2) { // Ensure sufficient columns
                    const studentId = columns[0];
                    const score = parseFloat(columns[1]);

                    if (!isNaN(score)) { // Skip invalid scores
                        scores[studentId] = (scores[studentId] || 0) + score;
                    }
                }
            }
        }
    }

    // Sort scores by Student ID in ascending numerical order
    const sortedScores = Object.entries(scores).sort((a, b) => {
        const idA = parseInt(a[0], 10);
        const idB = parseInt(b[0], 10);
        return idA - idB;
    });

    // Generate CSV output
    let csvContent = "Student ID,Total Score\n";
    sortedScores.forEach(([studentId, totalScore]) => {
        csvContent += `${studentId},${totalScore}\n`;
    });

    // Get the current date and format it as YYYY-MM-DD
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    // Create a downloadable file with the date in the filename
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSCE_${formattedDate}.csv`; // Include the date in the filename
    a.textContent = 'Download Output CSV';

    const outputContainer = document.getElementById('output');
    outputContainer.innerHTML = ''; // Clear previous content
    outputContainer.appendChild(a);
});


