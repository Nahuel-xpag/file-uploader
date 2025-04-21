const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const path = require('node:path');
const fs = require('fs')

const { findUser, findFolder, createUser, createFolder, createFile } = require('../prisma/methods');


passport.use(
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
            try {
                const user = await findUser(false, false, email)
                if(!user){
                    console.log("user not found");
                    return done(null, false, {message: "user not found"});
                }
                const  match = bcrypt.compare(password, user.password);
                if (!match){
                    console.log("wrong pw");
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


exports.auth = () => passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
});

exports.getIndex = async (req,res) => {
    if(req.user){
        const userFiles = await findUser(req.user.id);
        console.log(userFiles.folders[0]);
        res.render("index", {user: req.user, files: userFiles.folders[0].files, folders: userFiles.folders[0].childFolders});
    }else{
        res.render("index");
    }
    
}

exports.createUserPost = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;
        const hashedPassword =  await bcrypt.hash(password, 10);
        await createUser(name, email, hashedPassword);
        res.render("index");
    } catch(err){
        return next(err);
    }
}

exports.getUserFolder = async (req, res) => {
    const userFolders = await findFolder(req.params.folderId);
    res.render("index", {user: req.user, folders: userFolders})
}

exports.createFolderPost = async (req, res) => {
    try {
          await createFolder(req.body.folderName, req.user.id);
          const dest = path.join(process.env.FILES_PATH, String(req.user.id), req.params.folderId ?? '');
          fs.mkdirSync(path.join(dest, req.body.folderName), {recursive: true});
      } catch(err) {
          console.error(err)
      }
       res.redirect("/")
}

exports.fileHandler = async (req, res) => {
    const currentUser = await findUser(req.user.id);
    const defaultFolderId = currentUser.folders[0].id;
    await createFile(req.file.originalname, req.params.folderId ?? defaultFolderId);

    console.log("done", req.file);
    res.redirect("/");
}
