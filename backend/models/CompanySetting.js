const mongoose = require('mongoose');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/roles');

const companySettingSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'ERP Workspace'
  },
  email: {
    type: String,
    default: 'hello@erp.local'
  },
  phone: {
    type: String,
    default: '+91 00000 00000'
  },
  website: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: 'Corporate HQ'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  taxId: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  permissions: {
    type: mongoose.Schema.Types.Mixed,
    default: DEFAULT_ROLE_PERMISSIONS
  },
  logo: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanySetting', companySettingSchema);

