// Client‑side script for career paths page
document.addEventListener('DOMContentLoaded', () => {
  const careerList = document.getElementById('careerList');
  let coursesMap = {};

  // Load courses to map id -> name for recommended courses display
  fetch('/api/courses')
    .then((res) => res.json())
    .then((courses) => {
      courses.forEach((c) => {
        coursesMap[c.id] = c.name;
      });
      loadCareerPaths();
    });

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