import * as jsonwebtoken from 'jsonwebtoken';
import { keys } from '../config/keys';

export var permitted = (...allowed) => {
    const isAllowed = role => (!allowed || allowed.indexOf("*") > -1 || allowed.indexOf(role) > -1);
    // return a middleware
    return (req, res, next) => {
        try {
            const apiToken = req.headers['authorization'];
            if (!apiToken) {
                res.status(400).json({ message: 'missing authorization header' }); // auth token not found
            }
            else {
                let decoded: any = jsonwebtoken.verify(apiToken, keys.jwt.secret);
                let _isallowed = false;
                if (decoded.sub == 'refresh') {
                    _isallowed = isAllowed('refresh');
                }
                else {
                    _isallowed = isAllowed(decoded.role);
                }

                if (_isallowed) {
                    next(); // role is allowed, so continue on the next middleware
                    return;
                }
                else {
                    res.status(403).json({ message: "Forbidden" }); // user is forbidden
                }
            }
        } catch (err) {
            res.status(403).json({ message: "Forbidden" });
            // return next('router')
        }
    }
};