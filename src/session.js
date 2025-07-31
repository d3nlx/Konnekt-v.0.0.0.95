import session from 'express-session';
import MongoStore from 'connect-mongo';

const sessionMiddleware = session({
  secret: 'keyboard cat', // замени на свой
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost/konnekt_exp',
    ttl: 60 * 60 * 24 * 30 // 30 дней
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30 дней
  }
});

export default sessionMiddleware;
