module.exports = function(req, res, next) {
    // Assuming auth middleware has already run and attached req.user
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin privileges required' });
    }
    next();
};
