const { Router } = require("express");
const indexRouter =  Router();
const { getIndex } = require("../controllers/userController");


indexRouter.get("/", getIndex);

module.exports = indexRouter