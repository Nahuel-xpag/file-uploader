const { Router } = require('express');
const multer = require('multer');
const userFileRouter = Router();
const path = require('node:path')
const fs = require('fs');

//add a function to store files on its folder for the corresponding user OR DIE TRYING
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = path.join("/home/nahuelxpg/projects/repos/file-uploader/userFiles", String(req.user.id));
      fs.mkdirSync(dest, {recursive: true});
      cb(null, dest)
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  uniquePrefix + file.fieldname + '-' + file.originalname.slice(file.originalname.length - 5))
    }
  })
  
const upload = multer({ storage: storage });

userFileRouter.post("/", upload.single('fotis'), function (req, res, next) {
    console.log("done", req.file);
    res.redirect("/");
})
userFileRouter.post("/new-folder", (req, res) => {
  try {
      const dest = path.join("/home/nahuelxpg/projects/repos/file-uploader/userFiles", String(req.user.id));
      fs.mkdirSync(path.join(dest, req.body.folderName), {recursive: true});
  } catch(err) {
      console.error(err)
  }
   res.redirect("/")
})
module.exports = userFileRouter