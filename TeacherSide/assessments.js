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
const dbRef = firebase.database().ref("quiz_questions");
const database = firebase.database();

let currentTopic = "";

function selectTopic(topic) {
    if (!topic) {
        console.error("Error: Topic is undefined.");
        return;
    }
    
    currentTopic = topic;  // Set currentTopic
    document.getElementById("topic-btn").innerText = topic;
    loadQuestions();
    console.log("Selected Topic:", currentTopic);  // Add this line for debugging
    loadResults();  // Call loadResults without passing currentTopic if it's global
}


// Function to load questions based on the selected topic
function loadQuestions() {
    if (!currentTopic) return;
    dbRef.child(currentTopic).once("value", snapshot => {
        const tableContents = document.getElementById("table-contents");
        tableContents.innerHTML = "";
        let count = 1;
        snapshot.forEach(childSnapshot => {
            const questionData = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${count++}</td>
                <td>${questionData.questionText}</td>
                <td>${questionData.options.join(", ")}</td>
                <td>${questionData.options[questionData.correctAnswerIndex]}</td>
                <td>
                    <button onclick="editEntry('${childSnapshot.key}')">✏️</button>
                    <button onclick="deleteEntry('${childSnapshot.key}')">🗑️</button>
                </td>`;
            tableContents.appendChild(row);
        });
    });
}

// Function to open the "Add Entry" modal
function openResultsModal() {
    document.getElementById("viewResultsModal").style.display = "block";
    loadResults(currentTopic);  // Make sure the current topic is passed to loadResults
}

function closeResultsModal() {
    // Logic to close the modal
    console.log("Closing results modal...");
    // Close modal code, for example:
    document.getElementById("viewResultsModal").style.display = "none";
}



// Function to close the "Add Entry" modal
function openAddEntryModal() {
    if (currentTopic == '') {
        console.error("Error: Topic is undefined.");
        return;
    }
    resetForm(); // Reset form before opening the modal
    document.getElementById("addEntryModal").style.display = "block";
}

function closeAddEntryModal() {
    document.getElementById("addEntryModal").style.display = "none";
    resetForm();
}

// Function to submit a new or edited entry to Firebase
function submitEntry() {
    // Get the form values
    const questionText = document.getElementById("q").value;
    const options = [
        document.getElementById("0").value,
        document.getElementById("1").value,
        document.getElementById("2").value,
        document.getElementById("3").value
    ];
    const correctAnswer = document.querySelector("input[name='questionAnswer']:checked").value;
    const correctAnswerIndex = ["A", "B", "C", "D"].indexOf(correctAnswer);

    const newEntry = {
        questionText,
        options,
        correctAnswerIndex
    };

    // Use push() to generate a unique ID for each question under the specified topic
    dbRef.child(currentTopic).push(newEntry)
        .then(() => {
            alert("Question added successfully!");
            loadQuestions();
            closeAddEntryModal(); // Close modal after submit
        })
        .catch(error => console.error("Error adding question: ", error));
}

// Function to edit an existing entry
function editEntry(entryId) {
    // Get the entry data from Firebase
    dbRef.child(currentTopic).child(entryId).once("value", snapshot => {
        const questionData = snapshot.val();
        
        // Populate the form with existing entry data
        document.getElementById("q").value = questionData.questionText;
        document.getElementById("0").value = questionData.options[0];
        document.getElementById("1").value = questionData.options[1];
        document.getElementById("2").value = questionData.options[2];
        document.getElementById("3").value = questionData.options[3];
        
        // Set the correct answer radio button
        document.querySelector(`input[name="questionAnswer"][value="${["A", "B", "C", "D"][questionData.correctAnswerIndex]}"]`).checked = true;
        
        // Change the submit button to update the entry
        const submitButton = document.querySelector(".btnSubmit");
        submitButton.textContent = "Update Entry";
        submitButton.onclick = () => updateEntry(entryId);
        
        // Open the modal
        document.getElementById("addEntryModal").style.display = "block";
    });
}

// Function to update an existing entry
function updateEntry(entryId) {
    const questionText = document.getElementById("q").value;
    const options = [
        document.getElementById("0").value,
        document.getElementById("1").value,
        document.getElementById("2").value,
        document.getElementById("3").value
    ];
    const correctAnswer = document.querySelector("input[name='questionAnswer']:checked").value;
    const correctAnswerIndex = ["A", "B", "C", "D"].indexOf(correctAnswer);

    const updatedEntry = {
        questionText,
        options,
        correctAnswerIndex
    };

    // Update entry in Firebase
    dbRef.child(currentTopic).child(entryId).update(updatedEntry)
        .then(() => {
            closeAddEntryModal(); // Close modal after update
            loadQuestions();
        })
        .catch(error => console.error("Error updating question:", error));
}

// Function to delete an entry
function deleteEntry(entryId) {
    // Confirm before deleting
    if (confirm("Are you sure you want to delete this question?")) {
        dbRef.child(currentTopic).child(entryId).remove()
            .then(() => loadQuestions())
            .catch(error => console.error("Error deleting question:", error));
    }
}

// Function to reset the form for adding/editing questions
function resetForm() {
    document.getElementById("form").reset();
    document.querySelector(".btnSubmit").textContent = "Submit";
    document.querySelector(".btnSubmit").onclick = submitEntry;

    // Clear the selected radio button
    const radioButtons = document.querySelectorAll("input[name='questionAnswer']");
    radioButtons.forEach(button => button.checked = false);
}

// Function to reset the form for adding/editing questions
function loadResults() {
    if (!currentTopic) {
        console.error("Selected topic is not defined.");
        return;
    }

    console.log("Fetching results for topic:", currentTopic);  // Debugging line

    const resultsTableContents = document.getElementById("results-table-contents");
    resultsTableContents.innerHTML = '';  // Clear previous results

    database.ref("score_gradedQuiz") // Reference to the root of score_gradedQuiz
        .once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                console.log("Results found:", snapshot.val());  // Debugging line

                snapshot.forEach(childSnapshot => {
                    // Loop through each User UID node
                    const userResults = childSnapshot.val(); // User's results
                    // Check if the topic is part of the user's results
                    if (userResults[currentTopic]) {
                        const resultData = userResults[currentTopic];

                        // Only proceed if the status is "completed"
                        if (resultData.status === "completed") {
                            const uid = childSnapshot.key; // User ID (UID)
                            database.ref(`users/${uid}`).once("value").then(userSnapshot => {
                                const userData = userSnapshot.val();
                                if (userData) {
                                    // Extract user information
                                    const studentNumber = userData.studentNum || "N/A";
                                    const lastName = userData.lastName || "N/A";
                                    const firstName = userData.firstName || "N/A";
                                    const section = userData.section || "N/A";
                                    const score = resultData.score;

                                    // Create a table row for the result
                                    const row = document.createElement("tr");
                                    row.innerHTML = `
                                        <td>${studentNumber}</td>
                                        <td>${lastName}</td>
                                        <td>${firstName}</td>
                                        <td>${section}</td>
                                        <td>${score}</td>
                                    `;
                                    resultsTableContents.appendChild(row);
                                } else {
                                    console.warn(`User data for UID ${uid} not found.`);
                                }
                            }).catch(error => {
                                console.error("Error fetching user data:", error);
                            });
                        }
                    }
                });
            } else {
                console.log("No results found for the selected topic.");
                resultsTableContents.innerHTML = "<tr><td colspan='5'>No results found.</td></tr>";
            }
        })
        .catch(error => {
            console.error("Error loading results:", error);
        });
}

//EXPORT TO EXCEL
// function exportTableToExcel(tableId, filename = 'excel_data') {
//     // Get the table element by ID
//     const table = document.getElementById(tableId);
//     const workbook = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });
//     // Use XLSX to write the workbook to a binary string
//     XLSX.writeFile(workbook, `${filename}.xlsx`);
// }

function exportTableToPDF(tableId, filename = 'assessment') {
    const { jsPDF } = window.jspdf;

    // Create a new jsPDF instance
    const pdf = new jsPDF();

    // Add header with "Assessment" and the current date
    const headerText = "Assessment";
    const currentDate = new Date().toLocaleDateString();
    pdf.setFontSize(12);
    pdf.text(`${headerText} - ${currentDate}`, 10, 10); // x=10, y=10 for positioning

    // Fetch the table element
    const table = document.getElementById(tableId);

    // AutoTable Plugin to add table contents to the PDF
    pdf.autoTable({
        html: table, // Use the table element directly
        startY: 20, // Start after header
        theme: 'grid', // Table theme
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Style for the header
        bodyStyles: { fontSize: 10 },
        styles: { halign: 'center', valign: 'middle' },
    });

    // Save the PDF
    pdf.save(`${filename}.pdf`);
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