import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/helper.mjs";

passport.serializeUser((user, done) => {
  console.log(`Inside Serilize User`);
  console.log(user);
  done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
  console.log(`Inside Deserilizer`);
  try {
    const findUser = await User.findById(id)
    if (!findUser) throw new Error("User Not Found");
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
      console.log(`Phonenumber: ${phonenumber}`);
      console.log(`Password: ${password}`);
      try {
        const findUser = await User.findOne({ phonenumber });
        if (!findUser) throw new Error("User not found");
        if (!comparePassword(password, findUser.password))
          throw new Error("Bad Credentials");
        done(null, findUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
