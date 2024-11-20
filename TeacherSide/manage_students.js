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

// Variables for modal elements and form inputs
const studentModal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const studentForm = document.getElementById('studentForm');
const closeModal = document.querySelector('.close');
const studentNumInput = document.getElementById('studentNum');
const emailInput = document.getElementById('email');
const lastNameInput = document.getElementById('lastName');
const firstNameInput = document.getElementById('firstName');
const sectionText = document.getElementById('sectionText');
const modalSectionText = document.getElementById('modalSectionText');

// Variables for section selection
let editKey = null;
let selectedSection = "All";

// Function to render the students table (manage students)
function renderTable() {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = ""; // Clear previous data

    // Fetch and sort students by lastName (surname)
    database.ref('users').orderByChild('lastName').once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                tableBody.innerHTML = "<tr><td colspan='7'>No students found.</td></tr>";
                return;
            }

            let index = 1;
            snapshot.forEach((childSnapshot) => {
                const student = childSnapshot.val();

                // Filter students by selected section
                if (student.role === "student" && (selectedSection === "All" || student.section === selectedSection)) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index++}</td>
                        <td>${student.studentNum}</td>
                        <td>${student.lastName}</td>
                        <td>${student.firstName}</td>
                        <td>${student.section}</td>
                        <td>${student.email}</td>
                        <td>
                            <button onclick="openModal(true, '${childSnapshot.key}')">✏️</button>
                            <button onclick="deleteStudent('${childSnapshot.key}')">🗑️</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching students:", error);
            tableBody.innerHTML = "<tr><td colspan='7'>Error loading data.</td></tr>";
        });
}

// Function to render the students table (monitor students)
function renderMonitorTable() {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = ""; // Clear previous data

    database.ref('users').orderByChild('role').equalTo('student').once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                tableBody.innerHTML = "<tr><td colspan='5'>No students found.</td></tr>";
                return;
            }

            // Convert snapshot data to an array and sort by lastName alphabetically
            const students = [];
            snapshot.forEach((childSnapshot) => {
                const student = childSnapshot.val();
                students.push(student);
            });

            // Sort students by last name alphabetically
            students.sort((a, b) => a.lastName.localeCompare(b.lastName));

            let index = 1;
            students.forEach((student) => {
                // Filter students by section
                if (selectedSection !== "All" && student.section !== selectedSection) {
                    return;
                }

                // Filter students by status
                if (selectedStatus !== "All" && student.status !== selectedStatus) {
                    return;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index++}</td>
                    <td>${student.lastName}</td>
                    <td>${student.firstName}</td>
                    <td>${student.section}</td>
                    <td>${student.status}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error fetching students:", error);
            tableBody.innerHTML = "<tr><td colspan='5'>Error loading data.</td></tr>";
        });
}

// Function to open the modal
function openModal(isEdit = false, studentKey = null) {
    if (isEdit) {
        modalTitle.textContent = "Edit Student";
        database.ref('users/' + studentKey).once('value').then((snapshot) => {
            const student = snapshot.val();
            if (student.role === "student") {
                studentNumInput.value = student.studentNum;
                emailInput.value = student.email;
                lastNameInput.value = student.lastName;
                firstNameInput.value = student.firstName;
                modalSectionText.textContent = student.section;
            }
        });
        editKey = studentKey;
    } else {
        modalTitle.textContent = "Add Student";
        studentForm.reset();
        modalSectionText.textContent = "Select Section";
        editKey = null;
    }
    studentModal.style.display = "flex";
}

// Function to select a section in the main dropdown
function selectSection(section) {
    sectionText.textContent = section;
    selectedSection = section;
    renderTable();
}

// Function to select a section in the modal dropdown
function selectModalSection(section) {
    modalSectionText.textContent = section;
}

// Close modal function
function closeModalFn() {
    studentModal.style.display = "none";
}

// Function to save or add student data
function saveStudent(e) {
    e.preventDefault();
    const studentNum = studentNumInput.value.trim();
    const email = emailInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const section = modalSectionText.textContent.trim();

    if (section === "Select Section") {
        alert("Please select a section.");
        return;
    }

    const studentData = {
        studentNum: studentNum,
        email: email,
        lastName: lastName,
        firstName: firstName,
        section: section,
        role: "student"
    };

    if (editKey) {
        database.ref('users/' + editKey).update(studentData)
            .then(() => {
                alert("Student updated successfully.");
                closeModalFn();
                renderTable();
            })
            .catch((error) => {
                alert("Failed to update student: " + error.message);
            });
    } else {
        const newStudentRef = database.ref('users').push();
        newStudentRef.set(studentData)
            .then(() => {
                alert("Student added successfully.");
                closeModalFn();
                renderTable();
            })
            .catch((error) => {
                alert("Failed to add student: " + error.message);
            });
    }
}

// Restrict studentNum input to numbers only
studentNumInput.addEventListener('input', () => {
    studentNumInput.value = studentNumInput.value.replace(/\D/g, '');
});

