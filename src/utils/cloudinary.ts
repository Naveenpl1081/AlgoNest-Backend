import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadToCloudinary = async (
  localFilePath: string
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "profile_images",
    });
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Failed to delete local file:", err);
      else console.log("Local file deleted:", localFilePath);
    });
    return result.public_id;
  } catch (error) {
    console.error("Cloudinary Upload Error", error);
    throw new Error("Failed to upload to Cloudinary");
  }
};
