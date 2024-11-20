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
const teachersModal = document.getElementById('teachersModal');
const modalTitle = document.getElementById('modalTitle');
const teacherForm = document.getElementById('teacherForm');
const closeModal = document.querySelector('.close');
const teacherNumInput = document.getElementById('teacherNum'); 
const teacherEmailInput = document.getElementById('teacher_Email');
const teacherLastNameInput = document.getElementById('teacher_lastName');
const teacherFirstNameInput = document.getElementById('teacher_firstName');

// Event listener for adding a new teacher
document.getElementById('addTeacherBtn').addEventListener('click', () => openModal());
closeModal.addEventListener('click', closeModalFn);

// Variable to keep track of the teacher being edited
let editKey = null;

// Function to open the modal
function openModal(isEdit = false, teacherKey = null) {
    if (isEdit) {
        modalTitle.textContent = "Edit Teacher";
        database.ref('users/' + teacherKey).once('value').then((snapshot) => {
            const teacher = snapshot.val();
            if (teacher.role === "teacher") {
                teacherNumInput.value = teacher.teacherNum; 
                teacherEmailInput.value = teacher.email;
                teacherLastNameInput.value = teacher.lastName;
                teacherFirstNameInput.value = teacher.firstName;
            }
        });
        editKey = teacherKey;
    } else {
        modalTitle.textContent = "Add Teacher";
        teacherForm.reset();
        editKey = null;
    }
    teachersModal.style.display = "flex";
}

// Close modal function
function closeModalFn() {
    teachersModal.style.display = "none";
}

// Function to save or add teacher data
function saveTeacher(e) {
    e.preventDefault();

    const teacherNum = teacherNumInput.value.trim();
    const email = teacherEmailInput.value.trim();
    const lastName = teacherLastNameInput.value.trim();
    const firstName = teacherFirstNameInput.value.trim();
    const password = "defaultPassword123"; // Temporary password

    const teacherData = {
        teacherNum: teacherNum,
        email: email,
        lastName: lastName,
        firstName: firstName,
        role: "teacher"
    };

    // Validate if email or teacherNum already exists
    database.ref('users').once('value')
        .then((snapshot) => {
            let emailExists = false;
            let teacherNumExists = false;

            snapshot.forEach((childSnapshot) => {
                const teacher = childSnapshot.val();

                // Skip the current teacher if editing
                if (editKey && childSnapshot.key === editKey) return;

                if (teacher.email === email) {
                    emailExists = true;
                }

                if (teacher.teacherNum === teacherNum) {
                    teacherNumExists = true;
                }
            });

            if (emailExists || teacherNumExists) {
                let errorMessage = "The following errors occurred:\n";
                if (emailExists) errorMessage += "- Email is already in use.\n";
                if (teacherNumExists) errorMessage += "- Teacher ID is already in use.\n";
                alert(errorMessage);
                return; // Exit the function to prevent saving
            }

            // Proceed with saving/updating
            if (editKey) {
                database.ref('users/' + editKey).update(teacherData)
                    .then(() => {
                        alert("Teacher updated successfully.");
                        closeModalFn();
                        renderTable();
                    })
                    .catch((error) => {
                        alert("Failed to update teacher: " + error.message);
                    });
            } else {
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const userId = userCredential.user.uid;
                        database.ref('users/' + userId).set(teacherData)
                            .then(() => {
                                alert("Teacher added successfully.");
                                closeModalFn();
                                renderTable();
                            })
                            .catch((error) => {
                                alert("Failed to add teacher data: " + error.message);
                            });
                    })
                    .catch((error) => {
                        alert("Failed to create teacher: " + error.message);
                    });
            }
        })
        .catch((error) => {
            alert("Error checking database: " + error.message);
        });
}

// Function to render the teachers table
function renderTable() {
    const tableBody = document.querySelector('#teachersTable tbody');
    tableBody.innerHTML = "";

    database.ref('users').orderByChild('role').equalTo('teacher').once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                tableBody.innerHTML = "<tr><td colspan='6'>No teachers found.</td></tr>";
                return;
            }

            let index = 1;
            snapshot.forEach((childSnapshot) => {
                const teacher = childSnapshot.val();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index++}</td>
                    <td>${teacher.teacherNum}</td> <!-- Changed from teacherid -->
                    <td>${teacher.email}</td>
                    <td>${teacher.lastName}</td>
                    <td>${teacher.firstName}</td>
                    <td>
                        <button onclick="openModal(true, '${childSnapshot.key}')">✏️</button>
                        <button onclick="deleteTeacher('${childSnapshot.key}')">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Error fetching teachers:", error);
            tableBody.innerHTML = "<tr><td colspan='6'>Error loading data.</td></tr>";
        });
}

// Function to delete a teacher with archive
function deleteTeacher(teacherKey) {
    if (confirm("Are you sure you want to delete this teacher?")) {
        const teacherRef = database.ref('users/' + teacherKey);
        
        teacherRef.once('value').then(snapshot => {
            const teacherData = snapshot.val();

            if (teacherData) {
                database.ref('archived_teachers/' + teacherKey).set(teacherData)
                    .then(() => teacherRef.remove())
                    .then(() => {
                        alert("Teacher archived and deleted successfully.");
                        renderTable();
                    })
                    .catch(error => {
                        alert("Error archiving teacher: " + error.message);
                    });
            } else {
                alert("Teacher data not found.");
            }
        }).catch(error => {
            alert("Failed to retrieve teacher data: " + error.message);
        });
    }
}

//Search Input
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const teachersTableBody = document.querySelector("#teachersTable tbody");

    // Listen for input in the search box
    searchInput.addEventListener("input", function() {
        const query = searchInput.value.toLowerCase();
        filterStudents(query);
    });

    function filterStudents(query) {
        // Loop through all rows in the table
        Array.from(teachersTableBody.getElementsByTagName("tr")).forEach(row => {
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


// Attach event listeners for modal and form
teacherForm.addEventListener('submit', saveTeacher);
window.addEventListener('click', (event) => {
    if (event.target === teachersModal) {
        closeModalFn();
    }
});

// Initial table render on page load
window.onload = renderTable;

// prevent navigating back to previous page

window.history.pushState(null, null, window.location.dashboard.html);
window.onpopstate = function () {
    window.history.go(1);
};

function logout() {
    // Firebase sign-out
    firebase.auth().signOut().then(() => {
        // Redirect to login page after successful logout
        window.location.href = '../login.html';
    }).catch((error) => {
        console.error('Error during logout:', error);
    });
}