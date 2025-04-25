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

/*exports.getUserFolder = async (req, res) => {
    const userFolder = await findFolder(req.params.folderId);
    console.log(userFolder.files);
    res.render("index", {user: req.user, files: userFolder.files, folders: userFolder.childFolders})
}

exports.createFolderPost = async (req, res) => {
    //logic for a nested folder
    if(req.params.folderId){
        const parentFolder = await findFolder(parseInt(req.params.folderId), 10);
        await createFolder(req.body.folderName, req.user.id, parseInt(req.params.folderId, 10));
        const dest = path.join(process.env.FILES_PATH, String(req.user.id), parentFolder.name);
        fs.mkdirSync(path.join(dest, req.body.folderName), {recursive: true});
    }else{
    //logic for a folder inside the root folder
    try {
          await createFolder(req.body.folderName, req.user.id);
          const dest = path.join(process.env.FILES_PATH, String(req.user.id), req.params.folderId ?? '');
          fs.mkdirSync(path.join(dest, req.body.folderName), {recursive: true});
      } catch(err) {
          console.error(err)
      }
    }
       res.redirect("/")
}*/

exports.fileHandler = async (req, res) => {
    const {folderId} = req.params;
    const currentUser = await findUser(req.user.id);
    const defaultFolderId = currentUser.folders[0].id;
    await createFile(req.file.originalname, parseInt(folderId, 10) ?? defaultFolderId);
    res.redirect("/folder/" + req.params.folderId ?? "/");
}
