exports.methods = (req, res, next) => {
    if (req.query._method == 'PUT') {

        req.method = 'PUT';
        req.url = req.path;
    } else {
        if (req.query._method == 'DELETE') {

            req.method = 'DELETE';

            req.url = req.path;
        }
    }
    next();
}