import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({
      status: "failed",
      message: "Unauthorized User - No Token!",
    });
  }

  try {
    const token = authHeader.split(" ")[1]; // extract token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

    if (!decoded) {
      return res.status(403).json({
        status: "failed",
        message: "User Unauthorized - Invalid Token!",
      });
    }

    // Attach user info from token to request object
    req.userId = decoded.userId;
    req.mobileNumber = decoded.mobileNumber;

    // Don't re-sign token here — just verify it
    next();
  } catch (error) {
    console.error("Error in Verifying Token: ", error.message);
    return res.status(401).json({
      status: "failed",
      message: "Invalid or expired token",
    });
  }
};
