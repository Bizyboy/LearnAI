// Dashboard page script
document.addEventListener('DOMContentLoaded', () => {
  const progressSummary = document.getElementById('progressSummary');
  const progressBar = document.getElementById('progressBar');
  const badgesContainer = document.getElementById('badgesContainer');
  const careerSelect = document.getElementById('careerSelect');
  const generateResumeBtn = document.getElementById('generateResumeBtn');
  const resumeOutput = document.getElementById('resumeOutput');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const pathSelect = document.getElementById('pathSelect');
  const roadmapDisplay = document.getElementById('roadmapDisplay');

  let courses = [];
  let careerPaths = [];
  const roadmapFlows = {
    'AI Fundamentals': [
      'Start with “CS50’s Introduction to AI with Python.”',
      'Take “AI for Everyone” to understand AI’s social and strategic impact.',
      'Advance to core machine learning techniques with “Andrew Ng’s Machine Learning.”',
      'Choose your specialization: vision, language or generative AI.'
    ],
    'Machine Learning': [
      'Complete “Andrew Ng’s Machine Learning” to master foundational algorithms.',
      'Learn deep learning basics with MIT’s “Introduction to Deep Learning.”',
      'Apply ML in domains such as computer vision (CS231n) or NLP (CS224n).',
      'Explore reinforcement learning (CS234) for sequential decision problems.'
    ],
    'Deep Learning': [
      'Begin with “Introduction to Deep Learning” (MIT 6.S191).',
      'Study CNN architectures in “CS231n.”',
      'Explore NLP models in “CS224n.”',
      'Experiment with generative models using the generative AI course.'
    ],
    'Computer Vision': [
      'Learn deep learning fundamentals (6.S191).',
      'Dive into vision architectures in “CS231n.”',
      'Practice implementing CNNs and computer vision projects.',
      'Explore advanced topics like detection, segmentation and 3D vision.'
    ],
    'NLP': [
      'Study machine learning basics.',
      'Learn about word embeddings and recurrent networks.',
      'Take Stanford’s “CS224n” for deep NLP techniques.',
      'Apply large language models and transformers.'
    ],
    'Reinforcement Learning': [
      'Understand Markov decision processes and dynamic programming.',
      'Take “CS234: Reinforcement Learning” to implement RL algorithms.',
      'Combine deep learning with RL techniques for complex tasks.',
      'Experiment with multi‑agent and hierarchical RL.'
    ],
    'Generative AI': [
      'Understand basics of generative models.',
      'Take the “Introduction to Generative AI” course.',
      'Learn about VAEs, GANs and diffusion models.',
      'Apply generative AI in text, image and music domains.'
    ],
    'Ethics': [
      'Take the “Ethics of AI” course to learn about responsible AI.',
      'Understand fairness, transparency and accountability.',
      'Participate in discussions on societal impacts of AI.',
      'Develop guidelines for ethical AI development and deployment.'
    ],
    'Career Development': [
      'Take “AI for Everyone” to learn how to communicate AI ideas.',
      'Explore multiple courses in your area of interest.',
      'Build projects and showcase them in your resume.',
      'Network with professionals and contribute to the community.'
    ]
  };

  // Load courses and career paths
  Promise.all([fetch('/api/courses').then((res) => res.json()), fetch('/api/careerPaths').then((res) => res.json())])
    .then(([courseData, careerData]) => {
      courses = courseData;
      careerPaths = careerData;
      initDashboard();
    })
    .catch((err) => console.error('Error loading data', err));

  function initDashboard() {
    updateProgressDisplay();
    updateBadgesDisplay();
    populateCareerSelect();
    populatePathSelect();
  }

  function updateProgressDisplay() {
    const progress = getUserProgress();
    const totalCourses = courses.length;
    const completed = progress.completed.length;
    const inProgress = progress.inProgress.length;
    const percent = totalCourses ? Math.round((completed / totalCourses) * 100) : 0;
    progressSummary.textContent = `Completed ${completed} of ${totalCourses} courses • ${inProgress} in progress`;
    progressBar.style.width = percent + '%';
  }

  function updateBadgesDisplay() {
    const progress = getUserProgress();
    badgesContainer.innerHTML = '';
    if (progress.badges.length === 0) {
      badgesContainer.textContent = 'No badges yet. Complete courses to earn badges!';
      return;
    }
    progress.badges.forEach((badge) => {
      const img = document.createElement('img');
      img.src = badge.img;
      img.alt = badge.name;
      badgesContainer.appendChild(img);
    });
  }

  function populateCareerSelect() {
    careerSelect.innerHTML = '';
    careerPaths.forEach((path) => {
      const option = document.createElement('option');
      option.value = path.id;
      option.textContent = path.name;
      careerSelect.appendChild(option);
    });
  }

  function populatePathSelect() {
    pathSelect.innerHTML = '';
    Object.keys(roadmapFlows).forEach((key) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      pathSelect.appendChild(option);
    });
    pathSelect.addEventListener('change', () => {
      displayRoadmap(pathSelect.value);
    });
    // default
    displayRoadmap(pathSelect.value || Object.keys(roadmapFlows)[0]);
  }

  function displayRoadmap(key) {
    roadmapDisplay.innerHTML = '';
    if (!key || !roadmapFlows[key]) return;
    const flow = roadmapFlows[key];
    flow.forEach((step, index) => {
      const div = document.createElement('div');
      div.textContent = step;
      roadmapDisplay.appendChild(div);
      if (index < flow.length - 1) {
        const arrow = document.createElement('div');
        arrow.textContent = '↓';
        arrow.style.textAlign = 'center';
        roadmapDisplay.appendChild(arrow);
      }
    });
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

  // Resume generation logic
  generateResumeBtn.addEventListener('click', () => {
    const pathId = careerSelect.value;
    const path = careerPaths.find((p) => p.id === pathId);
    const progress = getUserProgress();
    const completedCourses = courses.filter((c) => progress.completed.includes(c.id));
    // Build resume text
    let resume = `Resume – AI Learning Hub\n\n`;
    resume += `Objective:\n  Aspiring ${path.name} seeking opportunities to apply AI expertise.\n\n`;
    resume += `Completed Courses:\n`;
    if (completedCourses.length === 0) {
      resume += '  (No courses completed yet)\n';
    } else {
      completedCourses.forEach((c) => {
        resume += `  • ${c.name} – ${c.provider}\n`;
      });
    }
    resume += `\nBadges Earned:\n`;
    if (progress.badges.length === 0) {
      resume += '  (No badges earned yet)\n';
    } else {
      progress.badges.forEach((b) => {
        resume += `  • ${b.name}\n`;
      });
    }
    resume += `\nKey Skills:\n`;
    path.skills.forEach((skill) => {
      resume += `  • ${skill}\n`;
    });
    resume += '\nProjects:\n  • Describe your AI projects here.\n';
    resumeOutput.textContent = resume;
    resumeOutput.style.display = 'block';
    // Provide download link
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume.txt';
    link.textContent = 'Download Resume';
    link.className = 'btn secondary';
    // Remove previous download link if exists
    const existing = resumeOutput.parentElement.querySelector('a');
    if (existing) existing.remove();
    resumeOutput.parentElement.appendChild(link);
  });

  // Mentor chat in dashboard
  sendChatBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });

  function appendChatMessage(sender, text) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(sender === 'user' ? 'user' : 'bot');
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getDashboardChat() {
    const stored = localStorage.getItem('dashboardChat');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  function saveDashboardChat(chat) {
    localStorage.setItem('dashboardChat', JSON.stringify(chat));
  }

  // Load existing chat
  (function loadInitialChat() {
    const chat = getDashboardChat();
    chat.forEach((msg) => appendChatMessage(msg.sender, msg.text));
  })();

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    appendChatMessage('user', text);
    const chat = getDashboardChat();
    chat.push({ sender: 'user', text });
    // Generate reply
    setTimeout(() => {
      const reply = mentorResponse(text);
      appendChatMessage('bot', reply);
      chat.push({ sender: 'bot', text: reply });
      saveDashboardChat(chat);
    }, 400);
  }

  function mentorResponse(message) {
    const lower = message.toLowerCase();
    const progress = getUserProgress();
    if (/\b(hi|hello|hey)\b/.test(lower)) {
      return 'Hello! How is your AI learning journey going today?';
    }
    if (/thank/.test(lower)) {
      return "You're welcome! Keep pushing toward your goals.";
    }
    if (/recommend|suggest|next course/i.test(lower)) {
      // Suggest a course the user hasn’t completed
      for (const course of courses) {
        if (!progress.completed.includes(course.id)) {
          return `How about trying “${course.name}”? It covers ${course.category.toLowerCase()} topics.`;
        }
      }
      return 'You have completed all available courses! Consider revisiting material or working on projects.';
    }
    if (/progress|completed|how am i doing/i.test(lower)) {
      return `You have completed ${progress.completed.length} courses and have ${progress.inProgress.length} in progress. Keep it up!`;
    }
    if (/badge|badges/i.test(lower)) {
      return `You have earned ${progress.badges.length} badge(s). View them in your dashboard!`;
    }
    // Fallback
    return 'Feel free to ask about your progress, course recommendations or career advice!';
  }
});