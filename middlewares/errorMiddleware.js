// errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
    // Extract the error message from the error object
    const errorMessage = err.message || 'Internal Server Error';
    res.status(500).json({ message: errorMessage });
};

module.exports = errorMiddleware;
