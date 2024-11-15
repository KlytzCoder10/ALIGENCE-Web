// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC197CiJGypDz6qJxD0xPrBhrN0u0tTqH4",
    authDomain: "aligence-4587c.firebaseapp.com",
    databaseURL: "https://aligence-4587c-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "aligence-4587c",
    storageBucket: "aligence-4587c.appspot.com",
    messagingSenderId: "483459083057",
    appId: "1:483459083057:android:9f97de59a19f3a8968de10"
};
firebase.initializeApp(firebaseConfig);

// Firebase Database and Authentication
const database = firebase.database();

// Initialize Firebase Authentication and update welcome message on login
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        updateWelcomeMessage();
        fetchDataForBarChart(); // Load chart data
        fetchStudentsData();    // Load 'All' section data by default
    }
});

// Display the first name of the logged-in teacher
function updateWelcomeMessage() {
    const user = firebase.auth().currentUser;

    if (user) {
        const userRef = database.ref(`/users/${user.uid}`);
        userRef.once('value').then(snapshot => {
            const firstName = snapshot.child('firstName').val();
            const welcomeText = firstName ? `Welcome back, ${firstName}!` : 'Welcome back!';
            document.querySelector('.welcome h2').textContent = welcomeText;
        }).catch(error => console.error("Failed to fetch user's name:", error));
    } else {
        console.log("No user is currently signed in.");
    }
}

// Fetch and display study time, lessons, and quiz counts for a specific section
function fetchDataForBarChart(section = 'All') {
    Promise.all([
        fetchStudyTime(section),
        fetchLessonCount(section),
        fetchGradedQuizCount(section),
        fetchPracticeQuizCount(section)
    ]).then(values => {
        const [studyTime, lessonCount, gradedQuizCount, practiceQuizCount] = values;

        // Update bar chart and cards
        updateBarChart([studyTime, lessonCount, gradedQuizCount, practiceQuizCount]);
        document.getElementById("studyingTime").textContent = `${studyTime} minutes`;
        document.getElementById("lessons").textContent = lessonCount;
        document.getElementById("gradedQuiz").textContent = gradedQuizCount;
        document.getElementById("practiceQuiz").textContent = practiceQuizCount;
    }).catch(error => console.error("Error fetching data for bar chart:", error));
}

// Helper function to fetch study time for a section
function fetchStudyTime(section) {
    const userRef = database.ref('users');
    const studyTimerRef = database.ref('StudyTimer');
    let sectionStudentIds = new Set();

    // Step 1: Fetch users and filter by section to get relevant student IDs
    return userRef.once('value')
        .then(snapshot => {
            snapshot.forEach(userSnapshot => {
                const userSection = userSnapshot.child('section').val();
                const userId = userSnapshot.key;

                // If section is 'All' or matches the specified section, add to set
                if (section === 'All' || userSection === section) {
                    sectionStudentIds.add(userId);
                }
            });

            // Step 2: Fetch study timer data and accumulate time for the filtered students
            return studyTimerRef.once('value').then(timerSnapshot => {
                let totalStudyTimeInSeconds = 0;

                timerSnapshot.forEach(userSnapshot => {
                    const studentId = userSnapshot.key;

                    // Only calculate time if the student ID is in the specified section
                    if (sectionStudentIds.has(studentId)) {
                        userSnapshot.forEach(dateSnapshot => {
                            totalStudyTimeInSeconds += dateSnapshot.child('Time').val() || 0;
                        });
                    }
                });

                // Convert total time from seconds to minutes
                return totalStudyTimeInSeconds / 60;
            });
        });
}

// Fetch total lesson count for students in a specific section
function fetchLessonCount(section) {
    return database.ref('users').once('value').then(snapshot => {
        let totalLessonCount = 0;

        snapshot.forEach(userSnapshot => {
            if (userSnapshot.child('role').val() === 'student' && 
                (section === 'All' || userSnapshot.child('section').val() === section)) {
                const lessons = userSnapshot.child('lessons');
                totalLessonCount += lessons.exists() ? lessons.numChildren() : 0;
            }
        });

        return totalLessonCount;
    }).catch(error => {
        console.error("Failed to fetch total lesson count:", error);
        return 0;
    });
}

