const mongoose = require('mongoose');

const fileMetaSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  driveFileId: {
    type: String,
    required: true
  },
  driveFileLink: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subsection: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
fileMetaSchema.index({ section: 1, subsection: 1, month: 1, date: -1 });
fileMetaSchema.index({ month: 1, createdAt: -1 });
fileMetaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FileMeta', fileMetaSchema);
