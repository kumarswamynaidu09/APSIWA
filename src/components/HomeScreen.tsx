import React from 'react';
import { NavTab, GalleryItem } from '../types';
import {
  Calendar,
  MapPin,
  Maximize2,
  Sun,
  Wind,
  BatteryCharging,
  FlaskConical,
  Car,
  Leaf,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Award,
  Users,
  BookOpen,
  Megaphone,
  Briefcase,
  ChevronRight,
  Sparkles,
  Layers,
  HeartHandshake,
  Landmark,
  Shield,
  GraduationCap,
  Images,
  ExternalLink,
  Check
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenLightbox: (item: GalleryItem) => void;
  galleryItems: GalleryItem[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenLightbox,
  galleryItems
}) => {
  // 6 preview items matching Image 6
  const previewItems = [
    {
      tag: 'State Conference',
      title: 'APSIWA Annual Leadership Convention',
      desc: 'Executive delegates reviewing policy resolutions and DISCOM coordination timelines at Vijayawada.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx4UyKdcEaZMKk0HO3CMv6JAQSk9YSrIsxhTp36fo-a4qRH7r28WRiR3IYTKfKtn5yxR7TjfH9d-EurY5SOlIouj6GyCbhwC3KGFtVDNItvAVxrCJy7vGKBiUNwkFmRqgXQrkcf_pmaSoctpcWTolucqkrOe_0DHFoD2PuHrGaWQUEmFSF2C7PzA0UUsmhqjdubznnQ1_ypkEblbEkNbrikbp1J1bykw0085s8Bv6XX4zjO-zBZ2M9Lw',
      galleryMatchIndex: 0
    },
    {
      tag: 'Site Inspection',
      title: 'On-Field Commercial Quality Auditing',
      desc: 'Technical field validation team assessing string inverter efficiency and DC grounding systems.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoQdfUzyfDoAg3eBpKxB13AN802rUDKb8yQR-wETcm_wHsIaOi9nVkBvP9ahW6iLXbU5m78EGnStNfPtMYsKq3aBg2OVcNRe50304-CvazpqJ4xYb_5ZC7ojlq1-ovajjYrKIM_5AnOcIruhPV4WLBEMlc1A07kH-l-0tZHlUAq0aTBLeNSI3FDng9O6tJv_kffZ4Qb94JqXRiP_yd5y_DF50WSslWuRxUQu5LDz_LLcmQT6S7T3W1mA',
      galleryMatchIndex: 1
    },
    {
      tag: 'Rooftop Installation',
      title: 'High-Capacity Commercial Commissioning',
      desc: 'Completed 850 kW rooftop solar deployment engineered by an accredited APSIWA integration firm.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGuV8SVQ04vtH-1i-S3x9K-GsePS9bGY1WlhdJMagJjKwLdolrJaD2TC_fIX3P4RScc_M0dY_L4wAO6OCWDRtuWUD3hqGlp_lhuMgIKBzWIDExkGmh6Ho9muxB5DI_p1w4TTXcu-YjVTcRXK-T4cXkHnNLBokptjfdRP4ZpGdvcW8DNsfjkerPK9_i8viZs8i7-EYD-M2FgKSVi0igPgg95y7xkNTYwTQTqw3P2i7UaUhBd_2gLvMmsw',
      galleryMatchIndex: 2
    },
    {
      tag: 'Technical Seminar',
      title: 'Net-Metering & Telemetry Workshop',
      desc: 'State-wide workshop covering APERC grid-tied bi-directional meter integration protocols.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx2ISA0IWuL6lHo1ONn1ZrsdEVRHQEDpMh1241_SYkph6apZ0AhrjD-NuMXKuKXa9RJhEEZR5agtApZBaKESYFsbCf2vX4CX-fCrU7p0gcWMV8Hl2guB0isrTuLKRs6X5Zgz4EI3_FAXkjMQaT0Cxq2JZmYritje421R3NWygnrloDNsPpCkRiZs01e9zhq9uW4a64aPJ_wrAHHHMeTDniAeSJDTLcfOWLyuxaaLmwWmLO7hR7i_nXuw',
      galleryMatchIndex: 4
    },
    {
      tag: 'General Body Meeting',
      title: 'District Committee Representative Forum',
      desc: 'Resolutions adopted regarding expedited central subsidy releases and unified vendor standards.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE486hLYOuROnwIS0xCZvdj8cPnOryRKq4GJzTE5hmomIQaYMArvEd5GqvOpXCl698RqP0iyCVr9UYYg3-LyQwlulvS6QzgUXDPAlD-_Ws827dk06KPXjrO7fTmyWHS3saEukakk2JQgDrnSjYZBv3hQsVcNWqr6OsoTAHtOTXSdUU7v35e-NADXgNfbQCJWtvN_IIwmgh834a1t2SB19vkQ4XGz_KoCXaslBnHW2n59qGWb6BE1rDTg',
      galleryMatchIndex: 5
    },
    {
      tag: 'Safety Drill',
      title: 'State Solar Technician Safety Program',
      desc: 'Practical certification on rooftop anchor points, harness standards, and anti-islanding verification.',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBWAb6TEgjipFldq7ydh1pJsZ7-FUS5aQ09UgAXFeSh6qbWuGjM2N7rkrMZ93TFZWkwbeUWdbJ8RA81cjjMOnbE58lWJacbykk__m-XvtmnYHo8ZwUzcinAD-I_icOec6TZmQpxE3I1OPUIUdKw7GgRiov_LRZ1q4olW4SQyEnIAcngeu5F5La6IngEUDizHEQs6om-Apt5hKBYm4Zd9P6I6r5OmThFIqwhrhHJXc8Ttn4q7pSMRRmdg',
      galleryMatchIndex: 6
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ANDHRA PRADESH ENERGY EXPO 2026 FEATURE BANNER (AT TOP) */}
      <section className="w-full py-8 sm:py-12 bg-gradient-to-b from-[#f0f9f4] via-[#ffffff] to-[#f2f4f7] border-b border-[#d2e6da]">
        <div className="max-w-7xl mx-auto px-margin">
          {/* Section Header Tag */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00873d] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#006e2e]"></span>
              </span>
              <span className="text-[12px] font-bold text-[#006e2e] uppercase tracking-widest">
                Official State Summit • 2nd Edition
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e3f4e9] text-[#006e2e] text-[12px] font-bold border border-[#b8e5c8]">
              <ShieldCheck size={16} className="text-[#006e2e]" />
              Co-Organised by APSIWA &amp; FirstVIEW Group
            </div>
          </div>

          {/* Main Expo Banner Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#003477] via-[#004e8c] to-[#016e3c] text-white shadow-2xl border border-[#028b49]/30">
            {/* Background Glow & Pattern Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8ef9a0]/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00a859]/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

            <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col gap-8">
              {/* Top Banner Row: Logos & Event Title */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  {/* Co-host tag */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/90">
                    <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-sm font-semibold uppercase tracking-wider text-[11px] border border-white/20">
                      Organised by <strong className="text-white">FirstVIEW Group</strong> &amp; <strong className="text-[#8ef9a0]">APSIWA</strong>
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-[#00a859]/30 backdrop-blur-sm text-[#8ef9a0] font-bold uppercase tracking-wider text-[11px] border border-[#8ef9a0]/30">
                      Innovate • Connect • Transform
                    </span>
                  </div>

                  {/* Headline */}
                  <div>
                    <span className="text-[13px] sm:text-[15px] font-bold tracking-widest text-[#8ef9a0] uppercase block">
                      South India's Leading Clean Energy Expo
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mt-1 leading-tight">
                      ANDHRA PRADESH <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ef9a0] via-[#c6ff00] to-[#ffffff]">
                        ENERGY EXPO 2026
                      </span>
                    </h2>
                    <p className="text-sm sm:text-base text-white/85 font-medium mt-2 max-w-xl leading-relaxed">
                      "A Sustainable Andhra Pradesh, A Brighter Tomorrow" — Connecting 10,000+ industry leaders, solar EPC contractors, policy makers, and clean tech innovators.
                    </p>
                  </div>

                  {/* Key Event Details Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                      <div className="w-10 h-10 rounded-xl bg-[#8ef9a0]/20 flex items-center justify-center text-[#8ef9a0] shrink-0">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-white/70 block tracking-wider">Event Dates</span>
                        <span className="text-[14px] font-bold text-white">25 – 26 September 2026</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                      <div className="w-10 h-10 rounded-xl bg-[#8ef9a0]/20 flex items-center justify-center text-[#8ef9a0] shrink-0">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-white/70 block tracking-wider">Host Venue</span>
                        <span className="text-[13px] font-bold text-white leading-tight block">Gadiraju Palace, Visakhapatnam</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: High-Res Visual Poster Display */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/20">
                    <div className="relative rounded-xl overflow-hidden group shadow-sm bg-gray-900">
                      <img
                        src="/ap-energy-expo-2026.jpg"
                        alt="Andhra Pradesh Energy Expo 2026 Official Flyer"
                        className="w-full h-auto max-h-[360px] object-cover object-top hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => window.open('/ap-energy-expo-2026.jpg', '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white/95 text-[#003477] text-xs font-bold px-3.5 py-2 rounded-lg shadow-md flex items-center gap-1.5">
                          <Maximize2 size={16} /> Click to View Full Size
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Strip: Focus Sectors */}
              <div className="border-t border-white/15 pt-6">
                <div className="text-center sm:text-left mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#8ef9a0]">
                    Key Energy Sectors &amp; Focus Domains
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center hover:bg-white/20 transition-colors">
                    <Sun size={26} className="text-[#8ef9a0] mb-1" />
                    <span className="text-[12px] font-bold text-white">Solar Energy</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center hover:bg-white/20 transition-colors">
                    <Wind size={26} className="text-[#8ef9a0] mb-1" />
                    <span className="text-[12px] font-bold text-white">Wind Energy</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center hover:bg-white/20 transition-colors">
                    <BatteryCharging size={26} className="text-[#8ef9a0] mb-1" />
                    <span className="text-[12px] font-bold text-white">Energy Storage</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center hover:bg-white/20 transition-colors">
                    <FlaskConical size={26} className="text-[#8ef9a0] mb-1" />
                    <span className="text-[12px] font-bold text-white">Green Hydrogen</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center hover:bg-white/20 transition-colors">
                    <Car size={26} className="text-[#8ef9a0] mb-1" />
                    <span className="text-[12px] font-bold text-white">E-Mobility</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center hover:bg-white/20 transition-colors">
                    <Leaf size={26} className="text-[#8ef9a0] mb-1" />
                    <span className="text-[12px] font-bold text-white">Net Zero Solutions</span>
                  </div>
                </div>
              </div>

              {/* Event Statistics Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-black/25 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10">
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-black text-[#8ef9a0] block">10,000+</span>
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Delegates &amp; Attendees</span>
                </div>
                <div className="text-center border-l border-white/15">
                  <span className="text-2xl sm:text-3xl font-black text-[#8ef9a0] block">250+</span>
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Exhibiting Brands</span>
                </div>
                <div className="text-center border-l border-white/15">
                  <span className="text-2xl sm:text-3xl font-black text-[#8ef9a0] block">50+</span>
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Keynote Speakers</span>
                </div>
                <div className="text-center border-l border-white/15 col-span-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#8ef9a0] block">B2B</span>
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Business Networking</span>
                </div>
                <div className="text-center border-l border-white/15 col-span-2 sm:col-span-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#8ef9a0] block">Live</span>
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Tech Showcase</span>
                </div>
              </div>

              {/* BOTTOM OF THE BANNER: REGISTER NOW FOR MEMBERSHIP */}
              <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 lg:-mx-12 lg:-mb-12 p-6 sm:p-8 rounded-b-3xl">
                <div className="flex flex-col text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8ef9a0] animate-ping"></span>
                    <span className="text-[13px] font-bold uppercase tracking-widest text-[#8ef9a0]">
                      APSIWA Membership &amp; Expo Access
                    </span>
                  </div>
                  <p className="text-sm text-white/90 font-medium mt-0.5">
                    Register today for APSIWA State Membership and unlock full association benefits and expo access.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onNavigate('membership');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#e31e24] to-[#c4161c] text-white text-[16px] font-black tracking-wide hover:from-[#c4161c] hover:to-[#a01217] transition-all shadow-xl hover:scale-[1.02] cursor-pointer"
                  >
                    <span>REGISTER NOW</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION (BELOW EVENT BANNER) */}
      <section className="relative w-full bg-[#f2f4f7] overflow-hidden py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-4 z-10">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffffff] shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006e2e] animate-pulse"></span>
                <span className="text-[11px] text-[#003477] uppercase font-bold tracking-wide">
                  APSIWA • State Welfare Association for Solar Integrators in Andhra Pradesh
                </span>
              </div>

              {/* Hero Headline */}
              <h1 className="font-display-lg text-[#003477] tracking-tight text-balance">
                Empowering Solar Integrators.{' '}
                <span className="text-[#191c1e]">Strengthening the Industry.</span>
              </h1>

              {/* Supporting Text */}
              <p className="font-body-lg text-[#434752] max-w-2xl leading-relaxed">
                Andhra Pradesh Solar Integrators Welfare Association works towards building a stronger,
                connected and sustainable solar integration community across Andhra Pradesh.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={() => {
                    onNavigate('membership');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#024aa3] text-[#ffffff] text-[14px] font-semibold hover:bg-[#003477] transition-all shadow-sm cursor-pointer gap-2"
                >
                  <span>Become a Member</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => {
                    onNavigate('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#ffffff] text-[#003477] text-[14px] font-semibold hover:bg-[#eceef1] transition-all shadow-xs cursor-pointer border border-[#e0e3e6]"
                >
                  Learn About APSIWA
                </button>
              </div>

              {/* Stat Counters Strip */}
              <div className="w-full pt-4 mt-2">
                <div className="grid grid-cols-3 gap-4 bg-[#ffffff] rounded-xl p-4 sm:p-5 shadow-xs border border-[#e0e3e6]">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold text-[#003477]">500+</span>
                    <span className="text-[11px] text-[#434752] uppercase font-semibold tracking-wider mt-0.5">
                      Registered Integrators
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-[#e0e3e6] pl-4">
                    <span className="text-2xl sm:text-3xl font-bold text-[#003477]">26</span>
                    <span className="text-[11px] text-[#434752] uppercase font-semibold tracking-wider mt-0.5">
                      Districts Covered
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-[#e0e3e6] pl-4">
                    <span className="text-2xl sm:text-3xl font-bold text-[#003477]">1.2 GW+</span>
                    <span className="text-[11px] text-[#434752] uppercase font-semibold tracking-wider mt-0.5">
                      Combined Capacity
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden bg-[#ffffff] shadow-md border border-[#e0e3e6]">
                <img
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                  data-alt="Vast high-capacity rooftop solar panel installation spanning across an industrial manufacturing facility in Andhra Pradesh under clear sunny skies, with photovoltaic arrays mounted on metal frames and inverter units visible in professional crisp daylight."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB8GTJ9JX6OaBAp_3Vhy19KQ74Cx4TgSvu4JCCAzC5VdITYrD-rYtH0F3-ZWkukrp76u9N7S4tekddf0LL04mh6Y3iFA_Dc8FH-FCd2xx1AK3_K-4jkqWVPIlYxAs_TzIJvdTQ9w0CexQzOAlwIZmzR-jzCG8aUwXnevI0u70OldBOsry5KRgjikV9pnNtYd2J2GvzM_-YIT3SKSH7KujhSKvG71jEtkS_f6WZimLERj-TE1gp1lHBkA"
                  alt="Andhra Pradesh Solar Grid Infrastructure"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#003477]/95 via-[#003477]/70 to-transparent p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#ffffff]">
                    <Sun size={20} className="text-[#8ef9a0]" />
                    <span className="text-[13px] font-semibold tracking-wide">
                      Andhra Pradesh Solar Grid Infrastructure
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ffffff]/20 backdrop-blur-sm text-white text-[11px] font-medium">
                    State EPC Network
                  </span>
                </div>
              </div>

              {/* Decorative Floating Accreditation Metric */}
              <div className="hidden sm:flex absolute -top-3 -right-3 bg-[#ffffff] rounded-xl p-3 shadow-md items-center gap-3 border border-[#e0e3e6]">
                <div className="w-10 h-10 rounded-lg bg-[#006e2e]/10 flex items-center justify-center text-[#006e2e]">
                  <Leaf size={22} />
                </div>
                <div>
                  <p className="text-[11px] text-[#434752] uppercase font-bold tracking-wider">AP Clean Energy</p>
                  <p className="text-[13px] text-[#191c1e] font-bold">100% Policy Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT PREVIEW SECTION */}
      <section className="w-full py-12 sm:py-16 bg-[#f7f9fc]">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Text and Pillars */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-6 bg-[#003477]"></span>
                <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
                  About APSIWA
                </span>
              </div>
              <h2 className="font-headline-lg text-[#003477] tracking-tight">
                Uniting Andhra Pradesh's Clean Energy Engineers &amp; EPC Pioneers
              </h2>
              <p className="font-body-md text-[#434752] leading-relaxed">
                Since its foundation, APSIWA has served as the premier platform safeguarding and empowering
                solar integrators, EPC contractors, rooftop installers, and solar equipment manufacturers
                across both coastal Andhra and Rayalaseema districts. We provide institutional
                representation, bridge statutory policy, and foster technical excellence throughout the
                state grid.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ffffff] border border-[#e0e3e6] shadow-xs">
                  <Landmark size={24} className="text-[#003477] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[14px] font-bold text-[#191c1e]">Regulatory Liaison</h3>
                    <p className="text-[13px] text-[#434752] mt-0.5">
                      Continuous dialogue with APERC, DISCOMs (APCPDCL, APEPDCL, APSPDCL), and NREDCAP for
                      streamlined approvals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ffffff] border border-[#e0e3e6] shadow-xs">
                  <ShieldCheck size={24} className="text-[#006e2e] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[14px] font-bold text-[#191c1e]">Standardised Technical Protocols</h3>
                    <p className="text-[13px] text-[#434752] mt-0.5">
                      Elevating installation safety, testing benchmarks, and MNRE-compliant equipment
                      procurement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#ffffff] border border-[#e0e3e6] shadow-xs">
                  <Shield size={24} className="text-[#803a00] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-[14px] font-bold text-[#191c1e]">Joint Welfare &amp; Safety Net</h3>
                    <p className="text-[13px] text-[#434752] mt-0.5">
                      Legal support panels, group insurance coverage, and business dispute arbitration for
                      member enterprises.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onNavigate('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#003477] text-[#ffffff] text-[13px] font-semibold hover:bg-[#024aa3] transition-all cursor-pointer shadow-xs"
                >
                  <span>Read Full Association Profile</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right: Field Inspection Photo */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-md bg-[#ffffff] border border-[#e0e3e6]">
                <img
                  alt="Professional Indian solar engineers and technicians in safety helmets inspecting solar modules on site"
                  className="w-full h-[400px] sm:h-[460px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoQdfUzyfDoAg3eBpKxB13AN802rUDKb8yQR-wETcm_wHsIaOi9nVkBvP9ahW6iLXbU5m78EGnStNfPtMYsKq3aBg2OVcNRe50304-CvazpqJ4xYb_5ZC7ojlq1-ovajjYrKIM_5AnOcIruhPV4WLBEMlc1A07kH-l-0tZHlUAq0aTBLeNSI3FDng9O6tJv_kffZ4Qb94JqXRiP_yd5y_DF50WSslWuRxUQu5LDz_LLcmQT6S7T3W1mA"
                />
                <div className="absolute bottom-0 inset-x-0 bg-[#ffffff]/95 backdrop-blur-md p-4 flex items-center justify-between border-t border-[#e0e3e6]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={22} className="text-[#006e2e]" />
                    <span className="text-[13px] font-bold text-[#191c1e]">
                      Field excellence &amp; standard testing protocols
                    </span>
                  </div>
                  <span className="text-[11px] text-[#434752] font-semibold uppercase">
                    Vijayawada Field Unit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO SECTION */}
      <section className="w-full py-12 sm:py-16 bg-[#f2f4f7]">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-2 mb-10">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 bg-[#006e2e]"></span>
              <span className="text-[11px] text-[#006e2e] uppercase font-bold tracking-widest">
                Key Operational Pillars
              </span>
              <span className="h-0.5 w-6 bg-[#006e2e]"></span>
            </div>
            <h2 className="font-headline-lg text-[#003477] tracking-tight">What We Do</h2>
            <p className="font-body-md text-[#434752]">
              Dedicated initiatives accelerating solar growth and safeguarding member interests across the
              energy lifecycle.
            </p>
          </div>

          {/* 6 Clean Feature Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Member Welfare */}
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow border border-[#e0e3e6] flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-[#003477]">
                <HeartHandshake size={26} />
              </div>
              <h3 className="font-headline-sm text-[#003477] font-bold">1. Member Welfare</h3>
              <p className="font-body-sm text-[#434752] leading-relaxed">
                Legal advisory aid, collective contractor risk insurance, dispute mitigation, and formal
                grievance redressal frameworks for certified installers.
              </p>
              <div className="pt-2 mt-auto">
                <span className="text-[12px] text-[#003477] font-bold inline-flex items-center gap-1">
                  Protected Welfare Ecosystem <Check size={14} />
                </span>
              </div>
            </div>

            {/* 2. Industry Representation */}
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow border border-[#e0e3e6] flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-[#003477]">
                <Landmark size={26} />
              </div>
              <h3 className="font-headline-sm text-[#003477] font-bold">2. Industry Representation</h3>
              <p className="font-body-sm text-[#434752] leading-relaxed">
                Constructive liaison with APERC, APCPDCL, APEPDCL, APSPDCL, and NREDCAP to resolve tariff,
                subsidy processing, and net-metering hurdles.
              </p>
              <div className="pt-2 mt-auto">
                <span className="text-[12px] text-[#003477] font-bold inline-flex items-center gap-1">
                  State Policy Dialogues <Check size={14} />
                </span>
              </div>
            </div>

            {/* 3. Networking & Collaboration */}
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow border border-[#e0e3e6] flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-[#003477]">
                <Layers size={26} />
              </div>
              <h3 className="font-headline-sm text-[#003477] font-bold">3. Networking &amp; Collaboration</h3>
              <p className="font-body-sm text-[#434752] leading-relaxed">
                Facilitating B2B consortiums, direct Tier-1 OEM solar hardware tie-ups, joint bidding
                agreements, and state contractor conventions.
              </p>
              <div className="pt-2 mt-auto">
                <span className="text-[12px] text-[#003477] font-bold inline-flex items-center gap-1">
                  B2B Partnerships <Check size={14} />
                </span>
              </div>
            </div>

            {/* 4. Knowledge Sharing */}
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow border border-[#e0e3e6] flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-[#003477]">
                <BookOpen size={26} />
              </div>
              <h3 className="font-headline-sm text-[#003477] font-bold">4. Knowledge Sharing</h3>
              <p className="font-body-sm text-[#434752] leading-relaxed">
                Continuous dissemination of net-metering circulars, battery storage advances, grid safety
                guidelines, and quarterly technical digests.
              </p>
              <div className="pt-2 mt-auto">
                <span className="text-[12px] text-[#003477] font-bold inline-flex items-center gap-1">
                  Quarterly Briefings <Check size={14} />
                </span>
              </div>
            </div>

            {/* 5. Solar Industry Awareness */}
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow border border-[#e0e3e6] flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-[#003477]">
                <Megaphone size={26} />
              </div>
              <h3 className="font-headline-sm text-[#003477] font-bold">5. Solar Industry Awareness</h3>
              <p className="font-body-sm text-[#434752] leading-relaxed">
                Consumer awareness programs for PM Surya Ghar, rooftop safety benchmarks, subsidy
                transparency, and regional clean energy expos.
              </p>
              <div className="pt-2 mt-auto">
                <span className="text-[12px] text-[#003477] font-bold inline-flex items-center gap-1">
                  Public Empowerment <Check size={14} />
                </span>
              </div>
            </div>

            {/* 6. Professional Development */}
            <div className="bg-[#ffffff] rounded-xl p-6 shadow-xs hover:shadow-md transition-shadow border border-[#e0e3e6] flex flex-col space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-[#003477]">
                <GraduationCap size={26} />
              </div>
              <h3 className="font-headline-sm text-[#003477] font-bold">6. Professional Development</h3>
              <p className="font-body-sm text-[#434752] leading-relaxed">
                Workforce skill certifications, high-voltage safety courses, quality commissioning drills, and
                technical technician upskilling clinics.
              </p>
              <div className="pt-2 mt-auto">
                <span className="text-[12px] text-[#003477] font-bold inline-flex items-center gap-1">
                  Skill Accreditation <Check size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP CTA BANNER */}
      <section className="w-full py-12 sm:py-16 bg-[#f7f9fc]">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="relative bg-[#003477] rounded-2xl overflow-hidden shadow-xl text-white p-6 sm:p-10">
            {/* Subtle Geometric Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col space-y-2 max-w-2xl text-center lg:text-left">
                <span className="inline-flex items-center self-center lg:self-start px-3 py-1 rounded-full bg-white/15 text-white text-[11px] uppercase font-bold tracking-wider">
                  Join 500+ Certified Solar Contractors
                </span>
                <h2 className="font-headline-lg font-bold text-white tracking-tight">
                  Be Part of the Solar Integration Community
                </h2>
                <p className="font-body-md text-white/90">
                  Join APSIWA and connect with professionals and businesses contributing to the growth of
                  the solar industry across Andhra Pradesh.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <button
                  onClick={() => {
                    onNavigate('membership');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#ffffff] text-[#003477] text-[14px] font-bold hover:bg-[#f2f4f7] transition-all shadow-md cursor-pointer gap-2"
                >
                  <span>Become a Member</span>
                  <Award size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW SECTION ("From Our Activities") */}
      <section className="w-full py-12 sm:py-16 bg-[#f2f4f7]">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-0.5 w-6 bg-[#003477]"></span>
                <span className="text-[11px] text-[#003477] uppercase font-bold tracking-widest">
                  Documented Progress
                </span>
              </div>
              <h2 className="font-headline-lg text-[#003477] tracking-tight mt-1">From Our Activities</h2>
              <p className="font-body-md text-[#434752] max-w-xl mt-0.5">
                Glimpses from technical summits, state conferences, and ground installations.
              </p>
            </div>
            <button
              onClick={() => {
                onNavigate('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#ffffff] text-[#003477] text-[13px] font-semibold hover:bg-[#eceef1] transition-all shadow-xs shrink-0 cursor-pointer border border-[#e0e3e6]"
            >
              <span>View Full Gallery</span>
              <ExternalLink size={16} />
            </button>
          </div>

          {/* 6-Item Thumbnail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const targetGalleryItem = galleryItems[item.galleryMatchIndex] || galleryItems[0];
                  onOpenLightbox(targetGalleryItem);
                }}
                className="group bg-[#ffffff] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col cursor-pointer border border-[#e0e3e6]"
              >
                <div className="relative h-52 overflow-hidden bg-[#eceef1]">
                  <img
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={item.img}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#ffffff]/90 backdrop-blur-sm text-[#003477] text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    {item.tag}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="inline-flex items-center gap-1 text-white text-[12px] bg-[#003477]/80 backdrop-blur-sm px-2.5 py-1 rounded">
                      <Maximize2 size={16} /> View Activity
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#191c1e] group-hover:text-[#003477] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#434752] mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Button */}
          <div className="text-center pt-10">
            <button
              onClick={() => {
                onNavigate('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#003477] text-[#ffffff] text-[14px] font-semibold hover:bg-[#024aa3] transition-all shadow-sm cursor-pointer"
            >
              <span>View All Gallery Activities</span>
              <Images size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
