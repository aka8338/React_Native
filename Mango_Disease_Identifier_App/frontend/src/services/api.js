import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Determine appropriate baseURL based on platform and environment
// For Android emulator: 10.0.2.2 points to the host machine's localhost
// For iOS simulator: 127.0.0.1 points to the host machine's localhost
// For physical devices: Use your development machine's actual IP address
const getBaseUrl = () => {
  // Replace with your computer's IP address when testing on physical devices
  const DEVELOPMENT_MACHINE_IP = "192.168.135.165"; // Using your machine's IP address

  if (__DEV__) {
    if (Platform.OS === "android") {
      // When using Expo Go, use the machine IP instead of 10.0.2.2
      return `http://${DEVELOPMENT_MACHINE_IP}:5000/api`;
    } else if (Platform.OS === "ios") {
      // When using Expo Go, use the machine IP instead of 127.0.0.1
      return `http://${DEVELOPMENT_MACHINE_IP}:5000/api`;
    } else {
      return `http://${DEVELOPMENT_MACHINE_IP}:5000/api`; // Other platforms
    }
  }

  // Production API URL
  return "https://your-production-api.com/api"; // Update with your production URL
};

const BASE_URL = getBaseUrl();
console.log("API connecting to:", BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // Increased timeout to 30 seconds
});

// Add a separate instance for the prediction API that bypasses the /api path
const predictionApi = axios.create({
  baseURL: getBaseUrl().replace("/api", ""),
  timeout: 60000, // Longer timeout for image processing
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error("API Error:", error.message);
    console.error(
      "API Error Response:",
      error.response?.data || "No response data"
    );

    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("userData");
      // Redirect to login (You might need to use a navigation ref here)
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Auth API services
export const AuthService = {
  signUp: async (email, password, name = "") => {
    try {
      console.log("Attempting signup with:", { email, name });
      const response = await api.post("/auth/signup", {
        email,
        password,
        name,
      });
      console.log("Signup response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Signup error:", error.message);
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      console.log("API: Verifying OTP for email:", email);
      const response = await api.post("/auth/verify-otp", { email, otp });
      console.log("API: OTP verification response:", response.data);

      // Ensure we don't store any auth data here
      // Remove any existing auth data
      await AsyncStorage.multiRemove(["auth_token", "userData"]);

      return response.data;
    } catch (error) {
      console.error("API: OTP verification error:", error.message);
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  login: async (email, password) => {
    try {
      console.log("API: Attempting login with email:", email);
      const response = await api.post("/auth/login", { email, password });
      console.log("API: Login response:", response.data);

      // Only store auth token if login is successful and account is verified
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem("auth_token", response.data.token);
        await AsyncStorage.setItem(
          "userData",
          JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            isAuthenticated: true,
          })
        );
        console.log("API: Login successful, user data stored");
      } else if (response.data.requires_verification) {
        console.log("API: Login failed - account requires verification");
      } else {
        console.log("API: Login failed - invalid credentials");
      }

      return response.data;
    } catch (error) {
      console.error("API: Login error:", error.message);
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  resendOTP: async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("userData");
      return { success: true };
    } catch (error) {
      throw { message: "Logout failed" };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },
};

// User API services
export const UserService = {
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  updateProfile: async (name) => {
    try {
      const response = await api.put("/users/profile", { name });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post("/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: "Network error" };
    }
  },
};

// Disease Identification API services
export const DiseaseService = {
  identifyDisease: async (imageUri) => {
    try {
      console.log("Sending image for disease identification:", imageUri);

      // Create form data to send the image
      const formData = new FormData();

      // Extract filename from URI
      const filename = imageUri.split("/").pop();

      // Determine the file type (mime type)
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // Append the image to form data with the key 'image' - this key must match what the server expects
      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: type,
      });

      console.log("Form data created, sending to prediction API");

      // Get the base URL without the /api part
      const baseUrl = getBaseUrl().replace("/api", "");
      console.log("Using base URL for prediction:", baseUrl);

      // Send the request directly without using predictionApi instance
      // This provides more control over the request format
      const response = await fetch(`${baseUrl}/predict`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // Don't set Content-Type header, it will be set automatically with boundary
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(
          `Server responded with ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Disease identification response:", data);

      // Process the response to ensure it has all the fields we need
      const processedData = {
        // Ensure all expected fields are present
        prediction: data.prediction || data.disease || data.class || "Unknown",
        disease: data.disease || data.prediction || data.class || "Unknown",
        disease_name:
          data.disease_name || data.name || data.disease || "Unknown Disease",
        probability: data.probability || data.confidence || 0.75,
        symptoms: data.symptoms || [],
        recommendations: data.recommendations || [],
      };

      return processedData;
    } catch (error) {
      console.error("Disease identification error:", error.message);
      throw error.response
        ? error.response.data
        : {
            message:
              error.message || "Network error during disease identification",
          };
    }
  },
};

export default {
  AuthService,
  UserService,
  DiseaseService,
};
