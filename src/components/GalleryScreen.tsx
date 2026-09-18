import React, { useState, useMemo } from 'react';
import { GalleryItem } from '../types';

interface GalleryScreenProps {
  galleryItems: GalleryItem[];
  onOpenLightbox: (item: GalleryItem) => void;
}

type FilterCategory = 'all' | 'events' | 'meetings' | 'workshops' | 'conferences' | 'activities';

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  galleryItems,
  onOpenLightbox
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [showMediaKitModal, setShowMediaKitModal] = useState(false);

  const filters: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'events', label: 'Events' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'conferences', label: 'Conferences' },
    { id: 'activities', label: 'Activities' }
  ];

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return galleryItems;
    return galleryItems.filter((item) => item.categorySlug === activeFilter);
  }, [activeFilter, galleryItems]);

  return (
    <div className="w-full bg-[#f7f9fc] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-margin">
        {/* Gallery Header */}
        <div className="flex flex-col space-y-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#003477]"></span>
            <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
              APSIWA GALLERY • Institutional Archive
            </span>
          </div>
          <h1 className="font-display-lg text-[#003477] tracking-tight">
            Moments, Events &amp; Community
          </h1>
          <p className="font-body-lg text-[#434752] max-w-3xl leading-relaxed">
            Archiving our state conferences, technical workshops, site commissioning inspections, and
            delegate assemblies across Andhra Pradesh.
          </p>

          {/* Institutional Stats Bar */}
          <div className="grid grid-cols-3 gap-4 bg-[#ffffff] rounded-xl p-4 sm:p-5 border border-[#e0e3e6] shadow-xs max-w-xl mt-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#003477]">28+</span>
              <span className="text-[11px] text-[#434752] uppercase font-semibold tracking-wider">
                Conferences
              </span>
            </div>
            <div className="flex flex-col border-l border-[#e0e3e6] pl-4">
              <span className="text-2xl font-bold text-[#003477]">1,400+</span>
              <span className="text-[11px] text-[#434752] uppercase font-semibold tracking-wider">
                Delegates
              </span>
            </div>
            <div className="flex flex-col border-l border-[#e0e3e6] pl-4">
              <span className="text-2xl font-bold text-[#003477]">13+</span>
              <span className="text-[11px] text-[#434752] uppercase font-semibold tracking-wider">
                Districts Active
              </span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e0e3e6] pb-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#003477] text-white shadow-xs'
                    : 'bg-[#ffffff] text-[#434752] hover:bg-[#eceef1] border border-[#e0e3e6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-[12px] text-[#434752] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006e2e]"></span>
            <span>{filteredItems.length} Records Documented</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item)}
              className="group bg-[#ffffff] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer border border-[#e0e3e6]"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-[#eceef1]">
                <img
                  alt={item.title}
                  data-alt={item.dataAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.src}
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-[#ffffff]/90 backdrop-blur-sm text-[#003477] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {item.category}
                </span>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-[#003477]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/95 text-[#003477] text-[12px] font-bold shadow-md">
                    <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                    Inspect Record
                  </span>
                </div>
              </div>

              {/* Card Meta & Description */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#434752] mb-1.5">
                    <span className="font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#003477]">calendar_today</span>
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#006e2e]">location_on</span>
                      {item.location}
                    </span>
                  </div>
                  <h2 className="text-[14px] font-bold text-[#191c1e] group-hover:text-[#003477] transition-colors line-clamp-1">
                    {item.title}
                  </h2>
                  <p className="text-[12px] text-[#434752] mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#e0e3e6] flex items-center justify-between">
                  <span className="text-[11px] text-[#003477] font-bold flex items-center gap-1">
                    Archived Docket
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#434752] group-hover:text-[#003477] transition-colors">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Media Kit Banner */}
        <div className="mt-14 bg-[#ffffff] rounded-2xl p-6 sm:p-8 border border-[#e0e3e6] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#003477]/10 text-[#003477] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">folder_zip</span>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#191c1e]">APSIWA Media Archive &amp; Press Kit</h2>
              <p className="text-[13px] text-[#434752] mt-0.5 max-w-xl">
                Need high-resolution event photographs, official press statements, or policy whitepapers
                for journalism, research, or regulatory citations?
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMediaKitModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#003477] text-white text-[13px] font-semibold hover:bg-[#024aa3] transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download Media Kit</span>
          </button>
        </div>
      </div>

      {/* Media Kit Modal */}
      {showMediaKitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e0e3e6] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e3e6]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003477]">folder_zip</span>
                <h2 className="text-[16px] font-bold text-[#003477]">APSIWA Press &amp; Media Kit</h2>
              </div>
              <button
                onClick={() => setShowMediaKitModal(false)}
                className="p-1 text-[#434752] hover:text-[#191c1e] rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="py-4 space-y-3 text-[13px] text-[#434752]">
              <p>
                The official APSIWA Media Package contains verified public assets for state press releases,
                media publications, and industry journals:
              </p>
              <div className="bg-[#f2f4f7] rounded-xl p-3.5 space-y-2 border border-[#e0e3e6]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#191c1e]">• Official APSIWA Emblem &amp; Logo (PNG, Vector SVG)</span>
                  <span className="text-[11px] text-[#006e2e] font-bold">12 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#191c1e]">• 2025-2026 High-Res Conference Photography</span>
                  <span className="text-[11px] text-[#006e2e] font-bold">45 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#191c1e]">• AP Net-Metering &amp; Solar EPC Policy Whitepaper</span>
                  <span className="text-[11px] text-[#006e2e] font-bold">4.2 MB</span>
                </div>
              </div>
              <p className="text-[11px] text-[#434752]">
                * Usage of emblems and official media assets must comply with APSIWA Secretariat citation guidelines.
              </p>
            </div>
            <div className="pt-3 border-t border-[#e0e3e6] flex justify-end gap-3">
              <button
                onClick={() => setShowMediaKitModal(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#434752] hover:bg-[#eceef1] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('APSIWA media dossier link copied! Press kit download initiated.');
                  setShowMediaKitModal(false);
                }}
                className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#003477] text-white hover:bg-[#024aa3] shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                Download Assets Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
