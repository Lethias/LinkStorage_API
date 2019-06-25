const mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    link: { type: String, required: true, match: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/ },
    linkdescription: { type: String, required: true, max: 100},
    tags: [],
    createdAt: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

module.exports = mongoose.model('Link', linkSchema);