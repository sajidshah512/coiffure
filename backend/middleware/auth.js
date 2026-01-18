const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    // Prioritize Authorization: Bearer token, then fallback to x-auth-token
    let token = req.header('Authorization');

    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove 'Bearer ' prefix
    } else {
        token = req.header('x-auth-token'); // Fallback to x-auth-token
    }

    // Check if no token
    if (!token) {
        console.log('Auth Middleware: No token provided.'); // Added log
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- IMPORTANT: Adjust this section based on your JWT payload structure ---
        // The goal is to ensure req.user._id gets the actual user ID from the token.

        // Scenario 1: If your JWT payload directly contains the user ID as 'id' (most common)
        if (decoded.id) {
            req.user = { _id: decoded.id };
        }
        // Scenario 2: If your JWT payload contains a 'user' object with an '_id' field
        else if (decoded.user && decoded.user._id) {
            req.user = decoded.user;
        }
        // Scenario 3: If your JWT payload directly contains the user ID as '_id'
        else if (decoded._id) {
            req.user = { _id: decoded._id };
        }
        // Fallback if no known ID field is found (should ideally not happen if token is valid)
        else {
            console.error('Auth Middleware: Could not find user ID in decoded token payload:', decoded);
            return res.status(401).json({ message: 'Token is valid but user ID not found in payload.' });
        }
        // --- End of IMPORTANT section ---

        // Log the extracted user ID for debugging
        // console.log('Auth Middleware: req.user._id set to', req.user._id);

        next();
    } catch (err) {
        console.error('Auth Middleware: Token verification failed:', err.message); // Log the actual error for debugging
        res.status(401).json({ message: 'Your Login Session is Expired. Please login Again' });
    }
};
