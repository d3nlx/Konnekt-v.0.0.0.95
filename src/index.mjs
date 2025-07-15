import express from 'express';
import routes from './routes/index.mjs';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import "./strategies/local-strategy.mjs";

const app = express();

mongoose.connect("mongodb://localhost/konnekt_exp").then(() => console.log("Connected to Database")).catch((err) => console.log(`Error: ${err}`));

app.use(express.json());

app.use(session({
    secret: 'anson the dev',
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient()
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

const PORT = process.env.PORT ||3000;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`)
});