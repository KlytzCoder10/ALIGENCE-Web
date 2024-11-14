const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})

//Check if the user is signed in when the page loads
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
      // Redirect the user to the login page if they are not logged in
      window.location.href = '../login.html';
  }
});

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

firebase.auth().signOut().then(() => {
  window.location.replace('../login.html');  // This prevents using the back button
}).catch((error) => {
  console.error('Error during logout:', error);
});