const mongoose = require('mongoose')

const sigInSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
})
const signInModel = mongoose.model('user', sigInSchema);
module.exports = signInModel 