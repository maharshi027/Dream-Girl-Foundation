import jwt from "jsonwebtoken";

// ============================================================================
// JWT TOKEN GENERATION & VERIFICATION
// ============================================================================

/**
 * Generate JWT Access Token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
  const expiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m";

  if (!secret) {
    throw new Error("JWT_ACCESS_TOKEN_SECRET not configured");
  }

  const token = jwt.sign(payload, secret, { expiresIn: expiry });
  return token;
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
  const expiry = process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d";

  if (!secret) {
    throw new Error("JWT_REFRESH_TOKEN_SECRET not configured");
  }

  const token = jwt.sign(payload, secret, { expiresIn: expiry });
  return token;
};

/**
 * Verify JWT Access Token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_TOKEN_SECRET not configured");
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Verify JWT Refresh Token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_TOKEN_SECRET not configured");
  }

  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw new ServerError(
      `Refresh token verification failed: ${error.message}`,
    );
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload (user data)
 * @returns {Object} {accessToken, refreshToken}
 */
export const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
  };
};
