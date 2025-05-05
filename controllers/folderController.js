const path = require("node:path");
const fs = require("fs");
const { findFolder, createFolder, deleteFolder, deleteFolderWithFiles, findUser } = require("../prisma/methods");


exports.getUserFolder = async (req, res) => {
    const userFolder = await findFolder(req.params.folderId);
    
    res.render("index", {user: req.user, files: userFolder.files, folders: userFolder.childFolders})
}

exports.getFolder = async (req, res) => {
    const { folderId } = req.params;
    try {
        const folder = await findFolder(parseInt(folderId, 10));
        const parentFolder = await findFolder(folder.parentFolderId);
        // Check if the folder exists
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        folder.files.forEach(file => {
            file.parsedDate = new Date(file.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        })
        res.render('folder', { user: req.user, folders: folder.childFolders, files: folder.files, folder: folder, parentFolder: parentFolder.name});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.createFolderPost = async (req, res) => {

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
    
       res.redirect(req.params.folderId ? "/folder/" + String(req.params.folderId) : "/");
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
    try {
        // Check if the folder exists
        const { folderId } = req.params;
        const folder = await findFolder(parseInt(folderId, 10));
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        // Delete the folder and its files
        await deleteFolderWithFiles(parseInt(folderId, 10));
        res.redirect("/");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