// Function to delete a student
function deleteStudent(studentKey) {
    if (confirm("Are you sure you want to delete this student?")) {
        database.ref('users/' + studentKey).remove()
            .then(() => {
                alert("Student deleted successfully.");
                renderTable();
            })
            .catch((error) => {
                alert("Failed to delete student: " + error.message);
            });
    }
}

// Function to delete a student with archive
function deleteStudentWithArchive(studentKey) {
    if (confirm("Are you sure you want to delete this student?")) {
        const studentRef = database.ref('users/' + studentKey);

        studentRef.once('value').then(snapshot => {
            const studentData = snapshot.val();

            if (studentData) {
                database.ref('archived_students/' + studentKey).set(studentData)
                    .then(() => {
                        return studentRef.remove();
                    })
                    .then(() => {
                        alert("Student archived and deleted successfully.");
                        renderTable();
                    })
                    .catch(error => {
                        alert("Error archiving student: " + error.message);
                    });
            } else {
                alert("Student data not found.");
            }
        }).catch(error => {
            alert("Failed to retrieve student data: " + error.message);
        });
    }
}

// Attach event listeners for modal and form
studentForm.addEventListener('submit', saveStudent);
closeModal.addEventListener('click', closeModalFn);
window.addEventListener('click', (event) => {
    if (event.target === studentModal) {
        closeModalFn();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const studentsTableBody = document.querySelector("#studentsTable tbody");

    // Listen for input in the search box
    searchInput.addEventListener("input", function() {
        const query = searchInput.value.toLowerCase();
        filterStudents(query);
    });

    function filterStudents(query) {
        // Loop through all rows in the table
        Array.from(studentsTableBody.getElementsByTagName("tr")).forEach(row => {
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
})

// Function to initialize the page
function initializePage() {
    renderTable();  // or renderMonitorTable() depending on context
}

function logout() {
    // Firebase sign-out
    firebase.auth().signOut().then(() => {
        // Redirect to login page after successful logout
        window.location.href = '../login.html';
    }).catch((error) => {
        console.error('Error during logout:', error);
    });
}

// //EXPORT TO EXCEL
// function exportTableToExcel(tableId, filename = 'excel_data') {
//     const table = document.getElementById(tableId);
//     const cloneTable = table.cloneNode(true);
//     const actionColumn = cloneTable.querySelectorAll('th:last-child, td:last-child');
//     actionColumn.forEach(cell => cell.remove());
//     const workbook = XLSX.utils.table_to_book(cloneTable, { sheet: "Sheet 1" });
//     XLSX.writeFile(workbook, `${filename}.xlsx`);
//   }
  

// function exportTableToExcel(tableId, filename = 'list_Students') {
//     const table = document.getElementById(tableId);
//     const rows = table.querySelectorAll('tr');
    
//     const data = [];
    
//     // Loop through each row (skipping the header row)
//     rows.forEach((row, rowIndex) => {
//       const rowData = [];
//       const cells = row.querySelectorAll('th, td');
      
//       cells.forEach((cell, cellIndex) => {
//         // Skip the last column (Action column) by checking if it's the last column
//         if (cellIndex !== cells.length - 1) {
//           if (cellIndex === 1) { // LRN column (2nd column)
//             rowData.push(`'${cell.textContent.trim()}`); // Add single quote to treat as string
//           } else {
//             rowData.push(cell.textContent.trim());
//           }
//         }
//       });
      
//       // Skip the header row
//       if (rowIndex !== 0) {
//         data.push(rowData);
//       }
//     });
  
//     // Create a new workbook
//     const ws = XLSX.utils.aoa_to_sheet([["#","LRN","Last Name","First Name","Section","Email"], ...data]);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Students");
  
//     // Write the file
//     XLSX.writeFile(wb, `${filename}.xlsx`);
//   }

async function exportTableToPDF(tableId, filename = 'list_Students.pdf') {
    // Get the table element
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    // Prepare data for the PDF
    const data = [];
    rows.forEach((row, rowIndex) => {
        const rowData = [];
        const cells = row.querySelectorAll('th, td');

        cells.forEach((cell, cellIndex) => {
            // Skip the last column (Action column)
            if (cellIndex !== cells.length - 1) {
                rowData.push(cell.textContent.trim());
            }
        });

        // Add rows to data (include header and body)
        data.push(rowData);
    });

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get current date and time
    const now = new Date();
    const currentDateTime = now.toLocaleString(); // Format: "MM/DD/YYYY, HH:MM:SS AM/PM"

    // Add title to PDF
    doc.setFontSize(16);
    doc.text("List of Students", 14, 20);

    // Add date and time below the title
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDateTime}`, 14, 27);

    // Add the table to the PDF
    doc.autoTable({
        head: [data[0]], // Table header
        body: data.slice(1), // Table body
        startY: 35, // Adjust start position below title and date
    });

    // Save the PDF as read-only
    const pdfOutput = doc.output("arraybuffer");
    const blob = new Blob([pdfOutput], { type: "application/pdf" });

    // Save the PDF file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // Clean up
    URL.revokeObjectURL(link.href);
}  

// Run the initializePage function on load
window.onload = initializePage;
