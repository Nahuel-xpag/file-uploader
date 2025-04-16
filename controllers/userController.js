const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

const { PrismaClient } = require('@prisma/client');
const { findUser } = require('../prisma/methods');
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
                const  match = bcrypt.compare(password, user.password);
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
    console.log(id)
    try {
        const user = await findUser(id);
        done(null, user)
    } catch(err){
        done(err);
    } 
});

exports.getIndex = async (req,res) => {
    if(req.user){
        const userFiles = await findUser(req.user.id);
        res.render("index", {user: req.user, folders: userFiles.folders[0]});
    }else{
        res.render("index");
    }
    
}
exports.getUserFolder = async (req, res) => {
    const userFolders = await prisma.folder.findUnique({
        where: {
            id : req.params.folderId,
        },
        include: {
            files: true
        },
    })
    res.render("index", {user: req.user, folders: userFolders})
}
exports.createUserPost = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;
        const hashedPassword =  await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                folders: {
                    create: [
                        {name: name + 'default'},
                    ],
                },
            },
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
});

exports.fileHandler = async (req, res) => {
    const defaultFolderId = await prisma.user.findUnique({
        where: {
            id : req.user.id,
        },
        include: {
            folders: true
            
        },
    })
    
    await prisma.file.create({
        data: {
            name: req.file.originalname,
            folderId: req.params.folderId ?? defaultFolderId.folders[0].id
        }
    })
    console.log("done", req.file);
    res.redirect("/");
}
