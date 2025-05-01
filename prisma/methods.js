const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('node:path');
exports.createUser = async (name, email, password) => {
    const createUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: password,
            folders: {
                create: [
                    {name: 'default'},
                ],
            },
        },
    }).then()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

    return createUser
}

exports.findUser = async (userId = null, files = true, userEmail = null) => {

    const where = userId
    ? { id: userId }   // If userId is provided, use it to filter
    : { email: userEmail }  // filter with email needed when logging in
    
    
    const user = await prisma.user.findUnique({
    where: where,
    include: {
        folders: files ? {
            include:{
                files: true,
                childFolders: true
            },
        } : false,
    },
    
}).catch(async (err) => {prisma.$disconnect(); console.log(err)})
.finally(async () => prisma.$disconnect());
return user
}

exports.createFolder = async (name, userId, parentFolder = null) => {
    const user = await prisma.user.findUnique({
        where:{
            id: userId,
        },
        include: {
            folders: {
                include: {
                    files: true,
                    childFolders: true
                },
            },
            
        },
    });

    const folder = await prisma.folder.create({
        data: {
            name: name,
            userId: userId,
            parentFolderId: parentFolder ?? user.folders[0].id
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
    return folder
}

exports.findFolder = async (folderId) => {
    const folder = await prisma.folder.findUnique({
        where:{
            id: folderId
        },
        include:{
            files: true,
            childFolders: true
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
    return folder
}
//check if folder contains files or folders before deleting
//check if folder is empty before deleting
exports.deleteFolder = async (folderId) => {
    const folder = await prisma.folder.delete({
        where:{
            id: folderId
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
    return folder
}
exports.deleteFolderWithFiles = async (folderId) => {
    
    const deleteFiles = prisma.file.deleteMany({
        where:{
            folderId: folderId
        }
    })

    const deleteFolder = prisma.folder.delete({
        where:{
            id: folderId
        }
    })

    const transaction = await prisma.$transaction([deleteFiles, deleteFolder])
    .catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
    return transaction
}

exports.findFile = async (fileId) => {
    const file = await prisma.file.findUnique({
        where:{
            id: fileId
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
    return file
}

//delete files from db
exports.deleteFile = async (fileId) => {
    await prisma.file.delete({
        where:{
            id: fileId
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
}

exports.createFile = async (name, type, folderId, userId, key) => {
    const userFolderPath = path.join(process.env.FILES_PATH, String(userId), String(folderId), String(userId) + '-' + String(Math.round(userId * 1E9) + name));
    console.log(userFolderPath);
    await prisma.file.create({
        data: {
            name: name,
            folderId: folderId,
            key: key,
            type: type,
            path: userFolderPath
        }
    })
}