import config from "../config/config.js"

export const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated() && req.user?.role !== 'superAdmin') {
        return res.status(401).redirect('/admin/login')
    }
    next()
}

export const isAuthWithAccessCRUD = (req, res, next) => {
    if (!req.isAuthenticated() && config.crud_url && req.user?.role !== 'superAdmin') {
        return res.status(401).redirect('/admin/login')
    }
    if (req.isAuthenticated() && !config.crud_url) {
        return res.status(401).redirect('/admin/login')
    }
    next()
}