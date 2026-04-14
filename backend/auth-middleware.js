const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized. Missing Bearer token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
}

module.exports = { requireAuth };
