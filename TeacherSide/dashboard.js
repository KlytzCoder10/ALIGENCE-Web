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

// Firebase initialization and database reference
const database = firebase.database();

// Initialize Firebase Authentication and update the welcome message on login
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        updateWelcomeMessage();
        fetchDataForBarChart();
    }
});

// Fetch and display the first name of the logged-in teacher
function updateWelcomeMessage() {
    const user = firebase.auth().currentUser;

    if (user) {
        const uid = user.uid;
        const userRef = database.ref(`/users/${uid}`);

        userRef.once('value').then(snapshot => {
            const role = snapshot.child('role').val();
            const firstName = snapshot.child('firstName').val();

            if (role === 'teacher' && firstName) {
                document.querySelector('.welcome h2').textContent = `Welcome back, ${firstName}!`;
            } else {
                document.querySelector('.welcome h2').textContent = 'Welcome back!';
            }
        }).catch(error => {
            console.error("Failed to fetch user's name:", error);
        });
    } else {
        console.log("No user is currently signed in.");
    }
}

// Fetch data for bar chart
function fetchDataForBarChart() {
    Promise.all([
        fetchStudyTime(),
        fetchLessonCount(),
        fetchGradedQuizCount(),
        fetchStudentCount()
    ]).then(values => {
        const [studyTime, lessonCount, gradedQuizCount, studentCount] = values;
        updateBarChart([studyTime, lessonCount, gradedQuizCount, studentCount]);
    }).catch(error => {
        console.error("Error fetching data for bar chart:", error);
    });
}

// Helper functions to fetch each metric
function fetchStudyTime() {
    return database.ref('StudyTimer').once('value').then(snapshot => {
        let totalStudyTimeInSeconds = 0;
        snapshot.forEach(userSnapshot => {
            userSnapshot.forEach(dateSnapshot => {
                const timeInSeconds = dateSnapshot.child('Time').val();
                if (timeInSeconds) {
                    totalStudyTimeInSeconds += timeInSeconds;
                }
            });
        });
        return (totalStudyTimeInSeconds / 60); // Convert to hours
    });
}

function fetchLessonCount() {
    return database.ref('/users').once('value').then(snapshot => {
        let lessonCount = 0;
        snapshot.forEach(childSnapshot => {
            const role = childSnapshot.child('role').val();
            if (role === 'student') {
                // Assuming each student has a 'lessons' node containing their lessons
                const lessons = childSnapshot.child('lessons').val();
                if (lessons) {
                    lessonCount += Object.keys(lessons).length; // Counting lessons
                }
            }
        });
        return lessonCount;
    });
}


function fetchGradedQuizCount() {
    return database.ref('score_gradedQuiz').once('value').then(snapshot => snapshot.numChildren());
}

function fetchStudentCount() {
    return database.ref('/users').once('value').then(snapshot => {
        let studentCount = 0;
        snapshot.forEach(childSnapshot => {
            const role = childSnapshot.child('role').val();
            if (role === 'student') {
                studentCount++;
            }
        });
        return studentCount;
    });
}

// Update the bar chart with new data
function updateBarChart(data) {
    barChart.updateSeries([{
        data: data
    }]);
}

// BAR CHART OPTIONS
var barChartOptions = {
    series: [{
        name: '',
        data: []  // Data will be updated dynamically
    }],
    chart: {
        type: 'bar',
        height: 350,
        toolbar: {
            show: false,
        },
    },
    colors: [
        "#8F81C7",
        "#C781B3",
        "#C7B381",
        "#CE4C44"
    ],
    plotOptions: {
        bar: {
            distributed: true,
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
        },
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Studying Time', 'Lessons', 'Graded Quiz', 'Students'],
        title: {
            color: '#f5f7ff',
        },
    },
    yaxis: {
        title: {
            text: ''
        },
    },
    legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left'
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + "  ";
            }
        }
    }
};

var barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
barChart.render();

// Update Time and Date
function updateTimeAndDate() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    const timeString = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString(undefined, options);

    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Fetch data for bar chart and update the cards
function fetchDataForBarChart() {
  Promise.all([
      fetchStudyTime(),
      fetchLessonCount(),
      fetchGradedQuizCount(),
      fetchStudentCount()
  ]).then(values => {
      const [studyTime, lessonCount, gradedQuizCount, studentCount] = values;

      // Update the bar chart
      updateBarChart([studyTime, lessonCount, gradedQuizCount, studentCount]);

      // Update the cards
      document.getElementById("studyingTime").textContent = studyTime + " minutes";
      document.getElementById("lessons").textContent = lessonCount;
      document.getElementById("gradedQuiz").textContent = gradedQuizCount;
      document.getElementById("userCount").textContent = studentCount;
  }).catch(error => {
      console.error("Error fetching data for bar chart:", error);
  });
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


// Initialize Time and Date update
updateTimeAndDate();
setInterval(updateTimeAndDate, 1000);