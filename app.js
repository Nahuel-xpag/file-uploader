const express = require('express');
const passport = require('passport');
const path = require('node:path');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const { getIndex, createUserPost, auth, userFilePost } = require('./controllers/userController');
const userFileRouter = require('./routes/userFileRouter');
const { nextTick } = require('node:process');

const app = express()

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//prisma session store implementation to persist session id in database
app.use(expressSession({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: 'somesecret',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
        new PrismaClient(),
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
})
);
app.use(passport.session());
app.use(express.urlencoded({extended: false}));
app.get("/", getIndex);
app.post("/sign-up", createUserPost);
app.post("/log-in", auth());
app.get("/log-out", (req, res) => {
    req.logOut((err) => {
        if(err){
            console.error(err)
        }
        res.redirect("/")
    })
})
app.use("/user-file", userFileRouter)

app.listen(3000, () => console.log("Server listening on port three thousand"))