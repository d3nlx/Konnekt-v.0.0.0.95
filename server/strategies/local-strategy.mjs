import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../models/user.mjs";
import { comparePassword } from "../utils/helper.mjs";

passport.serializeUser((user, done) => {
  console.log(`Inside Serilize User`);
  console.log(user);
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  console.log(`Inside Deserilizer`);
  try {
    const findUser = await User.findById(id);
    if (!findUser) return done(null, false);
    done(null, findUser);
  } catch (err) {
    done(err, null);
  }
});


export default passport.use(
  new Strategy(
    {
      usernameField: "phonenumber",
      passwordField: "password",
    },
    async (phonenumber, password, done) => {
      try {
        const findUser = await User.findOne({ phonenumber });
        if (!findUser) {
          return done(null, false, { message: "User not found" });
        }

        const passwordMatches = comparePassword(password, findUser.password);
        if (!passwordMatches) {
          return done(null, false, { message: "Bad credentials" });
        }

        return done(null, findUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

