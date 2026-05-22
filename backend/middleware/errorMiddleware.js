const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  console.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && isProduction ? "Internal server error" : error.message,
    stack: isProduction ? undefined : error.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
