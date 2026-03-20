const asyncHandler = require('express-async-handler');
const CompanySetting = require('../models/CompanySetting');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/roles');
const { validatePayload } = require('../utils/validate');
const { settingsSchemas } = require('../validators/schemas');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await CompanySetting.findOne({});
  if (!settings) {
    settings = await CompanySetting.create({ permissions: DEFAULT_ROLE_PERMISSIONS });
  }

  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const payload = validatePayload(settingsSchemas.company, req.body);
  let settings = await CompanySetting.findOne({});

  if (!settings) {
    settings = await CompanySetting.create(payload);
  } else {
    Object.assign(settings, payload);
    await settings.save();
  }

  res.json(settings);
});

module.exports = {
  getSettings,
  updateSettings
};

