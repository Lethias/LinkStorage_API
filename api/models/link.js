const mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    link: { type: String, required: true },
    linkdescription: { type: String, required: true},
    tags: [],
    createdAt: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

module.exports = mongoose.model('Link', linkSchema);