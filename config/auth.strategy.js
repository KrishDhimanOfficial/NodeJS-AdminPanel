import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { Strategy, ExtractJwt } from 'passport-jwt'
dotenv.config()

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import config from './config.js'

export const Login_Auth = async (model, field1 = 'email', field2 = 'password') => {
    return passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: field1,
                passwordField: field2,
            },
            async (email, password, done) => {
                try {
                    const user = await model.findOne({ email })
                    if (!user) return done(null, false, { error: 'User not found' })

                    const match = await bcrypt.compare(password, user.password);
                    if (!match) return done(null, false, { error: 'Incorrect password' })

                    return done(null, user)
                } catch (err) {
                    return done(err)
                }
            }
        )
    )
}

passport.use(new Strategy( // JWT Auth
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt_key,
    },
    async (jwt_payload, done) => {
        try {
            const user = await model.findById(jwt_payload.id)
            if (user) return done(null, user)
            return done(null, false)
        } catch (err) {
            return done(err, false)
        }
    })
)