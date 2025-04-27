const path = require("node:path");
const fs = require("fs");
const { findFolder, createFolder, deleteFolder, deleteFolderWithFiles, findUser } = require("../prisma/methods");


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

        /*
        come back to this to reroute root folder to index page
        */

        // Render the folder view with the folder's files and child folders
        res.render('folder', { user: req.user, folders: folder.childFolders, files: folder.files, folder: folder});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.createFolderPost = async (req, res) => {
    //i had an epiphany :o there is no need to nest folders in a local file system
    //the folder structure is already nested in the database
    //so we can just create a folder in the database and then create a folder in the local file system
    //and then we can just use the folderId to get the folder from the database
    //logic for a nested folder

    //logic for a folder inside the root folder
    try {
        if(req.params.folderId){
            const newFolder = await createFolder(req.body.folderName, req.user.id, parseInt(req.params.folderId, 10));
            const dest = path.join(process.env.FILES_PATH, String(req.user.id), String(newFolder.id));
            fs.mkdirSync(path.join(dest), {recursive: true});
        }else{
            const user = await findUser(req.user.id);
            const rootFolder = user.folders[0];
            const newFolder = await createFolder(req.body.folderName, req.user.id, rootFolder.id);
            const dest = path.join(process.env.FILES_PATH, String(req.user.id), String(newFolder.id));
            fs.mkdirSync(path.join(dest), {recursive: true});
        }
      } catch(err) {
          console.error(err)
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
}

exports.deleteFolderWithFilesPost = async (req, res) => {
    const { folderId } = req.params;
    try {
        // Check if the folder exists
        const folder = await findFolder(parseInt(folderId, 10));
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        // Delete the folder and its files
        await deleteFolderWithFiles(parseInt(folderId, 10));
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

