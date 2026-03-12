import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  const tokenFromHeader = req.headers["x-auth-token"] || req.headers.token;
  const token =
    bearerToken ||
    (Array.isArray(tokenFromHeader) ? tokenFromHeader[0] : tokenFromHeader);

  if (!token) {
    return res.status(401).json({
      message: "No token provided. Send Authorization: Bearer <token>",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protect;
