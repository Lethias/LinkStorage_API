const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    links: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Link' }]
});

module.exports = mongoose.model('Category', categorySchema);