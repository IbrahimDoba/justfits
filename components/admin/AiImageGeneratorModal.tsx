"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wand2,
  Loader2,
  Sparkles,
  Check,
  Image as ImageIcon,
  ChevronRight,
  Zap,
  User,
  Camera,
  RefreshCw,
} from "lucide-react";

interface AiImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  existingImages: string[];
  onImageGenerated: (imageUrl: string) => void;
}

const viewOptions = [
  { id: "front", label: "Front View", icon: "👤" },
  { id: "side-left", label: "Left Profile", icon: "👈" },
  { id: "side-right", label: "Right Profile", icon: "👉" },
  { id: "three-quarter", label: "3/4 View", icon: "📐" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌆" },
  { id: "action", label: "Action Shot", icon: "🏃" },
];

const modelOptions = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

const skinTones = [
  { id: "light", label: "Light", color: "#FFE0BD" },
  { id: "medium", label: "Medium", color: "#C68642" },
  { id: "dark", label: "Dark", color: "#8D5524" },
];

const backgrounds = [
  { id: "studio-white", label: "Studio White" },
  { id: "studio-gray", label: "Studio Gray" },
  { id: "urban", label: "Urban Street" },
  { id: "minimal", label: "Minimal" },
];

export default function AiImageGeneratorModal({
  isOpen,
  onClose,
  productName,
  existingImages,
  onImageGenerated,
}: AiImageGeneratorModalProps) {
  // Source Image Selection
  const [selectedSourceImage, setSelectedSourceImage] = useState<string | null>(
    existingImages.length > 0 ? existingImages[0] : null
  );

  // Generation Options
  const [selectedView, setSelectedView] = useState("front");
  const [selectedModel, setSelectedModel] = useState("female");
  const [selectedSkinTone, setSelectedSkinTone] = useState("medium");
  const [selectedBackground, setSelectedBackground] = useState("studio-white");
  const [additionalPrompt, setAdditionalPrompt] = useState("");

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>("");

  const handleGenerate = async () => {
    if (!selectedSourceImage && !productName) {
      alert("Please upload a product image first or enter a product name");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationStep("Analyzing product...");

    try {
      const response = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImageUrl: selectedSourceImage,
          productName,
          view: viewOptions.find((v) => v.id === selectedView)?.label || "Front View",
          gender: selectedModel === "female" ? "Female" : "Male",
          skinColor: skinTones.find((s) => s.id === selectedSkinTone)?.label || "Medium",
          background: backgrounds.find((b) => b.id === selectedBackground)?.label || "Studio White",
          additionalDetails: additionalPrompt,
        }),
      });

      setGenerationStep("Generating image...");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.imageUrl);
      setGenerationStep("");
    } catch (error) {
      console.error("Generation error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate image");
      setGenerationStep("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      onClose();
      setGeneratedImage(null);
      setAdditionalPrompt("");
    }
  };

  const handleGenerateAnother = () => {
    setGeneratedImage(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-black text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-display tracking-wide">AI MODEL STUDIO</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Generate professional model shots from your product
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[500px]">
              {/* Left Panel - Controls */}
              <div className="lg:col-span-2 p-6 border-r border-gray-100 space-y-6 bg-gray-50">
                {/* Source Image Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera size={16} />
                    Source Product Image
                  </label>
                  {existingImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSourceImage(img)}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            selectedSourceImage === img
                              ? "border-black ring-2 ring-black/20"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
                      <ImageIcon size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Upload product images first to use as reference
                      </p>
                    </div>
                  )}
                </div>

                {/* View Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Camera View
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {viewOptions.map((view) => (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setSelectedView(view.id)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedView === view.id
                            ? "bg-black text-white"
                            : "bg-white border border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <span className="text-lg block mb-1">{view.icon}</span>
                        <span className="text-xs font-medium">{view.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {modelOptions.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model.id)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          selectedModel === model.id
                            ? "bg-black text-white"
                            : "bg-white border border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Tone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Skin Tone
                  </label>
                  <div className="flex gap-3">
                    {skinTones.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => setSelectedSkinTone(tone.id)}
                        className={`flex-1 p-3 rounded-xl transition-all flex flex-col items-center gap-2 ${
                          selectedSkinTone === tone.id
                            ? "bg-black text-white"
                            : "bg-white border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: tone.color }}
                        />
                        <span className="text-xs font-medium">{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Background
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {backgrounds.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setSelectedBackground(bg.id)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedBackground === bg.id
                            ? "bg-black text-white"
                            : "bg-white border border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="E.g., sitting pose, smiling, wearing sunglasses..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black text-gray-900 placeholder:text-gray-400 bg-white resize-none text-sm"
                  />
                </div>
              </div>

              {/* Right Panel - Preview */}
              <div className="lg:col-span-3 p-6 flex flex-col">
                <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden relative min-h-[400px]">
                  {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
                        <Zap className="absolute inset-0 m-auto w-8 h-8 text-black" />
                      </div>
                      <p className="mt-6 text-gray-900 font-semibold">{generationStep}</p>
                      <p className="text-sm text-gray-500 mt-1">This usually takes 15-30 seconds</p>
                    </div>
                  ) : generatedImage ? (
                    <img
                      src={generatedImage}
                      alt="Generated model shot"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                        <Wand2 size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to Generate
                      </h3>
                      <p className="text-gray-500 text-sm max-w-xs">
                        Select your options and click generate to create a professional model shot
                        of your product
                      </p>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className="mt-6">
                  {generatedImage ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleGenerateAnother}
                        className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={18} />
                        Generate Another
                      </button>
                      <button
                        type="button"
                        onClick={handleUseImage}
                        className="flex-1 py-4 px-6 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        Use This Image
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || (!selectedSourceImage && !productName)}
                      className="w-full py-4 px-6 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Generate Model Shot
                          <ChevronRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Info */}
                <p className="text-xs text-gray-400 text-center mt-4">
                  Powered by AI. Generated images may vary. Credits: 1 image per generation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
