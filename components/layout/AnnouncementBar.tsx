"use client";

import { Truck, Inbox } from "lucide-react";

export function AnnouncementBar() {
  const announcementText = "Free delivery above ₦60,000 within Abuja";

  return (
    <div className="bg-black text-white h-8 flex items-center overflow-hidden border-b border-white/10 fixed top-0 left-0 right-0 z-[60]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6">
            <Inbox size={14} className="text-white/80" />
            <span className="text-[9px] md:text-[10px] font-medium tracking-wider">
              {announcementText}
            </span>
            <span className="text-white/40 ml-4">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
