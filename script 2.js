// Topics for each chapter
const topics = {
  1: [
    { title: 'Topic 1', url: 'topics/topic7.txt' },
    { title: 'Topic 2', url: 'topics/topic3.mp4' },
    { title: 'Topic 3', url: 'text1.txt' },
    { title: 'Topic 4', url: 'text1.txt' }
  ],
  2: [
    { title: 'Testsample to show the topic', url: 'pdf2.pdf' },
    { title: 'Topic 2', url: 'video2.mp4' },
    { title: 'Topic 3', url: 'text2.txt' }
  ],
  3: [
    { title: 'Topic 1', url: 'pdf3.pdf' },
    { title: 'Topic 2', url: 'video3.mp4' },
    { title: 'Topic 3', url: 'text3.txt' }
  ],
  4: [
    { title: 'Topic 1', url: 'topics/topic9.pdf' },
    { title: 'Topic 2', url: 'video4.mp4' },
    { title: 'Topic 3', url: 'text4.txt' }
  ],
  // Add topics for all chapters...
  12: [
    { title: 'Cardiac cycle', url: 'https://www.youtube.com/watch?v=IS9TD9fHFv0&t=59s' },
    { title: 'Topic 2', url: 'video12.mp4' },
    { title: 'Topic 3', url: 'text12.txt' }
  ]
};

// Function to show topics for a specific chapter
function showTopics(chapterNumber) {
  const topicsContainer = document.getElementById('topics-container');
  const topicsDiv = document.getElementById('topics');
  const chapterTitle = document.getElementById('chapter-title');

  // Update title
  chapterTitle.textContent = `Topics for Chapter ${chapterNumber}`;

  // Clear previous topics
  topicsDiv.innerHTML = '';

  // Load new topics
  topics[chapterNumber].forEach(topic => {
    const button = document.createElement('button');
    button.textContent = topic.title;
    button.classList.add('topic-btn');
    button.onclick = () => openContent(topic.url);
    topicsDiv.appendChild(button);
  });

  // Show topics and hide chapter buttons
  document.getElementById('chapter-buttons').classList.add('hidden');
  topicsContainer.classList.remove('hidden');
}

// Function to go back to the chapter selection
function goBack() {
  document.getElementById('topics-container').classList.add('hidden');
  document.getElementById('chapter-buttons').classList.remove('hidden');
}

// Function to open content in a new window
function openContent(url) {
  window.open(url, '_blank');
}
