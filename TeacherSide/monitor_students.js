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

// Function to render the students table
// Function to render the students table
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
