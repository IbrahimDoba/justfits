"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Star, Crop } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  onSetPrimary?: (url: string) => void;
  disabled?: boolean;
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/jpeg", 0.92);
  });
}

interface PendingCrop {
  file: File;
  objectUrl: string;
}

function CropModal({
  pending,
  onConfirm,
  onSkip,
  onCancel,
  isLast,
}: {
  pending: PendingCrop;
  onConfirm: (croppedBlob: Blob) => void;
  onSkip: () => void;
  onCancel: () => void;
  isLast: boolean;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(pending.objectUrl, croppedAreaPixels);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-gray-700" />
            <h3 className="font-semibold text-gray-900">Crop Image</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative w-full" style={{ height: 360 }}>
          <Cropper
            image={pending.objectUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-black"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Skip crop
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {isLast ? "Apply & Upload" : "Apply & Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function uploadToCloudinary(file: File | Blob, fileName: string): Promise<string> {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = { timestamp, folder: "justfits/products" };

  const signatureRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  });

  if (!signatureRes.ok) throw new Error("Failed to get signature");

  const { signature } = await signatureRes.json();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) throw new Error("Cloudinary env vars missing");

  const formData = new FormData();
  formData.append("file", file instanceof Blob && !(file instanceof File)
    ? new File([file], fileName, { type: "image/jpeg" })
    : file
  );
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", "justfits/products");

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) throw new Error("Cloudinary upload failed");

  const data = await uploadRes.json();
  return data.secure_url;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  onSetPrimary,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropQueue, setCropQueue] = useState<PendingCrop[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const queue = acceptedFiles.map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
      }));
      setCropQueue(queue);
    },
    []
  );

  const handleCropConfirm = async (croppedBlob: Blob) => {
    const current = cropQueue[0];
    const remaining = cropQueue.slice(1);

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(croppedBlob, current.file.name);
      URL.revokeObjectURL(current.objectUrl);
      onChange([...value, url]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      setCropQueue(remaining);
    }
  };

  const handleSkip = async () => {
    const current = cropQueue[0];
    const remaining = cropQueue.slice(1);

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(current.file, current.file.name);
      URL.revokeObjectURL(current.objectUrl);
      onChange([...value, url]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      setCropQueue(remaining);
    }
  };

  const handleCancelAll = () => {
    cropQueue.forEach((p) => URL.revokeObjectURL(p.objectUrl));
    setCropQueue([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    disabled: disabled || isUploading || cropQueue.length > 0,
    multiple: true,
  });

  return (
    <>
      {cropQueue.length > 0 && (
        <CropModal
          pending={cropQueue[0]}
          onConfirm={handleCropConfirm}
          onSkip={handleSkip}
          onCancel={handleCancelAll}
          isLast={cropQueue.length === 1}
        />
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {value.map((url, index) => {
            const isPrimary = index === 0;
            return (
              <div
                key={url}
                className={`relative aspect-square rounded-xl bg-gray-100 overflow-hidden group border-2 transition-colors ${
                  isPrimary ? "border-amber-400" : "border-gray-200"
                }`}
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

                {isPrimary && (
                  <div className="z-10 absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-400 text-white text-xs font-medium rounded-md shadow-sm">
                      <Star size={10} fill="white" />
                      Main
                    </span>
                  </div>
                )}

                {!isPrimary && onSetPrimary && (
                  <div className="z-10 absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onSetPrimary(url)}
                      disabled={disabled}
                      className="inline-flex items-center gap-1 px-1.5 py-1 bg-white text-gray-700 text-xs font-medium rounded-md shadow-sm hover:bg-amber-400 hover:text-white transition-colors border border-gray-200"
                    >
                      <Star size={10} />
                      Set as main
                    </button>
                  </div>
                )}

                <img
                  src={url}
                  alt="Uploaded image"
                  className="object-cover w-full h-full"
                />
              </div>
            );
          })}
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
            ${disabled || cropQueue.length > 0 ? "opacity-50 cursor-not-allowed" : ""}
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
    </>
  );
}
