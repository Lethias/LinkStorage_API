const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require('../models/user');
const Category = require('../models/category');
const Link = require('../models/link');

module.exports = {
    registerUser: (req, res) => {
        User.find({email: req.body.email})
            .exec()
            .then(user => {
                if (user.length >= 1) {
                    return res.status(409).json({
                        message: "Mail already exists"
                    });
                } else {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            });
                        } else {
                            const user = new User({
                                _id: new mongoose.Types.ObjectId(),
                                email: req.body.email,
                                password: hash
                            });
                            user
                                .save()
                                .then(result => {
                                    console.log(result);
                                    res.status(201).json({
                                        message: "User has been created"
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        }
                    });
                }
            });
    },

    loginUser: (req, res) => {
        User.find({email: req.body.email})
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(401).json({
                        message: "Auth failed"
                    });
                }
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Auth failed"
                        });
                    }
                    if (result) {
                        const token = jwt.sign(
                            {
                                email: user[0].email,
                                userId: user[0]._id
                            },
                            process.env.JWT,
                            {
                                expiresIn: "1d"
                            }
                        );
                        return res.status(200).json({
                            message: "Auth successful",
                            token: token,
                            userId: user[0]._id
                        });
                    }
                    res.status(401).json({
                        message: "Auth failed"
                    });
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    },

    getUser: (req, res) => {
        const userId = req.userData.userId;
        User.findById(userId)
            .populate({path: 'categories', populate: {path: 'links'}})
            .exec()
            .then(docs => {
                console.log(docs);
                res.status(200).json(docs);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    },

    getCategories: (req, res) => {
        const userId = req.userData.userId;
        User.findById(userId)
            .populate({path: 'categories', populate: {path: 'links'}})
            .exec()
            .then(doc => {
                console.log("From database", doc);
                if (doc) {
                    res.status(200).json(doc.categories);
                } else {
                    res
                        .status(404)
                        .json({message: "No valid entry found for provided ID"});
                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({error: err});
            });
    },

    newCategory: (req, res) => {
        const userId = req.userData.userId;
        User.findById(userId)
            .exec()
            .then(user => {
                console.log(user);
                const category = new Category({
                    _id: mongoose.Types.ObjectId(),
                    user: user._id,
                    name: req.body.name,
                    description: req.body.description,
                });
                category.save(function (err) {
                    if (err) return res.status(404).json({
                        message: "Category validation failed"
                    });
                    else {
                        user.categories.push(category);
                        user.save();
                        res.status(201).json({
                            message: "Category has been stored",
                            category: category,
                        });
                    }
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    },

    deleteCategory: (req, res) => {
        const userId = req.userData.userId;
        const categoryId = req.params.categoryId;
        User.find({_id: userId, categories: categoryId})
            .then(usercheck => {
                if (usercheck.length < 1) {
                    return res.status(403).json({
                        message: "Access denied"
                    });
                } else {
                    User.findById(userId)
                        .then(user => {
                            Category.deleteOne({_id: categoryId})
                                .exec()
                                .then(result => {
                                    Link.deleteMany({category: categoryId});
                                    user.updateOne({$pull: {categories: categoryId}}, function (err) {
                                        console.log(err)
                                    });
                                    res.status(200).json(result);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            });

    },

    newLink: (req, res) => {
        const userId = req.userData.userId;
        const categoryId = req.params.categoryId;
        User.find({_id: userId, categories: categoryId})
            .then(usercheck => {
                if (usercheck.length < 1) {
                    return res.status(403).json({
                        message: "Access denied"
                    });
                } else {
                    Category.findById(categoryId)
                        .then(category => {
                            if (!category) {
                                return res.status(404).json({
                                    message: "Category not found"
                                });
                            }
                            const link = new Link({
                                _id: mongoose.Types.ObjectId(),
                                link: req.body.link,
                                linkdescription: req.body.linkdescription,
                                createdAt: req.body.createdAt,
                                tags: req.body.tags,
                                category: category._id
                            });
                            link.save(function (err) {
                                if (err) return res.status(404).json({
                                    message: "Link validation failed"
                                });
                                else {
                                    category.links.push(link);
                                    category.save();
                                    res.status(201).json({
                                        message: "Link stored",
                                        link: link,
                                    });
                                }
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            });
    },

    deleteLink: (req, res) => {
        const userId = req.userData.userId;
        const categoryId = req.params.categoryId;
        const linkId = req.params.linkId;
        User.find({_id: userId, categories: categoryId})
            .then(usercheck => {
                if (usercheck.length < 1) {
                    return res.status(403).json({
                        message: "Access denied"
                    });
                } else {
                    Category.findById(categoryId)
                        .then(category =>
                            Link.deleteOne({_id: linkId})
                                .exec()
                                .then(result => {
                                    category.updateOne({$pull: {links: linkId}}, function (err) {
                                        console.log(err)
                                    });
                                    res.status(200).json(result);
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                }))
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            });
    },

    editLink: (req, res) => {
        const userId = req.userData.userId;
        const categoryId = req.params.categoryId;
        const linkId = req.params.linkId;
        User.find({_id: userId, categories: categoryId})
            .then(usercheck => {
                if (usercheck.length < 1) {
                    return res.status(403).json({
                        message: "Access denied"
                    });
                } else {
                    Category.findById(categoryId)
                        .then(category => {
                            if (!category) {
                                return res.status(404).json({
                                    message: "Category not found"
                                });
                            }
                            Link.updateOne({_id: linkId}, {
                                link: req.body.link,
                                linkdescription: req.body.linkdescription,
                                tags: req.body.tags
                            })
                                .exec()
                                .then(result => {
                                    console.log(result);
                                    res.status(200).json({
                                        message: "Link updated"
                                    });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            });
    }
};