import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import expressLayouts from 'express-ejs-layouts'
import passport from 'passport'
import session from 'express-session'
import config from './config/config.js'
import MongoStore from 'connect-mongo'
import router from './routes/server.routes.js'
import chalk from 'chalk'

const app = express()

app.use(helmet(
  {
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }
))
app.use(mongoSanitize())
app.use(xss())
app.use(cors(
  {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(config.node_env === 'development' ? logger('dev') : logger('combined'))
app.use(rateLimit(
  {
    windowMs: 15 * 1000, // 15 seconds
    max: 20, // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: 'Too many requests. Please slow down.',
    },
  }
))
// app.use(cookieParser(config.securityKey))
app.use(
  session({
    secret: config.securityKey,
    saveUninitialized: false,
    resave: false,
    proxy: true,
    store: MongoStore.create({ mongoUrl: config.mongodb_URL }),
    cookie: {
      maxAge: 3600000, // 1h
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    },
  })
)
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  return done(null, user)
})

passport.deserializeUser((user, done) => {
  return done(null, user)
})

// View Engine
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use('/views', express.static('views'))
app.use(expressLayouts)

// folder setup
app.use('/uploads', express.static('uploads'))
app.use('/assets', express.static('assets'))


app.use('/admin', router)

app.use((err, req, res, next) => {

  res.status(err.status || 500)
  return res.render('error', {
    message: err.message,
    error: config.node_env === 'development' ? err : {},
  })
})

export default app;