// Fetch graded quiz count for a specific section
function fetchGradedQuizCount(section) {
    const userRef = database.ref('users');
    const quizRef = database.ref('score_gradedQuiz');
    let sectionStudentIds = new Set();

    // Step 1: Fetch user information to get students in the specified section
    return userRef.once('value')
        .then(snapshot => {
            snapshot.forEach(userSnapshot => {
                const userSection = userSnapshot.child('section').val();
                const userId = userSnapshot.key;
                
                // If section is 'All' or matches the specified section, add to set
                if (section === 'All' || userSection === section) {
                    sectionStudentIds.add(userId);
                }
            });

            // Step 2: Fetch graded quizzes and count only those that belong to the filtered students
            return quizRef.once('value').then(quizSnapshot => {
                let quizCount = 0;

                quizSnapshot.forEach(quiz => {
                    const studentId = quiz.key;
                    // Check if this student ID is in our filtered section IDs
                    if (sectionStudentIds.has(studentId)) {
                        quizCount++;
                    }
                });

                return quizCount;
            });
        });
}

// Fetch practice quiz count for a specific section
function fetchPracticeQuizCount(section) {
    const userRef = database.ref('users');
    const quizRef = database.ref('practice_quiz');
    let sectionStudentIds = new Set();

    // Step 1: Fetch user information to get students in the specified section
    return userRef.once('value')
        .then(snapshot => {
            snapshot.forEach(userSnapshot => {
                const userSection = userSnapshot.child('section').val();
                const userId = userSnapshot.key;
                
                // If section is 'All' or matches the specified section, add to set
                if (section === 'All' || userSection === section) {
                    sectionStudentIds.add(userId);
                }
            });

            // Step 2: Fetch graded quizzes and count only those that belong to the filtered students
            return quizRef.once('value').then(quizSnapshot => {
                let quizCount = 0;

                quizSnapshot.forEach(quiz => {
                    const studentId = quiz.key;
                    // Check if this student ID is in our filtered section IDs
                    if (sectionStudentIds.has(studentId)) {
                        quizCount++;
                    }
                });

                return quizCount;
            });
        });
}

// Update the bar chart with new data
function updateBarChart(data) {
    barChart.updateSeries([{ data: data }]);
}

// BAR CHART OPTIONS
const barChartOptions = {
    series: [{ name: '', data: [] }],
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    colors: ["#8F81C7", "#C781B3", "#C7B381", "#CE4C44"],
    plotOptions: { bar: { distributed: true, horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: ['Studying Time', 'Lessons', 'Graded Quiz', 'Practice Quiz'] },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => `${val}` } }
};
const barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
barChart.render();

