import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  try {
    const msg = err?.stack || err?.message || String(err);
    logger.error(
      `${req.method} ${req.originalUrl} -> ${statusCode} :: ${msg}`,
    );
  } catch {
    // ignore
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });

};

export default errorHandler;
