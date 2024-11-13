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

document.getElementById('passwordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword === confirmPassword) {
        alert("Password changed successfully!");
    } else {
        alert("New Password and Confirm Password do not match.");
    }
});
