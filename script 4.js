document.getElementById('mergeForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const files = [
        document.getElementById('file1').files[0],
        document.getElementById('file2').files[0],
        document.getElementById('file3').files[0],
        document.getElementById('file4').files[0]
    ];

    const studentScores = {}; // { studentId: [score1, score2, score3, score4] }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        lines.shift(); // Remove header

        for (const line of lines) {
            const columns = line.split(',').map(col => col.trim());
            if (columns.length >= 2) {
                const studentId = columns[0];
                const score = parseFloat(columns[1]);

                if (!isNaN(score)) {
                    if (!studentScores[studentId]) {
                        studentScores[studentId] = [0, 0, 0, 0];
                    }
                    studentScores[studentId][i] = score;
                }
            }
        }
    }

    // Sort student IDs numerically
    const sortedEntries = Object.entries(studentScores).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    // Generate CSV
    let csvContent = "Student ID,Score 1,Score 2,Score 3,Score 4,Total Score\n";
    sortedEntries.forEach(([studentId, scores]) => {
        const total = scores.reduce((sum, s) => sum + s, 0);
        csvContent += `${studentId},${scores.join(',')},${total}\n`;
    });

    // Download
    const currentDate = new Date().toISOString().split('T')[0];
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OSCE_${currentDate}.csv`;
    a.textContent = 'Download Merged Scores CSV';

    const outputContainer = document.getElementById('output');
    outputContainer.innerHTML = '';
    outputContainer.appendChild(a);
});
