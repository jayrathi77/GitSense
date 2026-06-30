import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { errors: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
