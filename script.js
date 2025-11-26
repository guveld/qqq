let courses = [];
let filteredCourses = [];

class Course {
  constructor({id, title, department, level, credits, instructor, description, semester}) {
    this.id = id || "Unknown ID";
    this.title = title || "Untitled";
    this.department = department || "Unknown Department";
    this.level = level ?? "—";
    this.credits = credits ?? "—";
    this.instructor = instructor || "TBA";
    this.description = description || "No description available.";
    this.semester = semester || "Unscheduled";
  }
  getLabel() { return this.id; }
}

function showError(message) {
  const errorBox = document.getElementById("error-box");
  errorBox.textContent = message;
  errorBox.style.display = message ? "block" : "none";
}

document.getElementById("course-file").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("JSON root must be an array");

      courses = data.map(c => new Course(c));
      filteredCourses = courses;

      populateFilters();
      renderCourseList(filteredCourses);
      showError(""); // clear any previous error
    } catch (err) {
      showError("Invalid JSON file format.");
      console.error("JSON parse error:", err);
    }
  };
  reader.onerror = function() {
    showError("Failed to read file.");
  };
  reader.readAsText(file);
});

function populateFilters() {
  fillSelect("department-filter", [...new Set(courses.map(c => c.department))]);
  fillSelect("level-filter", [...new Set(courses.map(c => c.level))]);
  fillSelect("credits-filter", [...new Set(courses.map(c => c.credits))]);
  fillSelect("instructor-filter", [...new Set(courses.map(c => c.instructor).filter(Boolean))]);

  document.querySelectorAll("#controls-section select").forEach(select => {
    select.addEventListener("change", applyFilters);
  });
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  select.innerHTML = "<option value=''>All</option>";
  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
}

function applyFilters() {
  const dept = document.getElementById("department-filter").value;
  const level = document.getElementById("level-filter").value;
  const credits = document.getElementById("credits-filter").value;
  const instructor = document.getElementById("instructor-filter").value;

  filteredCourses = courses.filter(c => {
    return (!dept || c.department === dept) &&
           (!level || c.level == level) &&
           (!credits || c.credits == credits) &&
           (!instructor || c.instructor === instructor);
  });

  applySort();
}

function applySort() {
  const sortBy = document.getElementById("sort-by").value;
  filteredCourses.sort((a, b) => {
    switch (sortBy) {
      case "id-asc": return a.id.localeCompare(b.id);
      case "id-desc": return b.id.localeCompare(a.id);
      case "title-asc": return a.title.localeCompare(b.title);
      case "title-desc": return b.title.localeCompare(a.title);
      case "semester-asc": return compareSemester(a.semester, b.semester);
      case "semester-desc": return compareSemester(b.semester, a.semester);
      default: return 0;
    }
  });
  renderCourseList(filteredCourses);
}

function compareSemester(s1, s2) {
  const order = { "Winter": 1, "Spring": 2, "Summer": 3, "Fall": 4 };
  const [term1, year1] = s1.split(" ");
  const [term2, year2] = s2.split(" ");
  const y1 = parseInt(year1), y2 = parseInt(year2);
  if (y1 !== y2) return y1 - y2;
  return order[term1] - order[term2];
}

function renderCourseList(list) {
  const courseList = document.getElementById("course-list");
  courseList.innerHTML = "";
  list.forEach(course => {
    const item = document.createElement("div");
    item.textContent = course.getLabel();
    item.classList.add("course-item");
    item.addEventListener("click", () => {
      document.querySelectorAll(".course-item").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");
      showCourseDetails(course);
    });
    courseList.appendChild(item);
  });
}

function showCourseDetails(course) {
  document.getElementById("course-code").textContent = course.id;
  document.getElementById("course-title").textContent = "Title: " + course.title;
  document.getElementById("course-department").textContent = "Department: " + course.department;
  document.getElementById("course-level").textContent = "Level: " + course.level;
  document.getElementById("course-credits").textContent = "Credits: " + course.credits;
  document.getElementById("course-instructor").textContent = "Instructor: " + course.instructor;
  document.getElementById("course-semester").textContent = "Semester: " + course.semester;
  document.getElementById("course-description").textContent = course.description;
}