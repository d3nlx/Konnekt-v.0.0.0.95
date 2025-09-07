import 'dotenv/config';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const isProd = process.env.NODE_ENV === 'production';

  console.log("MONGO_URI:", process.env.MONGO_URI);
  console.log("SESSION_SECRET:", process.env.SESSION_SECRET);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 * 24 * 30
  }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd
  }
});

export default sessionMiddleware;