var { match } = require('react-router');

// isomorphic 路由处理
module.exports.routerMatch = function (req, res, routes) {
    return new Promise((resolve, reject) => {
        match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
            if (err) {
                res.render('500', JSON.stringify(err));
            } else if (redirectLocation) {
                res.redirect(redirectLocation.pathname + redirectLocation.search);
            } else if (renderProps) {
                resolve(renderProps);
            } else {
                res.render('404');
            }
        });
    });
}

