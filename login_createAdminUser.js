// Import Firebase Admin SDK
const admin = require("firebase-admin");
const serviceAccount = require("./aligence-4587c-firebase-adminsdk-r36nj-105998af48.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://aligence-4587c-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

// Function to create default admin user
async function createDefaultAdmin() {
    try {
        // Check if user already exists
        const user = await admin.auth().getUserByEmail("fayretala@gmail.com").catch(() => null);
        if (user) {
            console.log("User with this email already exists.");
            return;
        }

        // Create the user with email and password
        const userRecord = await admin.auth().createUser({
            email: "fayretala@gmail.com",
            password: "defaultPassword123",
            emailVerified: true,
            displayName: "Admin User",
        });

        // Set role and additional data in the Realtime Database
        await admin.database().ref("users/" + userRecord.uid).set({
            firstName: "Admin",
            role: "admin",
            email: "fayretala@gmail.com"
        });

        console.log("Default admin user created successfully");
    } catch (error) {
        console.error("Error creating default admin:", error);
    }
}

// Run the function to create the admin user
createDefaultAdmin();
