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

let currentTopic = "";

// Function to select a topic and load questions
function selectTopic(topic) {
    currentTopic = topic;
    document.getElementById("topic-btn").innerText = topic;
    loadQuestions();
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
                    <button onclick="editEntry('${childSnapshot.key}')">Edit</button>
                    <button onclick="deleteEntry('${childSnapshot.key}')">Delete</button>
                </td>`;
            tableContents.appendChild(row);
        });
    });
}

// Function to open the "Add Entry" modal
function openAddEntryModal() {
    resetForm(); // Reset form before opening the modal
    document.getElementById("addEntryModal").style.display = "block";
}

// Function to close the "Add Entry" modal
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

// Function to open the "View Results" modal
function openResultsModal() {
    document.getElementById("viewResultsModal").style.display = "block";
    loadResults();
}

// Function to close the "View Results" modal
function closeResultsModal() {
    document.getElementById("viewResultsModal").style.display = "none";
}

// Function to load student results from Firebase
function loadResults() {
    const resultsTableContents = document.getElementById("results-table-contents");
    resultsTableContents.innerHTML = ""; // Clear previous results

    const resultsRef = firebase.database().ref("student_results"); // Assuming the results are stored under "student_results"

    resultsRef.once("value", snapshot => {
        snapshot.forEach(childSnapshot => {
            const resultData = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${resultData.studentNumber}</td>
                <td>${resultData.name}</td>
                <td>${resultData.section}</td>
                <td>${resultData.score}</td>
            `;
            resultsTableContents.appendChild(row);
        });
    });
}