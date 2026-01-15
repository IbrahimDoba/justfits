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

const referenceImages = [
  {
    id: "dark-female",
    label: "Dark Female",
    path: "/images/dark female.jpg",
    preview: "/images/dark female.jpg",
  },
  {
    id: "dark-male",
    label: "Dark Male",
    path: "/images/dark male.jpg",
    preview: "/images/dark male.jpg",
  },
  {
    id: "white-female",
    label: "White Female",
    path: "/images/white female.jpg",
    preview: "/images/white female.jpg",
  },
  {
    id: "white-male",
    label: "White Male",
    path: "/images/white male.jpg",
    preview: "/images/white male.jpg",
  },
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
  const [selectedReferenceImage, setSelectedReferenceImage] =
    useState("dark-female");
  const [selectedBackground, setSelectedBackground] = useState("studio-white");
  const [selectedEngine, setSelectedEngine] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4.1");
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
          referenceImagePath:
            referenceImages.find((r) => r.id === selectedReferenceImage)
              ?.path || "/images/dark female.jpg",
          productName,
          view:
            viewOptions.find((v) => v.id === selectedView)?.label ||
            "Front View",
          background:
            backgrounds.find((b) => b.id === selectedBackground)?.label ||
            "Studio White",
          additionalDetails: additionalPrompt,
          engine: selectedEngine,
          model: selectedModel,
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
      alert(
        error instanceof Error ? error.message : "Failed to generate image"
      );
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
                <h2 className="text-xl font-display tracking-wide">
                  AI MODEL STUDIO
                </h2>
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
                      <ImageIcon
                        size={24}
                        className="mx-auto text-gray-400 mb-2"
                      />
                      <p className="text-sm text-gray-500">
                        Upload product images first to use as reference
                      </p>
                    </div>
                  )}
                </div>

                {/* Engine Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    Generation Engine
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedEngine("openai")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedEngine === "openai"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      AI Generation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEngine("gemini");
                        setSelectedModel("gemini-2.5-flash-image");
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedEngine === "gemini"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Gemini AI
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 px-1">
                    {selectedEngine === "openai"
                      ? "Uses GPT-Image for high-fidelity generative results (slower)."
                      : "Uses Gemini Nano Banana for fast, multimodal generation (instant)."}
                  </p>
                </div>

                {/* Model Selection */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500" />
                    Generation Quality
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedModel(
                          selectedEngine === "openai"
                            ? "gpt-4.1"
                            : "gemini-3-pro-image-preview"
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedModel === "gpt-4.1" ||
                        selectedModel === "gemini-3-pro-image-preview"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {selectedEngine === "openai"
                        ? "High Fidelity"
                        : "Pro Thinking"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedModel(
                          selectedEngine === "openai"
                            ? "gpt-4.1-mini"
                            : "gemini-2.5-flash-image"
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedModel === "gpt-4.1-mini" ||
                        selectedModel === "gemini-2.5-flash-image"
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {selectedEngine === "openai"
                        ? "Cost-Effective"
                        : "Flash Speed"}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 px-1">
                    {selectedEngine === "openai"
                      ? selectedModel === "gpt-4.1"
                        ? "Best quality, flagship model (~$0.07/img)."
                        : "Fast & 6x cheaper (~$0.01/img)."
                      : selectedModel === "gemini-3-pro-image-preview"
                      ? "Advanced reasoning for professional assets."
                      : "Optimized for high-volume, low-latency tasks."}
                  </p>
                </motion.div>

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
                        <span className="text-xs font-medium">
                          {view.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference Model Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Model Reference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {referenceImages.map((ref) => (
                      <button
                        key={ref.id}
                        type="button"
                        onClick={() => setSelectedReferenceImage(ref.id)}
                        className={`relative aspect-3/4 rounded-xl overflow-hidden border-2 transition-all group ${
                          selectedReferenceImage === ref.id
                            ? "border-black ring-2 ring-black/20 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <img
                          src={ref.preview}
                          alt={ref.label}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay with label */}
                        <div
                          className={`absolute inset-x-0 bottom-0 py-2 px-3 transition-all ${
                            selectedReferenceImage === ref.id
                              ? "bg-black/90"
                              : "bg-black/60 group-hover:bg-black/80"
                          }`}
                        >
                          <p className="text-xs font-medium text-white text-center">
                            {ref.label}
                          </p>
                        </div>
                        {/* Selected indicator */}
                        {selectedReferenceImage === ref.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select a reference model to showcase your product
                  </p>
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
                      <p className="mt-6 text-gray-900 font-semibold">
                        {generationStep}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        This usually takes 15-30 seconds
                      </p>
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
                        Select your options and click generate to create a
                        professional model shot of your product
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
                      disabled={
                        isGenerating || (!selectedSourceImage && !productName)
                      }
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
                  Powered by AI. Generated images may vary. Credits: 1 image per
                  generation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
