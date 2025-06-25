export const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) res.status(200).redirect(`${req.baseUrl}/login`)
    next()
}