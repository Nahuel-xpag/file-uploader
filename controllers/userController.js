const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const multer = require('multer');

//const upload = multer({dest: './files'})
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                })

                if(!user){
                    console.log("user not found");
                    return done(null, false, {message: "user not found"});
                }
                const  match = password = user.password;
                if (!match){
                    console.log("wrrong pw");
                    return done(null, false, {message: "incorrect password"});
                }
                return done(null, user);
            } catch(err) {
                console.log("error", err)
                return done(err)
            }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        }).finally(async () => await prisma.$disconnect());
        done(null, user)
    } catch(err){
        done(err);
    } 
});

exports.getIndex = (req,res) => {
    res.render("index", {user: req.user});
}
exports.createUserPost = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;
        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: password
            }
            }).catch(e => console.error(e))
        .finally(async() => await prisma.$disconnect());
        res.render("index");
    } catch(err){
        return next(err);
    }
}

exports.auth = () => passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
})
