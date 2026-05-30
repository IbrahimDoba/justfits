"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import { getImageBlurDataURL } from "@/lib/utils/imageBlur";

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
}

export function ProductImageCarousel({
  images,
  productName,
}: ProductImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      }
    };

    if (window.innerWidth >= 1024) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [scrollPrev, scrollNext]);

  const hasImages = images.length > 0;

  return (
    <div className="relative group">
      {/* Carousel Container */}
      <div className="embla overflow-hidden rounded-3xl bg-white shadow-lg" ref={emblaRef}>
        <div className="embla__container">
          {hasImages ? (
            images.map((image, index) => (
              <div key={index} className="embla__slide flex items-center justify-center">
                <div className="relative w-full aspect-[3/4] lg:aspect-[4/5] max-h-[60vh] lg:max-h-none bg-gray-50">
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
                    style={{ objectPosition: 'center' }}
                    priority={index === 0}
                    loading={index === 0 ? undefined : "lazy"}
                    placeholder="blur"
                    blurDataURL={getImageBlurDataURL(image)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="embla__slide">
              <div className="relative aspect-[3/4] lg:aspect-[4/5] max-h-[60vh] lg:max-h-none">
                <ProductImagePlaceholder variant={1} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Arrow Buttons - Only show if there are multiple images */}
      {hasImages && images.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={scrollPrev}
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollNext}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dot Indicators - Only show if there are multiple images */}
      {hasImages && images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "bg-black w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
