import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from '../utils/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  publicId: string;
  secureUrl: string;
}

export const uploadToCloudinary = async (
  filePath: string,
  folder: string
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });

    logger.info(`File uploaded to Cloudinary: ${result.public_id}`);

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    logger.error(`Cloudinary upload error: ${message}`);
    throw new Error(`File upload failed: ${message}`);
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    logger.error(`Cloudinary delete error: ${message}`);
    throw new Error(`File deletion failed: ${message}`);
  }
};

export { cloudinary };
