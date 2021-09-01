import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import UserModel from "../services/authors/schema.js"
import { JWTAuthenticate } from "./tools.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: "http://localhost:4000/authors/googleRedirect",
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      const user = await UserModel.findOne({ googleId: profile.id })

      if (user) {
        const tokens = await JWTAuthenticate(user)
        passportNext(null, { tokens })
      } else {
        const newUser = {
          name: profile.name.givenName,
          surname: profile.name.familyName,
          email: profile.emails[0].value,
          googleId: profile.id,
        }

        const createdUser = new UserModel(newUser)

        const savedUser = await createdUser.save()
        const tokens = await JWTAuthenticate(savedUser)
        passportNext(null, { user: savedUser, tokens })
      }
    } catch (error) {
      passportNext(error)
    }
  }
)

passport.serializeUser(function (user, passportNext) {
  passportNext(null, user)
})

export default googleStrategy
