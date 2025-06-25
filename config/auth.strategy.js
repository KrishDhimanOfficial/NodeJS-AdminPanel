import dotenv from 'dotenv'
dotenv.config()

import passport from 'passport'
// import { Strategy as GithubStrategy } from 'passport-github2'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import config from '../config/config.js'


// TODO : Working on Passport

export const GoogleAuth = async (model) => {
    return passport.use(
        'google',
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${config.serverURL}/api/google/callback`,
                passReqToCallback: true,
            },
            async (req, _accessToken, _refreshToken, profile, done) => {
                return await
                    model.AttachGoogleId({
                        id: req.query?.state,
                        googleId: profile.id,
                    })
                        .then(res => done(null, profile))
                        .catch(err => {
                            console.log('GoogleAuth: ', err.message)
                            return done(err, undefined)
                        })
            }
        )
    )
}

export const Login_Auth = async (model, field1 = 'email', field2 = 'password') => {
    return passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: field1,
                passwordField: field2,
            },
            async (username, password, done) => {
                try {
                    const user = await model.findOne({ $or: [{ username }] })
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