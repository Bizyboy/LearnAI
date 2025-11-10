// Client‑side script for courses page
document.addEventListener('DOMContentLoaded', () => {
  let coursesData = [];
  const coursesContainer = document.getElementById('coursesContainer');
  const categoryFilter = document.getElementById('categoryFilter');

  // Load courses from API
  fetch('/api/courses')
    .then((res) => res.json())
    .then((courses) => {
      coursesData = courses;
      populateFilterOptions(courses);
      renderCourses(courses);
    })
    .catch((err) => {
      console.error('Error loading courses:', err);
    });

  // Populate category filter with unique categories
  function populateFilterOptions(courses) {
    const categories = new Set(courses.map((c) => c.category));
    categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }

  // Render courses based on filter
  function renderCourses(courses) {
    coursesContainer.innerHTML = '';
    courses.forEach((course) => {
      // Create card
      const card = document.createElement('div');
      card.classList.add('card');

      // Title
      const title = document.createElement('h3');
      title.textContent = course.name;
      card.appendChild(title);

      // Provider and level
      const provider = document.createElement('div');
      provider.classList.add('provider');
      provider.textContent = `${course.provider} • ${course.level}`;
      card.appendChild(provider);

      // Description
      const desc = document.createElement('p');
      desc.classList.add('description');
      desc.textContent = course.description;
      card.appendChild(desc);

      // Duration and category
      const info = document.createElement('p');
      info.style.fontSize = '0.8rem';
      info.style.color = '#6b7280';
      info.textContent = `${course.category} • ${course.duration}`;
      card.appendChild(info);

      // Related career paths
      if (course.relatedCareerPaths && course.relatedCareerPaths.length > 0) {
        const careerInfo = document.createElement('p');
        careerInfo.style.fontSize = '0.8rem';
        careerInfo.style.color = '#475569';
        careerInfo.textContent = `Career paths: ${course.relatedCareerPaths.join(', ')}`;
        card.appendChild(careerInfo);
      }

      // Buttons
      const buttonGroup = document.createElement('div');
      buttonGroup.classList.add('button-group');
      // Start button
      const startBtn = document.createElement('button');
      startBtn.classList.add('btn', 'primary');
      startBtn.textContent = 'Start Course';
      startBtn.addEventListener('click', () => {
        updateProgress(course.id, 'start', course);
      });
      buttonGroup.appendChild(startBtn);
      // Complete button
      const completeBtn = document.createElement('button');
      completeBtn.classList.add('btn', 'success');
      completeBtn.textContent = 'Mark Completed';
      completeBtn.addEventListener('click', () => {
        updateProgress(course.id, 'complete', course);
      });
      buttonGroup.appendChild(completeBtn);

      // Link button
      const linkBtn = document.createElement('button');
      linkBtn.classList.add('btn', 'secondary');
      linkBtn.textContent = 'Open Course';
      linkBtn.addEventListener('click', () => {
        window.open(course.link, '_blank');
      });
      buttonGroup.appendChild(linkBtn);

      card.appendChild(buttonGroup);
      coursesContainer.appendChild(card);
    });
  }

  // Filter change handler
  categoryFilter.addEventListener('change', (e) => {
    const selected = e.target.value;
    if (selected === 'all') {
      renderCourses(coursesData);
    } else {
      const filtered = coursesData.filter((c) => c.category === selected);
      renderCourses(filtered);
    }
  });

  // Progress and badges stored in localStorage
  function getUserProgress() {
    const stored = localStorage.getItem('userProgress');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('Error parsing userProgress', err);
      }
    }
    return { inProgress: [], completed: [], badges: [] };
  }

  function saveUserProgress(progress) {
    localStorage.setItem('userProgress', JSON.stringify(progress));
  }

  function updateProgress(courseId, action, course) {
    const progress = getUserProgress();
    if (action === 'start') {
      if (!progress.inProgress.includes(courseId) && !progress.completed.includes(courseId)) {
        progress.inProgress.push(courseId);
        showToast(`${course.name} added to In Progress`);
      }
    } else if (action === 'complete') {
      // Move from inProgress to completed
      if (!progress.completed.includes(courseId)) {
        progress.completed.push(courseId);
        progress.inProgress = progress.inProgress.filter((id) => id !== courseId);
        showToast(`Great job! You completed ${course.name}`);
        awardBadgeForCourse(course);
      }
    }
    saveUserProgress(progress);
  }

  // Map course categories to badge images
  const badgeMap = {
    'AI Fundamentals': '/assets/badges/fundamentals_badge.png',
    'Generative AI': '/assets/badges/generative_badge.png'
  };

  function awardBadgeForCourse(course) {
    const badgeSrc = badgeMap[course.category];
    if (!badgeSrc) return;
    const progress = getUserProgress();
    // avoid duplicate badges
    if (!progress.badges.find((b) => b.courseId === course.id)) {
      progress.badges.push({ courseId: course.id, name: `${course.category} Badge`, img: badgeSrc });
      saveUserProgress(progress);
      showToast(`You earned a ${course.category} badge!`);
    }
  }

  // Simple toast notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#2563eb';
    toast.style.color = '#fff';
    toast.style.padding = '0.5rem 1rem';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
});