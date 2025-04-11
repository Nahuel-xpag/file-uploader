const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
            try {
                const {rows} = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                })
                const user = rows[0];

                if(!user){
                    return done(null, false, {message: "user not found"});
                }
                const  match = password = user.password;
                if (!match){
                    return done(null, false, {message: "incorrect password"});
                }
                return done(null, user);
            } catch(err) {
                return next(err)
            }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const {rows} = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
    } catch(err){
        done(err);
    }
});

exports.getIndex = (req,res) => {
    res.render("index");
}
exports.newUserPost = async (req, res) => {
    const {name, email, password} = req.body;
    await prisma.user.create({
        name: name,
        email: email,
        password: password
    })
}