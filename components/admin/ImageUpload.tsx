"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true);

        // Upload each file
        const newUrls: string[] = [];

        for (const file of acceptedFiles) {
          // Get signature
          const timestamp = Math.round(new Date().getTime() / 1000);
          const paramsToSign = {
            timestamp,
            folder: "justfits/products",
          };

          const signatureRes = await fetch("/api/admin/upload/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paramsToSign }),
          });

          if (!signatureRes.ok) {
            throw new Error("Failed to get signature");
          }

          const { signature } = await signatureRes.json();
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

          if (!cloudName || !apiKey) {
            throw new Error("Cloudinary env vars missing on client");
          }

          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp.toString());
          formData.append("signature", signature);
          formData.append("folder", "justfits/products");

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!uploadRes.ok) {
            throw new Error("Cloudinary upload failed");
          }

          const data = await uploadRes.json();
          newUrls.push(data.secure_url);
        }

        // Update state with new URLs
        onChange([...value, ...newUrls]);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image. Check console.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    disabled: disabled || isUploading,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden group border border-gray-200"
          >
            <div className="z-10 absolute top-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(url)}
                disabled={disabled}
                className="p-1.5 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <img
              src={url}
              alt="Uploaded image"
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        {isUploading && (
          <div className="aspect-square rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-colors
          flex flex-col items-center justify-center gap-3 text-center cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="p-3 bg-gray-100 rounded-full">
          <Upload size={24} className="text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {isDragActive ? "Drop images here" : "Click to upload"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            or drag and drop images here
          </p>
        </div>
        <p className="text-xs text-gray-400">
          SVG, PNG, JPG or WEBP (max 10MB)
        </p>
      </div>
    </div>
  );
}
