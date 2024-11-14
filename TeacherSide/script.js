// BAR CHART

var barChartOptions = {
  series: [{
    name: '',
    data: [12, 15, 18, 20]
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
    categories: ['No. of Students', 'No. of App Users', 'No. of Teachers', 'No. of Archived Data'],
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
    position: 'top',        // Position legend on the top
    horizontalAlign: 'left'
     // Align legend to the left
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

function logout() {
  // Firebase sign-out
  firebase.auth().signOut().then(() => {
      // Redirect to login page after successful logout
      window.location.href = '../login.html';
  }).catch((error) => {
      console.error('Error during logout:', error);
  });
}

// Responsive Sidebar
// Toggle sidebar visibility on smaller screens
document.addEventListener("DOMContentLoaded", function() {
    const menuButton = document.querySelector('.menu');
    const sidebar = document.querySelector('.sidebar');

    if (menuButton && sidebar) {
        menuButton.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});



updateTimeAndDate();
setInterval(updateTimeAndDate, 1000);