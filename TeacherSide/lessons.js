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

// References
const lessonsRef = firebase.database().ref("lessons/");
const lessonSelect = document.getElementById("lessonTitle");
const chapterInput = document.getElementById("chapterName");
const contentContainer = document.getElementById("contentContainer");
const tableContents = document.getElementById("table-contents");
const form = document.getElementById("form");

let editingLessonTitle = null;
let editingContentIndex = null;

// Lessons and their chapters
const lessons = {
    "Science is for Every Juan!": "Chapter 1",
    "Science at Work": "Chapter 2",
    "Probing Matter": "Chapter 3",
    "Chemistry of Solutions": "Chapter 4",
    "Concentration and Properties of Solutions": "Chapter 5",
    "The Discovery of Cells and the Microscopic World": "Chapter 6",
    "The Structure and Function of Cells": "Chapter 7",
    "The Reproduction of Life": "Chapter 8",
    "Ecosystems and Interdependence": "Chapter 9",
    "Changes in Ecosystems and Human Impact": "Chapter 10",
    "Forces and Motion": "Chapter 11",
    "Making Waves": "Chapter 12",
    "Living with Sound and Light": "Chapter 13",
    "The Heat is On": "Chapter 14",
    "Give and Take": "Chapter 15",
    "The Philippine Archipelago": "Chapter 16",
    "Landforms and Natural Wonders of the Philippines": "Chapter 17",
    "Natural Resources and Environmental Challenges": "Chapter 18",
    "The Invisible Blanket": "Chapter 19",
    "Sun-Earth-Moon System": "Chapter 20"
};

// Populate lesson dropdown on DOM load
document.addEventListener("DOMContentLoaded", () => {
    Object.keys(lessons).forEach((lessonTitle) => {
        const option = document.createElement("option");
        option.value = lessonTitle;
        option.textContent = lessonTitle;
        lessonSelect.appendChild(option);
    });

    // Set the first lesson as the default selection
    lessonSelect.value = Object.keys(lessons)[0]; // Set the first lesson as default
    chapterInput.value = lessons[lessonSelect.value] || ""; // Set the corresponding chapter name

    // Fetch content for the default lesson
    fetchContentForTopic(lessonSelect.value);

    // Update chapter name on lesson selection
    lessonSelect.addEventListener("change", () => {
        chapterInput.value = lessons[lessonSelect.value] || "";
        fetchContentForTopic(lessonSelect.value); // Fetch content for the selected lesson
    });
});


// Select a topic from dropdown
function selectTopic(topic) {
    chapterInput.value = lessons[topic] || "";
    fetchContentForTopic(topic);

    const existingOption = Array.from(lessonSelect.options).find(option => option.value === topic);
    if (!existingOption) {
        const option = document.createElement("option");
        option.value = topic;
        option.textContent = topic;
        lessonSelect.appendChild(option);
    }

    lessonSelect.value = topic;
}

