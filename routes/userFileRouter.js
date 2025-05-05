const { Router } = require('express');
const multer = require('multer');
const userFileRouter = Router();
const path = require('node:path')
const fs = require('fs');
const { fileHandler, deleteFilePost, serveFilesGet, downloadFileGet} = require('../controllers/fileController');
const { findFolder } = require('../prisma/methods');

//add a function to store files on its folder for the corresponding user OR DIE TRYING
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      const {folderId} = req.params;
      const folder = await findFolder(parseInt(folderId, 10));
      if (!folder) {
        const dest = path.join(process.env.FILES_PATH, String(req.user.id));
        fs.mkdirSync(dest, {recursive: true});
        cb(null, dest)
      }else{
        const dest = path.join(process.env.FILES_PATH, String(req.user.id), String(folder.id));
        fs.mkdirSync(dest, {recursive: true});
        cb(null, dest)
      }
    },
    filename: function (req, file, cb) {
      const uniquePrefix = req.user.id + '-' + Math.round(req.user.id * 1E9)
      cb(null, uniquePrefix + file.originalname)
    }
  })
  
const upload = multer({ storage: storage });

//userFileRouter.post("/", upload .single('fotis'), fileHandler);
userFileRouter.post("/:folderId", upload.single('fotis'), fileHandler);
userFileRouter.post("/delete/:folderId/:fileId/:fileName", deleteFilePost);
userFileRouter.get("/serve/:fileId", serveFilesGet);
userFileRouter.get("/download/:fileId", downloadFileGet); 
module.exports = userFileRouter