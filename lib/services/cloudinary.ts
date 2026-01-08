import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  imageData: string | Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: object[];
  }
): Promise<UploadResult> {
  const uploadOptions = {
    folder: options?.folder || "justfits/products",
    public_id: options?.publicId,
    transformation: options?.transformation,
    resource_type: "image" as const,
  };

  const result = await cloudinary.uploader.upload(
    typeof imageData === "string"
      ? imageData
      : `data:image/png;base64,${imageData.toString("base64")}`,
    uploadOptions
  );

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || "fill",
    quality: options?.quality || "auto",
    format: options?.format || "auto",
    fetch_format: "auto",
    secure: true,
  });
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size = 150): string {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
  });
}

export default cloudinary;
