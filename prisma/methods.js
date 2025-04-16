const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.findUser = async(userId, files = true) => {
    const user = await prisma.user.findUnique({
    where: {
        id: userId
    },
    include: {
        folders: {
            include:{
                files: files
            },
        },
    },
}).catch(async (err) => {prisma.$disconnect(); console.log(err)})
.finally(async () => prisma.$disconnect());
return user
}