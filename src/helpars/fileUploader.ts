import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

// Configure DigitalOcean Spaces
const s3Client = new S3Client({
  region: "us-east-1", // Replace with your region if necessary
  endpoint: process.env.DO_SPACE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "",
  },
});

// Multer configuration using memoryStorage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload single image
const uploadSingle = upload.single("image");

// Upload multiple images
const uploadMultipleImage = upload.fields([
  {
    name: "images",
    maxCount: 15,
  },
]);

const updateProfile = upload.fields([
  { name: "profile", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// Upload multiple post files
const uploadPost = upload.fields([
  { name: "photos", maxCount: 500 },
  { name: "videos", maxCount: 100 },
]);

// Upload file to DigitalOcean Spaces directly from memory
const uploadToDigitalOcean = async (
  file: Express.Multer.File
) => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }

  try {
    const Key = `nathancloud/${Date.now()}_${uuidv4()}_${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.DO_SPACE_BUCKET || "",
      Key,
      Body: file.buffer, // Use buffer instead of file path
      ACL: "public-read" as ObjectCannedACL,
      ContentType: file.mimetype,
    };

    // Upload file to DigitalOcean Space
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Format the URL to include "https://"
    const fileURL = `${process.env.DO_SPACE_ENDPOINT}/${process.env.DO_SPACE_BUCKET}/${Key}`;
    return {
      Location: fileURL,
      Bucket: process.env.DO_SPACE_BUCKET || "",
      Key,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const fileUploader = {
  upload,
  uploadSingle,
  uploadMultipleImage,
  updateProfile,
  uploadPost,
  uploadToDigitalOcean,
};