// Fetch students data and render it in the table, including study time and quiz counts per student
function fetchStudentsData(section = 'All') {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = '';  // Clear existing rows

    database.ref('users').orderByChild('lastName').once('value')
    .then(snapshot => {
        let students = [];

        // Collect student data including last name, first name, section, etc.
        snapshot.forEach(userSnapshot => {
            if (userSnapshot.child('role').val() === 'student' && 
                (section === 'All' || userSnapshot.child('section').val() === section)) {
                
                const uid = userSnapshot.key; // Get user's UID
                const lastName = userSnapshot.child('lastName').val();
                const firstName = userSnapshot.child('firstName').val();
                const studentSection = userSnapshot.child('section').val();
                const lessonCount = userSnapshot.child('lessons').exists() ? userSnapshot.child('lessons').numChildren() : 0;

                students.push({
                    uid,
                    lastName,
                    firstName,
                    section: studentSection,
                    lessonCount
                });
            }
        });

        // Fetch additional data (study time, graded quiz count, practice quiz count) for each student
        const promises = students.map(student => {
            return Promise.all([
                fetchIndividualStudyTime(student.uid),
                fetchIndividualGradedQuizCount(student.uid),
                fetchIndividualPracticeQuizCount(student.uid)
            ]).then(([studyTime, gradedQuizCount, practiceQuizCount]) => {
                student.studyTime = studyTime;
                student.gradedQuizCount = gradedQuizCount;
                student.practiceQuizCount = practiceQuizCount;
                return student;
            });
        });

        // Once all data is fetched, populate the table
        Promise.all(promises).then(studentsWithDetails => {
            let index = 1;
            studentsWithDetails.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index++}</td>
                    <td>${student.lastName}</td>
                    <td>${student.firstName}</td>
                    <td>${student.section}</td>
                    <td>${student.studyTime} minutes</td>
                    <td>${student.lessonCount}</td>
                    <td>${student.gradedQuizCount}</td>
                    <td>${student.practiceQuizCount}</td>
                `;
                tableBody.appendChild(row);
            });
        }).catch(error => console.error("Failed to fetch additional data for students:", error));
    }).catch(error => console.error("Failed to fetch student data:", error));
}

// Fetch individual study time for a student based on their UID
function fetchIndividualStudyTime(uid) {
    return database.ref(`StudyTimer/${uid}`).once('value').then(snapshot => {
        let totalStudyTimeInSeconds = 0;
        snapshot.forEach(dateSnapshot => {
            totalStudyTimeInSeconds += dateSnapshot.child('Time').val() || 0;
        });
        return totalStudyTimeInSeconds / 60; // Convert to minutes
    }).catch(error => {
        console.error(`Failed to fetch study time for UID: ${uid}`, error);
        return 0;
    });
}

// Fetch individual graded quiz count for a student based on their UID
function fetchIndividualGradedQuizCount(uid) {
    return database.ref(`score_gradedQuiz/${uid}`)
        .once('value')
        .then(snapshot => {
            let count = 0;
            snapshot.forEach(topicSnapshot => {
                if (topicSnapshot.val().status === "completed") {
                    count++; // Count only completed quizzes
                }
            });
            return count;
        })
        .catch(error => {
            console.error(`Failed to fetch practice quiz count for UID: ${uid}`, error);
            return 0;
        });
}

// Fetch individual practice quiz count for a student based on their UID
function fetchIndividualPracticeQuizCount(uid) {
    return database.ref(`practice_quiz/${uid}`)
        .once('value')
        .then(snapshot => {
            let count = 0;
            snapshot.forEach(topicSnapshot => {
                if (topicSnapshot.val().status === "completed") {
                    count++; // Count only completed quizzes
                }
            });
            return count;
        })
        .catch(error => {
            console.error(`Failed to fetch practice quiz count for UID: ${uid}`, error);
            return 0;
        });
}


// Update table when a section is selected
function selectSection(section) {
    document.getElementById('sectionText').textContent = section;
    fetchDataForBarChart(section);
    fetchStudentsData(section);
}

// Initial load for 'All' section
fetchStudentsData();


// Check if the user is signed in when the page loads
// firebase.auth().onAuthStateChanged((user) => {
//     if (!user) {
//         // Redirect the user to the login page if they are not logged in
//         window.location.href = '../login.html';
//     }
// });

function logout() {
    // Firebase sign-out
    firebase.auth().signOut().then(() => {
        // Clear session storage if needed
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '../login.html';
    }).catch((error) => {
        console.error('Error during logout:', error);
    });
}

// firebase.auth().signOut().then(() => {
//     window.location.replace('../login.html');  // This prevents using the back button
// }).catch((error) => {
//     console.error('Error during logout:', error);
// });

// Update table when a section is selected
function selectSection(section) {
    document.getElementById('sectionText').textContent = section;
    fetchDataForBarChart(section);
    fetchStudentsData(section);
}

// Initial load for 'All' section
fetchStudentsData();


