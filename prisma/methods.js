const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    await prisma.folder.create({
        data: {
            name: name,
            userId: userId,
            parentFolderId: parentFolder ?? user.folders[0].id
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
}

exports.findFolder = async (folderId) => {
    const folder = await prisma.folder.findUnique({
        where:{
            id: folderId
        },
        include:{
            files: true
        },
    }).catch(async (err) => {prisma.$disconnect(); console.log(err)})
    .finally(async () => prisma.$disconnect());
    return folder
}

exports.createFile = async (name, folderId) => {
    await prisma.file.create({
        data: {
            name: name,
            folderId: folderId,
            path: 'example/path/eskere'
        }
    })
}