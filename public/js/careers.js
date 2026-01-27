// Client‑side script for career paths page
document.addEventListener('DOMContentLoaded', () => {
  const careerList = document.getElementById('careerList');
  const dailyJobContent = document.getElementById('dailyJobContent');
  let coursesMap = {};

  // Load courses to map id -> name for recommended courses display
  fetch('/api/courses')
    .then((res) => res.json())
    .then((courses) => {
      courses.forEach((c) => {
        coursesMap[c.id] = c.name;
      });
      loadDailyJobTitle();
      loadCareerPaths();
    });

  function loadDailyJobTitle() {
    fetch('/api/dailyJobTitle')
      .then((res) => res.json())
      .then((job) => {
        renderDailyJobTitle(job);
      })
      .catch((err) => {
        console.error('Error loading daily job title:', err);
      });
  }

  function renderDailyJobTitle(job) {
    dailyJobContent.innerHTML = '';
    
    const card = document.createElement('div');
    card.classList.add('daily-job-card');

    const title = document.createElement('h3');
    title.textContent = job.name;
    card.appendChild(title);

    const category = document.createElement('p');
    category.innerHTML = `<strong>Category:</strong> ${job.category}`;
    card.appendChild(category);

    const desc = document.createElement('p');
    desc.textContent = job.description;
    card.appendChild(desc);

    // Learning Curriculum
    const curriculumTitle = document.createElement('h4');
    curriculumTitle.textContent = 'Learning Curriculum';
    card.appendChild(curriculumTitle);

    const levels = ['fundamentals', 'novice', 'advanced', 'mastery'];
    levels.forEach((levelKey) => {
      const levelData = job.curriculum[levelKey];
      
      const levelSection = document.createElement('div');
      levelSection.classList.add('curriculum-level');

      const levelTitle = document.createElement('h5');
      levelTitle.textContent = `📚 ${levelData.level}`;
      levelSection.appendChild(levelTitle);

      const levelDesc = document.createElement('p');
      levelDesc.innerHTML = `<em>${levelData.description}</em>`;
      levelSection.appendChild(levelDesc);

      // Topics
      if (levelData.topics && levelData.topics.length > 0) {
        const topicsTitle = document.createElement('p');
        topicsTitle.innerHTML = '<strong>Topics:</strong>';
        levelSection.appendChild(topicsTitle);
        const topicsUl = document.createElement('ul');
        levelData.topics.forEach((topic) => {
          const li = document.createElement('li');
          li.textContent = topic;
          topicsUl.appendChild(li);
        });
        levelSection.appendChild(topicsUl);
      }

      // Certifications
      if (levelData.certifications && levelData.certifications.length > 0) {
        const certsTitle = document.createElement('p');
        certsTitle.innerHTML = '<strong>Recommended Certifications:</strong>';
        levelSection.appendChild(certsTitle);
        const certsUl = document.createElement('ul');
        levelData.certifications.forEach((cert) => {
          const li = document.createElement('li');
          li.textContent = cert;
          certsUl.appendChild(li);
        });
        levelSection.appendChild(certsUl);
      }

      // Timeframe
      if (levelData.timeframe) {
        const timeframe = document.createElement('p');
        timeframe.innerHTML = `<strong>Expected Timeframe:</strong> ${levelData.timeframe}`;
        levelSection.appendChild(timeframe);
      }

      // Experience (for mastery level)
      if (levelData.experience) {
        const experience = document.createElement('p');
        experience.innerHTML = `<strong>Experience Required:</strong> ${levelData.experience}`;
        levelSection.appendChild(experience);
      }

      card.appendChild(levelSection);
    });

    dailyJobContent.appendChild(card);
  }

  function loadCareerPaths() {
    fetch('/api/careerPaths')
      .then((res) => res.json())
      .then((paths) => {
        renderCareerPaths(paths);
      })
      .catch((err) => {
        console.error('Error loading career paths:', err);
      });
  }

  function renderCareerPaths(paths) {
    careerList.innerHTML = '';
    paths.forEach((path) => {
      const card = document.createElement('div');
      card.classList.add('career-card');

      const title = document.createElement('h3');
      title.textContent = path.name;
      card.appendChild(title);

      const desc = document.createElement('p');
      desc.textContent = path.description;
      card.appendChild(desc);

      // Salary
      const salary = document.createElement('p');
      salary.innerHTML = `<strong>Salary Range:</strong> Entry ${path.salaryRange.entry}, Mid ${path.salaryRange.mid}, Senior ${path.salaryRange.senior}`;
      card.appendChild(salary);

      // Growth
      const growth = document.createElement('p');
      growth.innerHTML = `<strong>Growth Rate:</strong> ${path.growthRate}`;
      card.appendChild(growth);

      // Skills list
      const skillsTitle = document.createElement('p');
      skillsTitle.innerHTML = '<strong>Key Skills:</strong>';
      card.appendChild(skillsTitle);
      const skillsUl = document.createElement('ul');
      path.skills.forEach((skill) => {
        const li = document.createElement('li');
        li.textContent = skill;
        skillsUl.appendChild(li);
      });
      card.appendChild(skillsUl);

      // Recommended courses
      if (path.recommendedCourses && path.recommendedCourses.length > 0) {
        const recTitle = document.createElement('p');
        recTitle.innerHTML = '<strong>Recommended Courses:</strong>';
        card.appendChild(recTitle);
        const recList = document.createElement('ul');
        path.recommendedCourses.forEach((courseId) => {
          const li = document.createElement('li');
          const cName = coursesMap[courseId] || courseId;
          li.textContent = cName;
          recList.appendChild(li);
        });
        card.appendChild(recList);
      }

      // Progression details
      const progTitle = document.createElement('p');
      progTitle.innerHTML = '<strong>Learning Progression:</strong>';
      card.appendChild(progTitle);
      const progList = document.createElement('ul');
      progList.classList.add('level-list');
      ['beginner','intermediate','advanced'].forEach((level) => {
        const li = document.createElement('li');
        const text = path.progression[level];
        li.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)} – ${text}`;
        progList.appendChild(li);
      });
      card.appendChild(progList);
      careerList.appendChild(card);
    });
  }
});