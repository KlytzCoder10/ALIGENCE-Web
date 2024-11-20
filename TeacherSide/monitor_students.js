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

// Variables for filtering and table rendering
let selectedSection = "All";
let selectedStatus = "All";

// Function to select a section
function selectSection(section) {
    selectedSection = section;
    renderTable();
}

// Function to select a status
function selectStatus(status) {
    selectedStatus = status;
    renderTable();
}

// Function to render the students table with status indicator
function renderTable() {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = ""; // Clear previous data

    database.ref('users').orderByChild('role').equalTo('student').once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                tableBody.innerHTML = "<tr><td colspan='5'>No students found.</td></tr>";
                return;
            }

            let students = [];
            snapshot.forEach((childSnapshot) => {
                const student = childSnapshot.val();

                // Filter students by section
                if (selectedSection !== "All" && student.section !== selectedSection) {
                    return;
                }

                // Filter students by status
                if (selectedStatus !== "All" && student.status !== selectedStatus) {
                    return;
                }

                students.push(student);
            });

            // Sort students by last name alphabetically
            students.sort((a, b) => a.lastName.localeCompare(b.lastName));

            let index = 1;
            students.forEach((student) => {
                const row = document.createElement('tr');
                
                // Determine status class for the status circle
                const statusClass = student.status === "Online" ? "status-online" : 
                                    student.status === "Offline" ? "status-offline" : "status-disconnected";

                row.innerHTML = `
                    <td>${index++}</td>
                    <td>${student.lastName}</td>
                    <td>${student.firstName}</td>
                    <td>${student.section}</td>
                    <td>
                        <span class="status-circle ${statusClass}"></span> ${student.status}
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error fetching students:", error);
            tableBody.innerHTML = "<tr><td colspan='5'>Error loading data.</td></tr>";
        });
}

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
});

// //EXPORT TO EXCEL
// function exportTableToExcel(tableId, filename = 'excel_data') {
//     // Select the table element
//     const table = document.getElementById(tableId);

//     // Create a workbook and add the table data
//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.table_to_sheet(table);

//     // Append the worksheet to the workbook
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

//     // Generate Excel file and prompt the user to download it
//     XLSX.writeFile(workbook, `${filename}.xlsx`);
// }

//Export PDF
async function exportTableToPDF(tableId, filename = 'table_data') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get the current date and time
    const now = new Date();
    const currentDateTime = now.toLocaleString(); // Format: "MM/DD/YYYY, HH:MM:SS AM/PM"

    // Add header
    doc.setFontSize(16);
    doc.text("Monitor Students", 14, 15); // Title text at x=14, y=15
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDateTime}`, 14, 22); // Date/time text at x=14, y=22

    // Select the table
    const table = document.getElementById(tableId);

    // Convert table to a 2D array for autoTable
    const rows = Array.from(table.rows).map(row =>
        Array.from(row.cells).map(cell => cell.innerText)
    );

    // Add autoTable with the extracted data
    doc.autoTable({
        startY: 30, // Start after the header
        head: [rows[0]], // First row as header
        body: rows.slice(1), // Remaining rows as body
    });

    // Save the PDF file
    doc.save(`${filename}.pdf`);
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

// Initialize the page and render the table on load
window.onload = renderTable;
