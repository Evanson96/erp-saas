const jwt = require("jsonwebtoken");

const customerAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Customer authorization token is required",
    });
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);

    if (decoded.type !== "customer") {
      return res.status(403).json({
        message: "Customer access is required",
      });
    }

    req.customer = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired customer token",
    });
  }
};

module.exports = customerAuthMiddleware;
