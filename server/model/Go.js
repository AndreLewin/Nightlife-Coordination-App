const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    bar_id: { type: String, required: true }
  }
);

const Go = mongoose.model('Go', schema, 'gos');

module.exports = Go;