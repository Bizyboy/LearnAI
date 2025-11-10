// Chat mentor page script
document.addEventListener('DOMContentLoaded', () => {
  const threadListEl = document.getElementById('threadList');
  const threadMessagesEl = document.getElementById('threadMessages');
  const threadInput = document.getElementById('threadInput');
  const threadSendBtn = document.getElementById('threadSendBtn');
  let currentThreadId = null;
  let careerPaths = [];
  let coursesMap = {};

  // Load courses first to map recommended courses names
  fetch('/api/courses')
    .then((res) => res.json())
    .then((courses) => {
      courses.forEach((c) => {
        coursesMap[c.id] = c;
      });
      return fetch('/api/careerPaths');
    })
    .then((res) => res.json())
    .then((paths) => {
      careerPaths = paths;
      populateThreads();
    })
    .catch((err) => console.error('Error loading data', err));

  function populateThreads() {
    threadListEl.innerHTML = '';
    careerPaths.forEach((path) => {
      const li = document.createElement('li');
      li.textContent = path.name;
      li.dataset.threadId = path.id;
      li.addEventListener('click', () => {
        selectThread(path.id);
      });
      threadListEl.appendChild(li);
    });
    // Select first thread by default
    if (careerPaths.length > 0) {
      selectThread(careerPaths[0].id);
    }
  }

  function selectThread(threadId) {
    currentThreadId = threadId;
    // Highlight active thread
    Array.from(threadListEl.children).forEach((li) => {
      li.classList.toggle('active', li.dataset.threadId === threadId);
    });
    loadThreadMessages();
  }

  function loadThreadMessages() {
    threadMessagesEl.innerHTML = '';
    if (!currentThreadId) return;
    const threads = getChatThreads();
    const messages = threads[currentThreadId] || [];
    messages.forEach((msg) => {
      appendMessage(msg.sender, msg.text);
    });
  }

  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(sender === 'user' ? 'user' : 'bot');
    div.textContent = text;
    threadMessagesEl.appendChild(div);
    threadMessagesEl.scrollTop = threadMessagesEl.scrollHeight;
  }

  function getChatThreads() {
    const stored = localStorage.getItem('chatThreads');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('Error parsing chatThreads', err);
      }
    }
    return {};
  }

  function saveChatThreads(threads) {
    localStorage.setItem('chatThreads', JSON.stringify(threads));
  }

  function mentorResponseForCategory(message, pathId) {
    const lower = message.toLowerCase();
    const path = careerPaths.find((p) => p.id === pathId);
    // Greetings
    if (/\b(hi|hello|hey)\b/.test(lower)) {
      return `Hello! Let's talk about the ${path.name} path. How can I assist you today?`;
    }
    // Gratitude
    if (/thank/.test(lower)) {
      return "You're welcome! Keep up the great work.";
    }
    // Asking for recommendation
    if (/\b(recommend|suggest|next course|what should i learn)\b/.test(lower)) {
      const suggestion = generateCourseSuggestion(path);
      return suggestion;
    }
    // Asking about progress
    if (/progress|completed|how am i doing/.test(lower)) {
      const progress = getUserProgress();
      return `You have ${progress.completed.length} courses completed and ${progress.inProgress.length} in progress. Keep going!`;
    }
    // Provide general info
    if (/responsib|role|what do/i.test(lower)) {
      return `As a ${path.name}, you would ${path.description.toLowerCase()}`;
    }
    // Fallback generic response
    return `That's an interesting question! As a ${path.name}, continue building your skills in ${path.skills.slice(0, 3).join(', ')} and explore our recommended courses.`;
  }

  function generateCourseSuggestion(path) {
    // Determine which recommended course user has not completed
    const progress = getUserProgress();
    const courseIds = path.recommendedCourses;
    for (const id of courseIds) {
      if (!progress.completed.includes(id)) {
        const course = coursesMap[id];
        if (course) {
          return `I recommend taking “${course.name}” to advance your ${path.name} skills.`;
        }
      }
    }
    return 'You have completed all recommended courses for this path! Consider exploring other specializations.';
  }

  function getUserProgress() {
    const stored = localStorage.getItem('userProgress');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        return { inProgress: [], completed: [], badges: [] };
      }
    }
    return { inProgress: [], completed: [], badges: [] };
  }

  // Send chat button handler
  threadSendBtn.addEventListener('click', sendMessage);
  threadInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    if (!currentThreadId) return;
    const text = threadInput.value.trim();
    if (!text) return;
    threadInput.value = '';
    appendMessage('user', text);
    saveMessage(currentThreadId, 'user', text);
    // Generate mentor response after slight delay
    setTimeout(() => {
      const reply = mentorResponseForCategory(text, currentThreadId);
      appendMessage('bot', reply);
      saveMessage(currentThreadId, 'bot', reply);
    }, 500);
  }

  function saveMessage(threadId, sender, text) {
    const threads = getChatThreads();
    if (!threads[threadId]) {
      threads[threadId] = [];
    }
    threads[threadId].push({ sender, text });
    saveChatThreads(threads);
  }
});