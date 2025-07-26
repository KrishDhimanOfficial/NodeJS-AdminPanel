import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
dotenv.config()

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

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
                    if (!user) return done(null, false, { error: 'User not found' });

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