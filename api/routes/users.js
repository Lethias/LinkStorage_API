const express = require("express");
const router = express.Router();

const UsersController = require('../controllers/users');
const auth = require('../helpers/auth');


router.post('/register', UsersController.registerUser);

router.post("/login", UsersController.loginUser);

router.get("/", auth, UsersController.getUser);

router.get("/categories", auth, UsersController.getCategories);

router.post("/categories", auth, UsersController.newCategory);

router.delete("/categories/:categoryId", auth, UsersController.deleteCategory);

router.post("/categories/:categoryId/links", auth, UsersController.newLink);

router.delete("/categories/:categoryId/links/:linkId", auth, UsersController.deleteLink);

router.patch("/categories/:categoryId/links/:linkId", auth, UsersController.editLink);






module.exports = router;