import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "profile_images",
    });
    return result.public_id
  } catch (error) {
    console.error("Cloudinary Upload Error", error);
    throw new Error("Failed to upload to Cloudinary");
  }
};
