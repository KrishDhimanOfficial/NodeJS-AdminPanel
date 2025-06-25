import { Login_Auth } from '../config/auth.strategy.js';

const strategyRouter = {
    localStrategy: async (req, res, next, model) => {
        const passportInstance = await Login_Auth(model)

        passportInstance.authenticate('local-login', (err, user, info) => {
            if (err) return next(err)
            if (!user) {
                return res.status(401).render('login', {
                    layout: false,
                    title: 'Login',
                    error: info?.message || 'Incorrect Email & Password.',
                })
            }

            req.logIn(user, (err) => {
                if (err) return next(err)
                return res.redirect(req.baseUrl)
            })
        })(req, res, next)
    },
    localStrategyLogout: async (req, res, next) => {
        return req.logout((err) => {
            if (err) return next(err)
            req.session.destroy(() => {
                res.clearCookie('connect.sid')
                return res.redirect(`${req.baseUrl}/login`)
            })
        })
    }
}

export default strategyRouter