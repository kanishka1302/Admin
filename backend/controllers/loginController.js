import Login from "../models/loginModel.js"; // Import the Login model


// Store phone number when requesting OTP
export const createLogin = async (req, res) => {
  try {
    const { phoneNumber, verificationId } = req.body;

    if (!phoneNumber || !verificationId) {
      return res.status(400).json({ success: false, message: "Phone number and verification ID are required" });
    }

    let existingUser = await Login.findOne({ phoneNumber });

    if (!existingUser) {
      existingUser = new Login({ phoneNumber, verificationId });
    } else {
      existingUser.verificationId = verificationId;
    }

    await existingUser.save();
    res.status(201).json({ success: true, message: "Phone number stored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error storing phone number", error: error.message });
  }
};

// Controller to verify the login (e.g., handle OTP verification or other verification mechanisms)
export const verifyLogin = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body; // Example: OTP verification logic

    // Find user by phone number
    const user = await Login.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Here, add your OTP verification logic, this is just a placeholder
    if (otp !== "1234") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update the login verification status
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Login verified successfully" });
  } catch (err) {
    console.error("Error verifying login:", err);
    res.status(500).json({ message: "Error verifying login", error: err.message });
  }
};

// Controller to get all logins (you can expand this for specific queries)
export const getAllLogins = async (req, res) => {
  try {
    const logins = await Login.find();
    res.status(200).json({ data: logins });
  } catch (err) {
    console.error("Error fetching logins:", err);
    res.status(500).json({ message: "Error fetching login records", error: err.message });
  }
};

export const checkUserExists = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const existingUser = await Login.findOne({ phoneNumber });

    if (existingUser) {
      return res.json({ exists: true, token: existingUser.token });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error("Database Query Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
