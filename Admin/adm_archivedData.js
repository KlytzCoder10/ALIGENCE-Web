// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC197CiJGypDz6qJxD0xPrBhrN0u0tTqH4",
    authDomain: "aligence-4587c.firebaseapp.com",
    databaseURL: "https://aligence-4587c-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "aligence-4587c",
    storageBucket: "aligence-4587c.appspot.com",
    messagingSenderId: "483459083057",
    appId: "1:483459083057:android:9f97de59a19f3a8968de10"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Variables to store the selected section and dropdown elements
let selectedSection = "";
const sectionButton = document.getElementById('sectionButton');
const sectionText = document.getElementById('sectionText');

// Function to select a section and update the button text
function selectSection(section) {
    selectedSection = section;
    sectionText.textContent = section;  // Update button text to show the selected category
    
    renderTable();  // Call the function to render the correct table
}

// Function to render the correct table based on the selected section
function renderTable() {
    document.getElementById('studentsTable').style.display = 'none';
    document.getElementById('teachersTable').style.display = 'none';
    
    if (selectedSection === 'Students') {
        document.getElementById('studentsTable').style.display = 'block';
    } else if (selectedSection === 'Teachers') {
        document.getElementById('teachersTable').style.display = 'block';
    }
}

// Function to load archived students and render them in the table
function loadArchivedStudents() {
    const archivedStudentsRef = database.ref('archived_students');

    archivedStudentsRef.once('value', snapshot => {
        const studentsTableBody = document.querySelector('#studentsTable tbody');
        studentsTableBody.innerHTML = ''; // Clear the table body

        let index = 1;
        snapshot.forEach(childSnapshot => {
            const student = childSnapshot.val();
            
            // Create a new row for each student
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td>${student.studentNum || '-'}</td>
                <td>${student.email || '-'}</td>
                <td>${student.lastName || '-'}</td>
                <td>${student.firstName || '-'}</td>
                <td>${student.section || '-'}</td>
                <td>
                    <button onclick="restoreStudent('${childSnapshot.key}')">Restore</button>
                    <button onclick="deleteArchivedStudent('${childSnapshot.key}')">Delete Permanently</button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });

        // If no archived students, display a message
        if (!snapshot.exists()) {
            studentsTableBody.innerHTML = "<tr><td colspan='7'>No archived students found.</td></tr>";
        }
    });
}

// Function to load archived teachers and render them in the table
function loadArchivedTeachers() {
    const archivedTeachersRef = database.ref('archived_teachers');

    archivedTeachersRef.once('value', snapshot => {
        const teachersTableBody = document.querySelector('#teachersTable tbody');
        teachersTableBody.innerHTML = ''; // Clear the table body

        let index = 1;
        snapshot.forEach(childSnapshot => {
            const teacher = childSnapshot.val();
            
            // Create a new row for each teacher
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td>${teacher.teacherNum || '-'}</td>
                <td>${teacher.email || '-'}</td>
                <td>${teacher.lastName || '-'}</td>
                <td>${teacher.firstName || '-'}</td>
                <td>
                    <button onclick="restoreTeacher('${childSnapshot.key}')">Restore</button>
                    <button onclick="deleteArchivedTeacher('${childSnapshot.key}')">Delete Permanently</button>
                </td>
            `;
            teachersTableBody.appendChild(row);
        });

        // If no archived teachers, display a message
        if (!snapshot.exists()) {
            teachersTableBody.innerHTML = "<tr><td colspan='7'>No archived teachers found.</td></tr>";
        }
    });
}

// Function to restore an archived student to the main users section
function restoreStudent(studentKey) {
    const archivedStudentRef = database.ref('archived_students/' + studentKey);

    archivedStudentRef.once('value').then(snapshot => {
        const studentData = snapshot.val();

        if (studentData) {
            // Move student data back to "users" node
            database.ref('users/' + studentKey).set(studentData)
                .then(() => {
                    // Remove from "archived_students" after restoring
                    return archivedStudentRef.remove();
                })
                .then(() => {
                    alert("Student restored successfully.");
                    loadArchivedStudents(); // Refresh the archived students table
                })
                .catch(error => {
                    alert("Error restoring student: " + error.message);
                });
        } else {
            alert("Student data not found in archive.");
        }
    }).catch(error => {
        alert("Failed to retrieve archived student data: " + error.message);
    });
}

// Function to restore an archived teacher to the main users section
function restoreTeacher(teacherKey) {
    const archivedTeacherRef = database.ref('archived_teachers/' + teacherKey);

    archivedTeacherRef.once('value').then(snapshot => {
        const teacherData = snapshot.val();

        if (teacherData) {
            // Move teacher data back to "users" node
            database.ref('users/' + teacherKey).set(teacherData)
                .then(() => {
                    // Remove from "archived_teachers" after restoring
                    return archivedTeacherRef.remove();
                })
                .then(() => {
                    alert("Teacher restored successfully.");
                    loadArchivedTeachers(); // Refresh the archived teachers table
                })
                .catch(error => {
                    alert("Error restoring teacher: " + error.message);
                });
        } else {
            alert("Teacher data not found in archive.");
        }
    }).catch(error => {
        alert("Failed to retrieve archived teacher data: " + error.message);
    });
}

// Function to delete an archived student permanently
function deleteArchivedStudent(studentKey) {
    if (confirm("Are you sure you want to delete this archived student permanently?")) {
        const archivedStudentRef = database.ref('archived_students/' + studentKey);

        archivedStudentRef.remove()
            .then(() => {
                alert("Archived student deleted permanently.");
                loadArchivedStudents(); // Refresh the archived students table
            })
            .catch(error => {
                alert("Failed to delete archived student: " + error.message);
            });
    }
}

// Function to delete an archived teacher permanently
function deleteArchivedTeacher(teacherKey) {
    if (confirm("Are you sure you want to delete this archived teacher permanently?")) {
        const archivedTeacherRef = database.ref('archived_teachers/' + teacherKey);

        archivedTeacherRef.remove()
            .then(() => {
                alert("Archived teacher deleted permanently.");
                loadArchivedTeachers(); // Refresh the archived teachers table
            })
            .catch(error => {
                alert("Failed to delete archived teacher: " + error.message);
            });
    }
}

// Search Input
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const studentsTableBody = document.querySelector("#studentsTable tbody");
    const teachersTableBody = document.querySelector("#teachersTable tbody");

    // Listen for input in the search box
    searchInput.addEventListener("input", function() {
        const query = searchInput.value.toLowerCase();
        filterTable(studentsTableBody, query);
        filterTable(teachersTableBody, query);
    });

    function filterTable(tableBody, query) {
        // Loop through all rows in the specified table
        Array.from(tableBody.getElementsByTagName("tr")).forEach(row => {
            const cells = row.getElementsByTagName("td");
            let matches = false;

            // Check each cell in the row to see if it matches the query
            for (const cell of cells) {
                if (cell.textContent.toLowerCase().includes(query)) {
                    matches = true;
                    break;
                }
            }

            // Show or hide the row based on if it matches
            row.style.display = matches ? "" : "none";
        });
    }
});


// Load archived students and teachers when the page loads
window.onload = function() {
    loadArchivedStudents();
    loadArchivedTeachers();
};
