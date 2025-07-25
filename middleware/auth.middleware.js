export const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated() && req.user?.role !== 'superAdmin') {
        return res.status(401).redirect(`${req.baseUrl}/login`)
    }
    next()
}