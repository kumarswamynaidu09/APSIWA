import React, { useEffect } from 'react';
import { GalleryItem } from '../types';

interface GalleryLightboxProps {
  item: GalleryItem | null;
  allItems: GalleryItem[];
  onClose: () => void;
  onSelect: (item: GalleryItem) => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  item,
  allItems,
  onClose,
  onSelect
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, allItems]);

  if (!item) return null;

  const currentIndex = allItems.findIndex((x) => x.id === item.id);
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allItems.length) % allItems.length;
    onSelect(allItems[prevIndex]);
  };
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allItems.length;
    onSelect(allItems[nextIndex]);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#ffffff] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#f7f9fc] border-b border-[#e0e3e6]">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded bg-[#003477] text-white text-[11px] font-bold uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-[12px] text-[#434752] font-semibold">
              Record {currentIndex + 1} of {allItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eceef1] hover:bg-[#e0e3e6] flex items-center justify-center text-[#191c1e] transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Large Media Stage */}
        <div className="relative bg-[#11161d] flex items-center justify-center max-h-[60vh] overflow-hidden group">
          <img
            alt={item.title}
            src={item.src}
            className="max-h-[60vh] w-auto max-w-full object-contain"
          />

          {/* Navigation Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Previous Record (Left Arrow)"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Next Record (Right Arrow)"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        </div>

        {/* Caption & Metadata Details */}
        <div className="p-5 sm:p-6 bg-[#ffffff] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#434752]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-[#003477]">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                {item.date}
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#006e2e]">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {item.location}
              </span>
            </div>
            <span className="text-[11px] text-[#434752] uppercase tracking-wider font-semibold">
              APSIWA Institutional Archives
            </span>
          </div>

          <h3 className="text-[18px] font-bold text-[#191c1e] leading-snug">
            {item.title}
          </h3>

          <p className="text-[14px] text-[#434752] leading-relaxed">
            {item.desc}
          </p>
        </div>
      </div>
    </div>
  );
};
