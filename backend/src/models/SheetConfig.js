const mongoose = require('mongoose');

const sheetConfigSchema = new mongoose.Schema({
  reportKey: {
    type: String,
    required: true,
    unique: true
  },
  reportName: {
    type: String,
    required: true
  },
  sheetId: {
    type: String,
    required: true
  },
  sheetUrl: {
    type: String
  },
  tabName: {
    type: String,
    required: true
  },
  range: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Create computed range field
sheetConfigSchema.virtual('fullRange').get(function() {
  return `${this.tabName}!${this.range}`;
});

sheetConfigSchema.set('toJSON', { virtuals: true });
sheetConfigSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SheetConfig', sheetConfigSchema);