// Fetch and display content based on selected lesson/topic
function fetchContentForTopic(topic) {
    const lessonRef = lessonsRef.child(topic);

    // Clear the current table contents
    tableContents.innerHTML = "";

    // Fetch content for the selected lesson
    lessonRef.once("value", (snapshot) => {
        const lessonData = snapshot.val();

        if (lessonData) {
            let slideNumber = 1; // Initialize slide number to 1
            Object.keys(lessonData.content || {}).forEach((index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${lessonData.chapterName}</td>
                    <td>${slideNumber}</td>
                    <td>${lessonData.content[index]}</td>
                    <td><img src="${lessonData.images[index]}" alt="Image" style="width: 100px;"></td>
                    <td>
                        <button onclick="editLesson('${topic}', ${index})">✏️</button>
                        <button onclick="deleteLesson('${topic}', ${index})">🗑️</button>
                    </td>
                `;
                tableContents.appendChild(row);
                slideNumber++; // Increment slide number for next content
            });
        } else {
            tableContents.innerHTML = "<tr><td colspan='5'>No content available for this topic.</td></tr>";
        }
    });
}

// Open/Close Modal
function openAddEntryModal() {
    const lessonTitle = lessonSelect.value;

    if (!lessonTitle) {
        alert("Please select a lesson.");
        return;
    }

    const lessonRef = lessonsRef.child(lessonTitle);

    // Check if there is existing content for the selected topic
    lessonRef.once("value", (snapshot) => {
        const lessonData = snapshot.val();

        // If content exists, show a confirmation message
        if (lessonData && lessonData.content) {
            const userConfirmed = confirm("There is already content in this topic, would you like to continue?");
            if (!userConfirmed) {
                return; // If user cancels, do nothing
            }
        }

        // Proceed to show the modal
        document.getElementById("addEntryModal").style.display = "block";
    });
}

function closeAddEntryModal() {
    document.getElementById("addEntryModal").style.display = "none";
    form.reset();
    contentContainer.innerHTML = ""; // Clear dynamic content
}

// Add content fields dynamically
function addContentField() {
    const index = contentContainer.children.length;
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content-item");

    contentDiv.innerHTML = `
        <label for="content${index}">Content ${index + 1}:</label>
        <textarea id="content${index}" name="content${index}" required></textarea>
        <label for="imageUrl${index}">Image URL ${index + 1}:</label>
        <input type="url" id="imageUrl${index}" name="imageUrl${index}" required>
    `;
    contentContainer.appendChild(contentDiv);
}

// Handle form submission
function submitEntry() {
    const lessonTitle = lessonSelect.value;
    const chapterName = chapterInput.value;

    if (!lessonTitle || !chapterName) {
        alert("Please select a lesson and enter a chapter name.");
        return;
    }

    const content = {};
    const images = {};

    // Gather all the content and image URLs from the form fields
    Array.from(contentContainer.children).forEach((contentDiv, index) => {
        content[index] = contentDiv.querySelector(`#content${index}`).value;
        images[index] = contentDiv.querySelector(`#imageUrl${index}`).value;
    });

    const lessonData = {
        chapterName: chapterName,
        content: content,
        images: images
    };

    if (editingLessonTitle && editingContentIndex !== null) {
        // If editing, update the specific content entry in the database
        lessonsRef.child(editingLessonTitle).child('content').child(editingContentIndex).set(content[editingContentIndex]);
        lessonsRef.child(editingLessonTitle).child('images').child(editingContentIndex).set(images[editingContentIndex]);

        alert("Content updated successfully!");
        editingLessonTitle = null;
        editingContentIndex = null;
        closeAddEntryModal();
    } else {
        // If not editing, add a new lesson
        lessonsRef.child(lessonTitle).set(lessonData)
            .then(() => {
                // Add the lesson to the dropdown if not present
                const existingOption = Array.from(lessonSelect.options).find(option => option.value === lessonTitle);
                if (!existingOption) {
                    const option = document.createElement("option");
                    option.value = lessonTitle;
                    option.textContent = lessonTitle;
                    lessonSelect.appendChild(option);
                }

                // Set the dropdown to the newly added topic
                lessonSelect.value = lessonTitle;

                alert("Lesson added successfully!");
                form.reset();
                contentContainer.innerHTML = "";
                closeAddEntryModal();
            })
            .catch((error) => {
                console.error("Error saving lesson:", error);
                alert("Error saving lesson. Please try again.");
            });
    }
}

// Edit lesson function
function editLesson(lessonTitle, index) {
    // Set the lesson and index to be edited
    editingLessonTitle = lessonTitle;
    editingContentIndex = index;

    const lessonRef = lessonsRef.child(lessonTitle);
    lessonRef.once("value", (snapshot) => {
        const lessonData = snapshot.val();

        if (lessonData && lessonData.content) {
            const content = lessonData.content[index];
            const imageUrl = lessonData.images[index];

            // Populate the modal with the existing content to be edited
            lessonSelect.value = lessonTitle;
            chapterInput.value = lessonData.chapterName;
            contentContainer.innerHTML = `
                <div class="content-item">
                    <label for="content0">Content 1:</label>
                    <textarea id="content0" name="content0" required>${content}</textarea>
                    <label for="imageUrl0">Image URL 1:</label>
                    <input type="url" id="imageUrl0" name="imageUrl0" required value="${imageUrl}">
                </div>
            `;
            openAddEntryModal();
        }
    });
}


// Delete lesson content
function deleteLesson(lessonTitle, index) {
    const lessonContentRef = lessonsRef.child(`${lessonTitle}/content/${index}`);
    const lessonImageRef = lessonsRef.child(`${lessonTitle}/images/${index}`);

    lessonContentRef.remove()
        .then(() => lessonImageRef.remove())
        .then(() => alert("Content deleted successfully!"))
        .catch((error) => {
            console.error("Error deleting content:", error);
            alert("Error deleting content. Please try again.");
        });
}

// Edit lesson function
function editLesson(lessonTitle, index) {
    // Set the lesson and index to be edited
    editingLessonTitle = lessonTitle;
    editingContentIndex = index;

    const lessonRef = lessonsRef.child(lessonTitle);
    lessonRef.once("value", (snapshot) => {
        const lessonData = snapshot.val();

        if (lessonData && lessonData.content) {
            const content = lessonData.content[index];
            const imageUrl = lessonData.images[index];

            // Populate the modal with the existing content
            lessonSelect.value = lessonTitle;
            chapterInput.value = lessonData.chapterName;
            contentContainer.innerHTML = `
                <div class="content-item">
                    <label for="content0">Content 1:</label>
                    <textarea id="content0" name="content0" required>${content}</textarea>
                    <label for="imageUrl0">Image URL 1:</label>
                    <input type="url" id="imageUrl0" name="imageUrl0" required value="${imageUrl}">
                </div>
            `;
            openAddEntryModal();
        }
    });
}
