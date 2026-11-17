const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("./prisma");

const TOKEN_ISSUER = "devforge-api";
const TOKEN_LIFETIME = "12h";
const configuredSecret = process.env.AUTH_TOKEN_SECRET;

if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("AUTH_TOKEN_SECRET must be set to at least 32 characters in production");
}

const tokenSecret = configuredSecret || "devforge-stable-auth-token-secret-fallback-key-32chars";

function createAuthToken(userId) {
  return jwt.sign({}, tokenSecret, {
    algorithm: "HS256",
    expiresIn: TOKEN_LIFETIME,
    issuer: TOKEN_ISSUER,
    subject: userId,
  });
}

function verifyAuthToken(token) {
  return jwt.verify(token, tokenSecret, {
    algorithms: ["HS256"],
    issuer: TOKEN_ISSUER,
  });
}

async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  let payload;
  try {
    payload = verifyAuthToken(match[1]);
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token" });
  }

  if (typeof payload.sub !== "string") {
    return res.status(401).json({ success: false, message: "Invalid authentication token" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    req.authUser = user;
    return next();
  } catch (error) {
    console.error("Authentication lookup failed:", error);
    return res.status(500).json({ success: false, message: "Failed to verify authentication" });
  }
}

function optionalAuth(req, res, next) {
  if (!req.get("authorization")) {
    return next();
  }
  return requireAuth(req, res, next);
}

function requireAdmin(req, res, next) {
  if (req.authUser?.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Administrator access required" });
  }
  return next();
}

module.exports = {
  createAuthToken,
  verifyAuthToken,
  requireAuth,
  optionalAuth,
  requireAdmin,
};
