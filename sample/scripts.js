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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// Firebase References
const lessonsRef = firebase.database().ref("lessons/");
const form = document.getElementById("form");
const lessonsBody = document.getElementById("lessonsBody");

// List of lessons and their chapters
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

// Populate the lesson dropdown
document.addEventListener("DOMContentLoaded", function () {
    const lessonSelect = document.getElementById("lessonTitle");
    const chapterInput = document.getElementById("chapterName");
    const contentContainer = document.getElementById("contentContainer");
    const addContentButton = document.getElementById("addContentButton");

    // Populate the lesson dropdown
    for (const lessonTitle in lessons) {
        const option = document.createElement("option");
        option.value = lessonTitle;
        option.textContent = lessonTitle;
        lessonSelect.appendChild(option);
    }

    // Automatically set chapter name based on selected lesson
    lessonSelect.addEventListener("change", function () {
        const selectedLesson = lessonSelect.value;
        if (lessons[selectedLesson]) {
            chapterInput.value = lessons[selectedLesson]; // Update chapter name
        }
        // Clear the content fields when switching lessons
        contentContainer.innerHTML = '';
    });

    // Initialize with the first lesson (set chapter name)
    if (lessonSelect.value) {
        chapterInput.value = lessons[lessonSelect.value];
    }

    // Add a new content field
    addContentButton.addEventListener("click", function () {
        const index = contentContainer.children.length; // Index based on number of content fields
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("content-item");

        contentDiv.innerHTML = `
            <label for="content${index}">Content ${index + 1}:</label>
            <textarea id="content${index}" name="content${index}" required></textarea>

            <label for="imageUrl${index}">Image URL ${index + 1}:</label>
            <input type="url" id="imageUrl${index}" name="imageUrl${index}" required>
        `;

        contentContainer.appendChild(contentDiv);
    });

    // Handle form submission
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const lessonTitle = lessonSelect.value;
        const chapterName = chapterInput.value;

        const content = {};
        const images = {};

        // Gather content and image inputs
        Array.from(contentContainer.children).forEach((contentDiv, index) => {
            const contentText = contentDiv.querySelector(`#content${index}`).value;
            const imageUrl = contentDiv.querySelector(`#imageUrl${index}`).value;

            content[index] = contentText;
            images[index] = imageUrl;
        });

        const lessonData = {
            chapterName: chapterName,
            content: content,
            images: images
        };

        // Save the lesson data to Firebase (assuming Firebase has been initialized)
        firebase.database().ref("lessons/" + lessonTitle).set(lessonData)
            .then(() => {
                form.reset();
                contentContainer.innerHTML = ''; // Clear added content
                alert("Lesson saved!");
            })
            .catch((error) => {
                console.error("Error saving lesson: ", error);
                alert("Error saving lesson!");
            });
    });
});

// Display lessons
firebase.database().ref("lessons/").on("value", (snapshot) => {
    lessonsBody.innerHTML = ""; // Clear the table before repopulating

    snapshot.forEach((lessonSnapshot) => {
        const lessonData = lessonSnapshot.val();
        const lessonTitle = lessonSnapshot.key;

        // Iterate through the content and images by index
        Object.keys(lessonData.content).forEach((index) => {
            const row = document.createElement("tr");

            // Create a table row for each index of content and image
            row.innerHTML = `
                <td>${lessonTitle}</td>
                <td>${lessonData.chapterName}</td>
                <td>${index}</td>
                <td>${lessonData.content[index]}</td>
                <td><img src="${lessonData.images[index] || ''}" alt="Lesson Image" style="width: 100px;"></td>
                <td>
                    <button onclick="editLesson('${lessonTitle}', ${index})">Edit</button>
                    <button onclick="deleteLesson('${lessonTitle}', ${index})">Delete</button>
                </td>
            `;
            lessonsBody.appendChild(row);
        });
    });
});

// Edit lesson function
window.editLesson = (lessonTitle, index) => {
    const editForm = document.getElementById("editForm");
    const editLessonTitle = document.getElementById("editLessonTitle");
    const editChapterName = document.getElementById("editChapterName");
    const contentContainer = document.getElementById("contentContainer");

    // Show the edit form
    editForm.style.display = "block";

    // Fetch the lesson data to populate the form
    firebase.database().ref("lessons/" + lessonTitle).once("value", (snapshot) => {
        const lessonData = snapshot.val();

        editLessonTitle.value = lessonTitle;  // Title cannot be changed, just displayed
        editChapterName.value = lessonData.chapterName;

        // Clear previous content fields
        contentContainer.innerHTML = "";

        // Create an input for the specific content and corresponding image by index
        Object.keys(lessonData.content).forEach((index) => {
            const contentDiv = document.createElement("div");
            contentDiv.classList.add("content-item");

            contentDiv.innerHTML = `
                <h4>Content ${parseInt(index) + 1}</h4>
                <textarea class="editContent" data-index="${index}" placeholder="Content">${lessonData.content[index]}</textarea>
                <input type="url" class="editImage" data-index="${index}" placeholder="Image URL" value="${lessonData.images[index] || ''}" />
            `;

            contentContainer.appendChild(contentDiv);
        });
    });
};

// Save changes after editing
document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const lessonTitle = document.getElementById("editLessonTitle").value;
    const chapterName = document.getElementById("editChapterName").value;
    const content = {};
    const images = {};

    // Gather content and images by index
    const contentInputs = document.querySelectorAll(".editContent");
    const imageInputs = document.querySelectorAll(".editImage");

    contentInputs.forEach(input => {
        const index = input.getAttribute("data-index");
        content[index] = input.value;
    });

    imageInputs.forEach(input => {
        const index = input.getAttribute("data-index");
        images[index] = input.value;
    });

    const updatedLessonData = {
        chapterName: chapterName,
        content: content,
        images: images
    };

    // Update the lesson in Firebase
    firebase.database().ref("lessons/" + lessonTitle).update(updatedLessonData)
        .then(() => {
            alert("Lesson updated!");
            document.getElementById("editForm").reset();
            document.getElementById("editForm").style.display = "none";  // Hide the form
        })
        .catch((error) => {
            console.error("Error updating lesson: ", error);
            alert("Error updating lesson!");
        });
});

// Cancel edit
document.getElementById("cancelEdit").addEventListener("click", () => {
    document.getElementById("editForm").reset();
    document.getElementById("editForm").style.display = "none";
});

// Delete lesson content and image
window.deleteLesson = (lessonTitle, index) => {
    firebase.database().ref("lessons/" + lessonTitle + "/content/" + index).remove()
        .then(() => {
            alert("Content deleted!");
        })
        .catch((error) => {
            console.error("Error deleting content: ", error);
            alert("Error deleting content!");
        });

    firebase.database().ref("lessons/" + lessonTitle + "/images/" + index).remove()
        .then(() => {
            alert("Image deleted!");
        })
        .catch((error) => {
            console.error("Error deleting image: ", error);
            alert("Error deleting image!");
        });
};
