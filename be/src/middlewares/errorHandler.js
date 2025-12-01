// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Development error handler - sends detailed error info
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// Production error handler - sends limited error info
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
    });
  }
};

// Handle specific error types
const handleCastErrorDB = (err) => {
  const message = `Giá trị không hợp lệ: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Giá trị trùng lặp: ${value}. Vui lòng sử dụng giá trị khác!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Dữ liệu không hợp lệ. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);

const handleJWTExpiredError = () =>
  new AppError('Token đã hết hạn. Vui lòng đăng nhập lại!', 401);

// Handle Sequelize unique constraint error
const handleSequelizeUniqueConstraintError = (err) => {
  // Extract field name and value from the error
  const field = err.errors?.[0]?.path || err.fields?.[0];
  
  // Check if it's the name field - return specific message
  if (field === 'name' || (err.parent && err.parent.constraint?.includes('name'))) {
    const error = new AppError('Tên sản phẩm đã tồn tại', 400);
    error.status = 'error'; // Override status to 'error' instead of 'fail'
    return error;
  }
  
  // Generic message for other unique constraint violations
  const value = err.errors?.[0]?.value;
  const message = `Giá trị '${value}' đã tồn tại cho trường '${field}'. Vui lòng sử dụng giá trị khác!`;
  const error = new AppError(message, 400);
  error.status = 'error';
  return error;
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Sequelize unique constraint error in both dev and prod
  let isUniqueConstraintError = false;
  if (err.name === 'SequelizeUniqueConstraintError') {
    isUniqueConstraintError = true;
    err = handleSequelizeUniqueConstraintError(err);
  }

  // Override status to 'error' for product name duplicate errors
  if (err.message === 'Tên sản phẩm đã tồn tại') {
    err.status = 'error';
  }

  if (process.env.NODE_ENV === 'development') {
    // For development, return clean error format for SequelizeUniqueConstraintError
    if (isUniqueConstraintError || err.message === 'Tên sản phẩm đã tồn tại') {
      return res.status(err.statusCode || 400).json({
        status: 'error',
        message: err.message,
      });
    }
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = {
  AppError,
  errorHandler,
};
