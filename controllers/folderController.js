const { findFolder } = require("../prisma/methods");

exports.getFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await findFolder(parseInt(folderId, 10));
        // Check if the folder exists
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        res.render('folder', { user: req.user, folder: folder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
