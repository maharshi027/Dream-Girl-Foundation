import {
  generateRefreshToken,
  generateAccessToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

export const login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPass) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT tokens
    const payload = {
      role: "admin",
      email: adminEmail,
      timestamp: new Date().toISOString(),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry,
      tokenType: "Bearer",
      adminEmail,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

/**
 * Refresh Access Token - Generate new access token using refresh token
 * POST /api/auth/refresh-token
 * Body: { refreshToken: string }
 * Returns: { accessToken, expiresIn }
 */
export const refreshAccessToken = (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    // Validate required field
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token with same payload
    const newPayload = {
      role: decoded.role,
      email: decoded.email,
      timestamp: new Date().toISOString(),
    };

    const newAccessToken = generateAccessToken(newPayload);
    const accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
      expiresIn: accessTokenExpiry,
      tokenType: "Bearer",
    });
  } catch (error) {
    console.error("Refresh Access Token Error:", error);
    res.status(401).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

export const verifyPassword = (req, res) => {
  try {
    const { password } = req.body || {};

    // Validate required field
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const adminPass = process.env.ADMIN_PASSWORD || "admin123";

    if (password === adminPass) {
      return res.status(200).json({
        success: true,
        message: "Access granted",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};
