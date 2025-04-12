const { Router } = require('express');
const multer = require('multer');
const userFileRouter = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "files")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
    }
  })
  
  const upload = multer({ storage: storage })

userFileRouter.post("/", upload.single('fotis'), function (req, res, next) {
    console.log('done', req.file);
    res.redirect("/");
})

module.exports = userFileRouter