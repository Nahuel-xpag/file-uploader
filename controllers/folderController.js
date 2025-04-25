const { findFolder, createFolder, deleteFolder } = require("../prisma/methods");


exports.getUserFolder = async (req, res) => {
    const userFolder = await findFolder(req.params.folderId);
    console.log(userFolder.files);
    res.render("index", {user: req.user, files: userFolder.files, folders: userFolder.childFolders})
}

exports.getFolder = async (req, res) => {
    const { folderId } = req.params;
    try {
        const folder = await findFolder(parseInt(folderId, 10));
        // Check if the folder exists
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        res.render('folder', { user: req.user, folders: folder.childFolders, files: folder.files, folder: folder});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
}

exports.deleteFolderPost = async (req, res) => {
    const { folderId } = req.params;
    try {
        // Check if the folder exists
        const folder = await findFolder(parseInt(folderId, 10));
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        // Check if the folder is empty
        if (folder.files.length > 0 || folder.childFolders.length > 0) {
            return res.status(400).json({ error: 'Folder is not empty' });
        }
        await deleteFolder(parseInt(folderId, 10));
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
    //res.redirect("/");
    //res.status(200).json({ message: 'Folder deleted successfully' });
}

