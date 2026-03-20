const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const hasCloudinaryConfig = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const storeFile = async (file, folder = 'general') => {
  if (!file) {
    return null;
  }

  if (hasCloudinaryConfig()) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `erp/${folder}`,
      resource_type: 'auto'
    });

    fs.unlinkSync(file.path);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      storageProvider: 'cloudinary',
      format: result.format,
      size: result.bytes
    };
  }

  const uploadDir = ensureUploadDir();
  const targetPath = path.join(uploadDir, file.filename);

  if (file.path !== targetPath) {
    fs.copyFileSync(file.path, targetPath);
    fs.unlinkSync(file.path);
  }

  return {
    url: `/uploads/${file.filename}`,
    publicId: file.filename,
    storageProvider: 'local',
    format: path.extname(file.originalname).replace('.', ''),
    size: file.size
  };
};

module.exports = {
  hasCloudinaryConfig,
  storeFile,
  ensureUploadDir
};

