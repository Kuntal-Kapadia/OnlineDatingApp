const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/user')
const keys = require('../config/keys');

passport.serializeUser((user,done)=>{
    done(null, user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    });
});

passport.use(new GoogleStrategy({
    clientID:keys.GoogleClientID,
    clientSecret: keys.GoogleClientSecret,
    callbackURL:'http://localhost:3000/auth/google/callback'
}, (accessToken,refreshToken,profile,done) =>{
    console.log(profile);
    User.findOne({google:profile.id}, (err,user)=>{
        if(err){
            return done(err);
        }
        if(user){
            return done(null,user);
        }
        else{
            const newUser= {
                google:profile.id,
                fullname:profile.displayName,
                firstname:profile.name.givenName,
                lastname:profile.name.familyName,
                email:profile.emails[0].value,
                image:profile.photos[0].value
            }
            new User(newUser).save((err,user)=>{
                if(err){
                    return done(err);
                }
                if (user){
                    return done(null,user);
                }
            })
        }
    });
}));

