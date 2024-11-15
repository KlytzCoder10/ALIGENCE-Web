function sendOTP() {
    const email = document.getElementById('email').value;
    if (email) {
        alert(`OTP sent to ${email}`);
    } else {
        alert("Please enter your email.");
    }
}

function verifyOTP() {
    const otp = document.getElementById('otp').value;
    if (otp) {
        alert("OTP Verified");
    } else {
        alert("Please enter the OTP.");
    }
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (field.type === "password") {
        field.type = "text";
    } else {
        field.type = "password";
    }
}

// document.getElementById('passwordForm').addEventListener('submit', function(event) {
//     event.preventDefault();
//     const newPassword = document.getElementById('newPassword').value;
//     const confirmPassword = document.getElementById('confirmPassword').value;

//     if (newPassword === confirmPassword) {
//         alert("Password changed successfully!");
//     } else {
//         alert("New Password and Confirm Password do not match.");
//     }
// });

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
          const uid = user.uid;
          fetchAdminData(uid); // Fetch data using the logged-in user's ID
      }
  });
  // Fetch and display data for the teacher based on logged-in user ID
  function fetchAdminData(uid) {
      const teacherRef = database.ref(`users/${uid}`);
  
      teacherRef.once('value').then((snapshot) => {
          const data = snapshot.val();
          
          // Populate form fields if data exists
          if (data) {
              document.getElementById('admin-name').value = `${data.firstName || ''} ${data.lastName || ''}`;
              document.getElementById('email').value = data.email || '';
          } else {
              console.error('No data found for the specified teacher ID');
          }
      }).catch((error) => {
          console.error('Error fetching data:', error);
      });
  }  

// Function to handle email change with re-authentication
function changeEmail() {
    const newEmail = prompt("Enter your new email address:");
    const user = firebase.auth().currentUser;

    if (newEmail) {
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, // User's current email
            prompt("Enter your current password:") // Ask user for their current password
        );

        // Re-authenticate the user
        user.reauthenticateWithCredential(credential).then(() => {
            // Once re-authenticated, update the email
            user.updateEmail(newEmail)
                .then(() => {
                    alert("Email updated successfully.");
                    // Update email in the Firebase Realtime Database if needed
                    updateEmailInDatabase(newEmail);
                })
                .catch((error) => {
                    console.error("Error updating email:", error);
                    alert("Error updating email. Please try again.");
                });
        }).catch((error) => {
            console.error("Error during re-authentication:", error);
            alert("Re-authentication failed. Please enter the correct current password.");
        });
    } else {
        alert("Please provide a valid email address.");
    }
}


// Function to update the email in Firebase Realtime Database
function updateEmailInDatabase(newEmail) {
    const user = firebase.auth().currentUser;
    if (user) {
        const userRef = firebase.database().ref(`users/${user.uid}`);
        userRef.update({
            email: newEmail
        }).then(() => {
            console.log("Email updated in the database.");
        }).catch((error) => {
            console.error("Error updating email in database:", error);
        });
    }
}

// Fetch and display data for the teacher based on logged-in user ID
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const uid = user.uid;
        fetchTeacherData(uid); // Fetch data using the logged-in user's ID
    }
});

// Fetch and display teacher data from Firebase
function fetchTeacherData(uid) {
    const teacherRef = firebase.database().ref(`users/${uid}`);

    teacherRef.once('value').then((snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            document.getElementById('teacher-id').value = data.teacherNum || '';
            document.getElementById('teacher-name').value = `${data.firstName || ''} ${data.lastName || ''}`;
            document.getElementById('email').value = data.email || '';
        } else {
            console.error('No data found for the specified teacher ID');
        }
    }).catch((error) => {
        console.error('Error fetching data:', error);
    });
}

// Function to open the password modal
function openPasswordModal() {
    document.getElementById("password-modal").style.display = "block";
}

// Function to handle password change with re-authentication
function changePassword() {
    // Open the password change modal
    document.getElementById("password-modal").style.display = "block";
}

// Function to validate strong password
function isStrongPassword(password) {
    const minLength = 8;
    const upperCasePattern = /[A-Z]/;   // Uppercase letter pattern
    const lowerCasePattern = /[a-z]/;   // Lowercase letter pattern
    const numberPattern = /\d/;         // Number pattern
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;  // Special character pattern

    if (password.length < minLength) {
        return "Password must be at least 8 characters long.";
    }
    if (!upperCasePattern.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!lowerCasePattern.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!numberPattern.test(password)) {
        return "Password must contain at least one number.";
    }
    if (!specialCharPattern.test(password)) {
        return "Password must contain at least one special character.";
    }
    
    return null; // No validation errors, password is strong
}

// Function to update the password
function updatePassword(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const user = firebase.auth().currentUser;

    // Ensure passwords match
    if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
    }

    // Validate the strength of the new password
    const validationError = isStrongPassword(newPassword);
    if (validationError) {
        alert(validationError); // Show the password strength error
        return; // Stop the function from proceeding
    }

    // Check if current password and new password are provided
    if (currentPassword && newPassword) {
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, // User's current email
            currentPassword // Ask user for their current password
        );

        // Re-authenticate the user
        user.reauthenticateWithCredential(credential).then(() => {
            // Once re-authenticated, update the password
            user.updatePassword(newPassword)
                .then(() => {
                    alert("Password changed successfully.");
                    closeModal();  // Close modal after success
                })
                .catch((error) => {
                    console.error("Error changing password:", error);
                    alert("Error changing password. Please try again.");
                });
        }).catch((error) => {
            console.error("Error during re-authentication:", error);
            alert("Re-authentication failed. Please enter the correct current password.");
        });
    } else {
        alert("Please provide valid inputs.");
    }
}

// Function to close the modal
function closeModal() {
    document.getElementById("password-modal").style.display = "none";
}


// Function to toggle password visibility
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;  // The button next to the input field

    if (field.type === "password") {
        field.type = "text";
        button.textContent = "Hide";  // Change button text to "Hide" when password is visible
    } else {
        field.type = "password";
        button.textContent = "Show";  // Change button text to "Show" when password is hidden
    }
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