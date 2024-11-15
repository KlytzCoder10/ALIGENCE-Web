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

const database = firebase.database();
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        updateWelcomeMessage();
        fetchDataForBarChart();
    }
});

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

var barChartOptions = {
  series: [{
    name: 'Users',
    data: [0, 0, 0, 0] 
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
    categories: ['No. of Students', 'No. of Teachers', 'No. of Online Users', 'No. of Offline Users'],
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
    horizontalAlign: 'center'
  }, 

  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + " entries ";
      }
    }
  }
};

var barChart = new ApexCharts(document.querySelector("#bar-chart"), barChartOptions);
barChart.render();

function fetchTeacherCount() {
  return database.ref('/users').once('value').then(snapshot => {
      let teacherCount = 0;
      snapshot.forEach(childSnapshot => {
          const role = childSnapshot.child('role').val();
          if (role === 'teacher') {
              teacherCount++;
          }
      });
      document.getElementById("teacherCount").textContent = teacherCount;
  }).catch(error => {
      console.error("Error fetching teacher count:", error);
  });
}

function fetchOnlineUserCount() {
  const onlineUserRef = database.ref('/users');
  onlineUserRef.on('value', snapshot => {
    let onlineUserCount = 0;

    snapshot.forEach(childSnapshot => {
      const status = childSnapshot.child('status').val();
      if (status === 'Online') {
        onlineUserCount++;
      }
    });

    document.getElementById("onlineUserCount").textContent = onlineUserCount;
  }, error => {
    console.error("Error fetching online user count:", error);
  });
}

function fetchOfflineUserCount() {
  const onlineUserRef = database.ref('/users');
  onlineUserRef.on('value', snapshot => {
    let onlineUserCount = 0;

    snapshot.forEach(childSnapshot => {
      const status = childSnapshot.child('status').val();
      if (status === 'Offline') {
        offlineUserCount++;
      }
    });
  });
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
      document.getElementById("userCount").textContent = studentCount;
  }).catch(error => {
      console.error("Error fetching student count:", error);
  });
}

function fetchDataForBarChart() {
  return database.ref('/users').once('value').then(snapshot => {
    let studentCount = 0;
    let teacherCount = 0;
    let onlineCount = 0;
    let offlineCount = 0;

    snapshot.forEach(childSnapshot => {
      const role = childSnapshot.child('role').val();
      const status = childSnapshot.child('status').val();

      if (role === 'student') {
        studentCount++;
      } else if (role === 'teacher') {
        teacherCount++;
      }

      if (status === 'Online') {
        onlineCount++;
      } else if (status === 'Offline') {
        offlineCount++;
      }
        else if (status === 'Disconnected') {
        offlineCount++;
      }
    });

    barChart.updateSeries([{
      name: 'Users',
      data: [studentCount, teacherCount, onlineCount, offlineCount]
    }]);

    // Update x-axis categories to match the data
    barChart.updateOptions({
      xaxis: {
        categories: ['No. of Students', 'No. of Teachers', 'Online Users', 'Offline Users']
      }
    });

    console.log("Bar chart data updated:", { studentCount, teacherCount, onlineCount, offlineCount });
  }).catch(error => {
    console.error("Error fetching data for bar chart:", error);
  });
}


// TIME AND DATE

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

fetchStudentCount();
fetchTeacherCount();
fetchOnlineUserCount();
fetchOfflineUserCount();
updateTimeAndDate();
setInterval(updateTimeAndDate, 1000);

function logout() {
  // Firebase sign-out
  firebase.auth().signOut().then(() => {
      // Redirect to login page after successful logout
      window.location.href = '../login.html';
  }).catch((error) => {
      console.error('Error during logout:', error);
  });
}