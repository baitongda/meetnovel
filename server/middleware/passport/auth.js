module.exports.isAdminLoginRequired = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'admin') {
        return next();
    }
    if (req.method == 'GET') {
        req.session.returnTo = req.originalUrl;
    }
    res.redirect('/admin/login');
};


module.exports.isNormalLoginRequired = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'normal') {
        return next();
    }
    if (req.method == 'GET') {
        req.session.returnTo = req.originalUrl;
    }
    res.redirect('/admin/login');
};
