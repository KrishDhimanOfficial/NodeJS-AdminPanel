import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import expressLayouts from 'express-ejs-layouts'
import passport from 'passport'
import session from 'express-session'
import config from './config/config.js'
import MongoStore from 'connect-mongo'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import router from './routes/server.routes.js'
import siteRoutes from './routes/site.routes.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(helmet(
  {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }
))
app.use(mongoSanitize())
app.use(cors(
  {
    origin: [config.serverURL],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression(
  {
    level: 4, // compression level
    threshold: 0, // Compress all
    memLevel: 9, // memory usuage
    filter: (req, res) => compression.filter(req, res)
  }
))
app.use(config.node_env === 'development' ? logger('dev') : logger('combined'))
app.use(session(
  {
    secret: config.securityKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 4 * 60 * 60 * 1000,
      secure: config.node_env === 'production',
      httpOnly: true,      // can't be accessed via JS
      sameSite: 'strict', // prevent CSRF
    },
    store: MongoStore.create({
      mongoUrl: config.mongodb_URL,
      ttl: 4 * 60 * 60, // 4 hours Auto Remove from DB Sessions
      autoRemove: 'native',
      crypto: { secret: config.mogo_store_secret_key }
    })
  }
))
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

app.use(rateLimit(
  {
    windowMs: 15 * 1000, // 15 seconds
    max: 20, // max requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      return res.status(429).sendFile(path.join(__dirname, 'views', 'rate-limit.html'))
    },
  }
))

app.use('/admin', router)
app.use('/', siteRoutes)

app.use((err, req, res, next) => {
  return res.status(err.status || 500).render('error', {
    message: err.message,
    error: config.node_env === 'development' ? err : {},
  })
})

export default app