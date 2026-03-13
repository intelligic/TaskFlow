const requireRole = (...roles) => (req, res, next) => {
  const allowedRoles = roles.flat().filter(Boolean);
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

export default requireRole;
