const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    const tokenString = token.split(' ')[1];

    try {
        const decoded = jwt.verify(tokenString, process.env.SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error during token verification:', error);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

module.exports = { authenticateUser };
