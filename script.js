//store all courses loaded from JSON
let courses = [];
//store courses after filtering
let filteredCourses = [];

//class representing a single course object
class Course {
  constructor({id, title, department, level, credits, instructor, description, semester}) {
    //course code or identifier
    this.id = id || "Unknown ID";
    //course title
    this.title = title || "Untitled";
    //academic department
    this.department = department || "Unknown Department";
    //course code level
    this.level = level ?? "—";
    //credit value
    this.credits = credits ?? "—";
    //instructor name
    this.instructor = instructor || "TBA";
    //course description
    this.description = description || "No description available.";
    //semester term
    this.semester = semester || "Unscheduled";
  }
  //label used in course list display
  getLabel() { return this.id; }
}

//display an error message in the UI
function showError(message) {
  const errorBox = document.getElementById("error-box");
  errorBox.textContent = message;
  errorBox.style.display = message ? "block" : "none";
}

//handle file upload and parse JSON data
document.getElementById("course-file").addEventListener("change", function(event) {
  const file = event.target.files[0];
  //no file selected
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      //parse file contents
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("JSON root must be an array");

      //convert raw objects into Course instances
      courses = data.map(c => new Course(c));
      filteredCourses = courses;

      //populate dropdown filters after courses are loaded
      populateFilters();
      //render initial course list
      renderCourseList(filteredCourses);
      //clear any previous error messages
      showError("");
    } catch (err) {
      //invalid JSON format
      showError("Invalid JSON file format.");
      console.error("JSON parse error:", err);
    }
  };
  reader.onerror = function() {
    //file read error
    showError("Failed to read file.");
  };
  reader.readAsText(file);
});

//build dropdown filter options dynamically from loaded course data
function populateFilters() {
  fillSelect("department-filter", [...new Set(courses.map(c => c.department))]);
  fillSelect("level-filter", [...new Set(courses.map(c => c.level))]);
  fillSelect("credits-filter", [...new Set(courses.map(c => c.credits))]);
  fillSelect("instructor-filter", [...new Set(courses.map(c => c.instructor).filter(Boolean))]);

  //attach change listeners so filters trigger re-filtering
  document.querySelectorAll("#controls-section select").forEach(select => {
    select.addEventListener("change", applyFilters);
  });
}

//helper to fill a <select> element with options
function fillSelect(id, values) {
  const select = document.getElementById(id);
  //always include "All" as the default option
  select.innerHTML = "<option value=''>All</option>";
  values.forEach(v => {
    const option = document.createElement("option");
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
}

//apply filtering logic based on current dropdown selections
function applyFilters() {
  const dept = document.getElementById("department-filter").value;
  const level = document.getElementById("level-filter").value;
  const credits = document.getElementById("credits-filter").value;
  const instructor = document.getElementById("instructor-filter").value;

  //keep only courses that match all selected criteria
  filteredCourses = courses.filter(c => {
    return (!dept || c.department === dept) &&
           (!level || c.level == level) &&
           (!credits || c.credits == credits) &&
           (!instructor || c.instructor === instructor);
  });

  //after filtering, apply sorting
  applySort();
}

//apply sorting logic based on selected sort option
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

//compare two semester strings
function compareSemester(s1, s2) {
  const order = { "Winter": 1, "Spring": 2, "Summer": 3, "Fall": 4 };
  const [term1, year1] = s1.split(" ");
  const [term2, year2] = s2.split(" ");
  const y1 = parseInt(year1), y2 = parseInt(year2);
  //sort by year first
  if (y1 !== y2) return y1 - y2;
  //if same year, sort by term order
  return order[term1] - order[term2];
}

//render the list of courses in the UI
function renderCourseList(list) {
  const courseList = document.getElementById("course-list");
  courseList.innerHTML = "";
  list.forEach(course => {
    const item = document.createElement("div");
    item.textContent = course.getLabel();
    item.classList.add("course-item");
    item.addEventListener("click", () => {
      //highlight selected course
      document.querySelectorAll(".course-item").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");
      //show details in right panel
      showCourseDetails(course);
    });
    courseList.appendChild(item);
  });
}

//display full details of a selected course in the details panel
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
