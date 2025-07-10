export const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(200).redirect(`${req.baseUrl}/login`)
    }
    next()
}