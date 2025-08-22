import passport from 'passport';
import config from "../config/config.js"

export const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated() && req.user?.role !== 'superAdmin') {
        return res.status(401).redirect('/admin/login')
    }
    next()
}

export const isAuthWithAccessCRUD = (req, res, next) => {
    if (!req.isAuthenticated() && config.crud_url && req.user?.role !== 'superAdmin') {
        return res.status(401).redirect('/admin')
    }
    if (req.isAuthenticated() && !config.crud_url) {
        return res.status(401).redirect('/admin')
    }
    next()
}

export const checkUserIsLogin = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return next(err)
        if (!user) return res.status(401).json({ error: "Unauthorized: Invalid or missing token" })
        req.user = user; // attach user to request
        next()
    })(req, res, next);
}