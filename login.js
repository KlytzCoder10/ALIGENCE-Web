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
const auth = firebase.auth();
const database = firebase.database();

let selectedRole = null;

// Role selection function
function selectRole(roleElement) {
    const roles = document.querySelectorAll('.role-option');
    roles.forEach(role => role.classList.remove('selected'));
    roleElement.classList.add('selected');
    selectedRole = roleElement.id;
}

// Login function with role-based redirection, Firebase authentication, and first name retrieval
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!selectedRole) {
        alert('Please select a role before logging in.');
        return;
    }

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // User is signed in
            const user = userCredential.user;

            // Check user role and retrieve first name from Firebase Database
            database.ref('users/' + user.uid).once('value')
                .then(snapshot => {
                    const userData = snapshot.val();
                    const role = userData.role;
                    const firstName = userData.firstName;

                    // Check if the role matches the selected role
                    if (selectedRole === 'teacher-login' && role === 'teacher') {
                        alert(`Welcome, ${firstName}!`);
                        window.location.href = "TeacherSide/dashboard.html"; // Redirect to teacher dashboard
                    } else if (selectedRole === 'admin-login' && role === 'admin') {
                        alert(`Welcome, ${firstName}!`);
                        window.location.href = 'Admin/dashboard.html'; // Redirect to admin dashboard
                    } else {
                        alert("You do not have the correct role for this login.");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert("Error fetching user data. Please try again.");
                });
        })
        .catch((error) => {
            console.error(error);
            alert("Invalid email or password. Please try again.");
        });
}

// Forgot Password Modal Functions
function openForgotPasswordModal() {
    document.getElementById("modal-overlay").style.display = "flex";
}

function closeForgotPasswordModal() {
    document.getElementById("modal-overlay").style.display = "none";
}

function sendResetLink() {
    const email = document.getElementById("reset-email").value;
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert(`A password reset link has been sent to ${email}.`);
                closeForgotPasswordModal();
            })
            .catch((error) => {
                alert("Error sending reset email. Please try again.");
            });
    } else {
        alert("Please enter your email address.");
    }
}
