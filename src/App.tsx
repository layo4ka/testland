import React, { useEffect, useRef, useState } from "react";
import { 
  ArrowRight, 
  MapPin, 
  Compass, 
  Phone, 
  Activity, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  Menu, 
  X, 
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Award,
  Sliders,
  Upload,
  Link,
  RefreshCw,
  HelpCircle,
  Eye,
  Settings
} from "lucide-react";
import { saveVideoBlob, getVideoBlob, clearVideoBlob } from "./lib/videoDb";

// Register Window globals for GSAP & Lenis loaded via script CDNs inside index.html
const gsap = (window as any).gsap;
const ScrollTrigger = (window as any).ScrollTrigger;
const Lenis = (window as any).Lenis;

// Elite Residences Data
const RESIDENCES = [
  {
    id: "res-1",
    title: "Grand Avantgarde Penthouse",
    description: "Двухуровневый шедевр с панорамной террасой 360°, персональным бесшумным лифтом и настоящим дровяным камином для уютных вечеров.",
    area: "342 м²",
    rooms: "5 комнат",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    price: "от 450 млн ₽",
    specs: ["Терраса 360°", "Private SPA", "Каминный зал"]
  },
  {
    id: "res-2",
    title: "Patriarshie Premiere Residence",
    description: "Апартаменты с величественными панорамными окнами высотой 4.2 метра, премиальной отделкой белым мрамором и видом на исторический центр.",
    area: "185 м²",
    rooms: "3 комнаты",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    price: "от 220 млн ₽",
    specs: ["Высота потолков 4.2 м", "Умный дом Senses", "Кухня Bulthaup"]
  },
  {
    id: "res-3",
    title: "The Duplex Glasshouse",
    description: "Синергия света и стекла. Двухсветное пространство со встроенной зимней оранжереей под стеклянным куполом-атриумом.",
    area: "260 м²",
    rooms: "4 комнаты",
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=1200&auto=format&fit=crop",
    price: "от 310 млн ₽",
    specs: ["Стеклянный атриум", "Второй свет", "Полы из оникса"]
  }
];

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  lineId: string;
}

// Inline letter splitter helper to feed GSAP stagger safely
function SplitText({ text, className = "", charClassName = "", lineId }: SplitTextProps) {
  return (
    <span className={`inline-block ${className}`}>
      {text.split("").map((char, index) => (
        <span
          key={`${lineId}-${index}`}
          className={`char inline-block ${char === " " ? "w-[0.25em]" : ""} ${charClassName}`}
          style={{ transition: "none", transformOrigin: "bottom center" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab ] = useState("vibe");
  const [ambientSoundPlaying, setAmbientSoundPlaying] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({ name: "", phone: "", residenceType: "Grand Avantgarde Penthouse" });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  // Premium Video Autoplay with Hold Cadence
  const [videoSource, setVideoSource] = useState<string>("/building.mp4");
  const [isCustomVideo, setIsCustomVideo] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");

  const heroRef = useRef<HTMLElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const vibeSectionRef = useRef<HTMLElement>(null);
  const vibeImageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load custom video from IndexedDB on startup
  useEffect(() => {
    getVideoBlob()
      .then((blob) => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          setVideoSource(objectUrl);
          setIsCustomVideo(true);
          console.log("Loaded persistent custom video background from local IndexedDB storage!");
        }
      })
      .catch((err) => {
        console.error("IndexedDB startup load error:", err);
      });
  }, []);

  const handleUploadedFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setUploadStatus("Ошибка: Можно загружать только видеофайлы (.mp4, .mov, .webm и др.)");
      return;
    }
    setUploadStatus("Импортируем видео в локальную базу данных... Пожалуйста, подождите.");
    try {
      await saveVideoBlob(file);
      const url = URL.createObjectURL(file);
      setVideoSource(url);
      setIsCustomVideo(true);
      setUploadStatus("Видео успешно сохранено локально!");
      setTimeout(() => setUploadStatus(""), 3500);
    } catch (err: any) {
      console.error("Local save error:", err);
      setUploadStatus(`Ошибка локального сохранения: ${err.message || err}`);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    setVideoSource(customUrl);
    setIsCustomVideo(true);
    setUploadStatus("Адрес внешнего видео успешно применен!");
    setTimeout(() => setUploadStatus(""), 3500);
  };

  const handleResetVideo = async () => {
    try {
      await clearVideoBlob();
      setVideoSource("/building.mp4");
      setIsCustomVideo(false);
      setUploadStatus("Фоновое видео успешно сброшено по умолчанию!");
      setCustomUrl("");
      setTimeout(() => setUploadStatus(""), 3500);
    } catch (err: any) {
      console.error("Local reset error:", err);
      setUploadStatus(`Ошибка сброса: ${err.message || err}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Fallback high-end architecture construction stream unblocked globally, including Russia
  const fallbackVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-facade-42345-large.mp4";

  // Trigger fallback instantly if the client hasn't placed building.mp4 in the public folder yet
  const handleVideoError = () => {
    if (videoSource === "/building.mp4") {
      console.warn("Local building.mp4 not loaded or found, falling back to cinematic unblocked trailer.");
      setVideoSource(fallbackVideoUrl);
    }
  };

  // Luxury hold cadence: pause on final frame of completed building, hold for 5s, then restart
  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    video.pause();
    setTimeout(() => {
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }, 5000);
  };

  // Initialize once-off smooth scroll and scroll reveal animations
  useEffect(() => {
    // 1. Initialize Lenis Smooth Scroll
    let lenisInst: any;
    if (Lenis) {
      lenisInst = new Lenis({
        duration: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });

      const raf = (time: number) => {
        lenisInst.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // 2. Initialize GSAP & ScrollTrigger reveal staggers
    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Hero Text Entrance sequence
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".hero-bg-overlay", { opacity: 0.35, duration: 2.5 })
        .fromTo(".nav-header-el", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }, "-=1.5")
        .fromTo(".char", { 
          opacity: 0, 
          y: 60, 
          rotateX: -45, 
          scale: 0.85 
        }, { 
          opacity: 1, 
          y: 0, 
          rotateX: 0, 
          scale: 1, 
          duration: 1.5, 
          stagger: 0.02 
        }, "-=1.2")
        .fromTo(".hero-fade-in", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.2 }, "-=0.8");

      // 3D Parallax Scrolling for Hero Section
      if (heroRef.current && videoRef.current && heroTextRef.current) {
        gsap.to(videoRef.current, {
          yPercent: 12,
          scale: 1.05,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          }
        });

        gsap.to(heroTextRef.current, {
          yPercent: -15,
          opacity: 0,
          scale: 0.96,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom 20%",
            scrub: true,
          }
        });
      }

      // Parallax & Reveal for Vibe Section Image
      if (vibeSectionRef.current && vibeImageRef.current) {
        gsap.fromTo(vibeImageRef.current, 
          { scale: 1.15, filter: "brightness(0.4)" },
          {
            scale: 1,
            filter: "brightness(0.9)",
            scrollTrigger: {
              trigger: vibeSectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          }
        );
      }

      // Generic AOS-Style Fade Up Elements
      const faders = document.querySelectorAll(".gsap-fade-up");
      faders.forEach((el) => {
        gsap.fromTo(el, 
          { opacity: 0, y: 70 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      });

      // Special line reveals for section subheadings
      const lineReveals = document.querySelectorAll(".luxury-line-reveal");
      lineReveals.forEach((el) => {
        gsap.fromTo(el,
          { width: "0%" },
          {
            width: "100%",
            duration: 1.8,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
            }
          }
        );
      });
    }

    return () => {
      if (lenisInst) {
        lenisInst.destroy();
      }
    };
  }, []);

  // Handle immersive background sound loading
  const handleToggleSound = () => {
    if (!audioRef.current) {
      // Create high-end cinematic drone music loop
      // High-quality atmospheric ambient sound URL
      audioRef.current = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"); // safe placeholder luxury music track
      audioRef.current.volume = 0.15;
      audioRef.current.loop = true;
    }

    if (ambientSoundPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Sound autoplay browser block:", e));
    }
    setAmbientSoundPlaying(!ambientSoundPlaying);
  };

  // Scroll smoothly to target HTML element ID
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Form handle
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingFormData.name || !bookingFormData.phone) return;

    // Generate deluxe certificate code
    const randomTicket = "AP-" + Math.floor(100000 + Math.random() * 900000);
    setTicketNumber(randomTicket);
    setBookingSubmitted(true);

    // Save locally
    const savedTours = JSON.parse(localStorage.getItem("avantgarde_tours") || "[]");
    savedTours.push({
      ...bookingFormData,
      ticket: randomTicket,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("avantgarde_tours", JSON.stringify(savedTours));
  };

  return (
    <div className="relative min-h-screen font-serif bg-[#111] text-zinc-100 selection:bg-gold selection:text-dark-bg">
      {/* Immersive ambient sound controller (Bottom left) */}
      <button 
        onClick={handleToggleSound}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-black/80 px-4 py-2 text-xs font-sans tracking-widest text-gold backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-white"
        id="sound-toggle"
      >
        {ambientSoundPlaying ? (
          <>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
            </span>
            <Volume2 className="h-4 w-4 text-gold" />
            <span>МУЗЫКА СВЕТА: ON</span>
          </>
        ) : (
          <>
            <VolumeX className="h-4 w-4 text-gold/60" />
            <span>БЕЗЗВУЧНЫЙ РЕЖИМ</span>
          </>
        )}
      </button>

      {/* Immersive background customizer floating control (Bottom right) */}
      <div className="fixed bottom-6 right-6 z-41 flex flex-col items-end gap-3 font-sans">
        {settingsOpen && (
          <div 
            className="w-80 sm:w-96 bg-black/90 border border-gold/40 p-6 shadow-2xl backdrop-blur-xl rounded-sm text-zinc-100 flex flex-col gap-4 animate-fade-up duration-350 z-50"
            id="video-personalization-panel"
            style={{ boxShadow: "0 10px 50px rgba(0,0,0,0.95)" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-gold uppercase">НАСТРОЙКА ФОНА</span>
              </div>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="text-zinc-500 hover:text-gold transition-colors text-sm p-1"
                title="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[10px] leading-relaxed text-zinc-400 font-sans uppercase tracking-[0.05em]">
              Загрузите свое видео во внутреннюю память браузера (IndexedDB). Видео будет храниться локально, открываться моментально и останется активным при перезагрузках страницы.
            </p>

            {/* Drag and Drop Zone */}
            <div 
              onClick={() => document.getElementById("hidden-video-input")?.click()}
              className="border border-dashed border-zinc-700 hover:border-gold/50 bg-black/40 p-6 rounded-sm text-center cursor-pointer transition-all duration-300 flex flex-col items-center gap-2.5 group"
            >
              <Upload className="h-6 w-6 text-zinc-500 group-hover:text-gold transition-colors animate-pulse" />
              <div className="text-[10px] font-bold tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                ПЕРЕТАЩИТЕ .MP4 СЮДА ИЛИ КЛИКНИТЕ
              </div>
              <div className="text-[8px] tracking-widest text-zinc-500 uppercase">
                Рекомендуется размер файла до 30-40 MB
              </div>
              <input 
                type="file"
                id="hidden-video-input"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadedFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Direct URL Input */}
            <form onSubmit={handleUrlSubmit} className="space-y-2 pt-2 border-t border-white/5">
              <label htmlFor="custom-url-field" className="block text-[8px] tracking-widest text-zinc-500 uppercase font-bold">
                Или введите прямую ссылку на видео (.mp4)
              </label>
              <div className="flex gap-2">
                <input 
                  id="custom-url-field"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-gold placeholder:text-zinc-700"
                />
                <button 
                  type="submit"
                  className="bg-gold hover:bg-gold/80 text-black px-4 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors rounded-xs cursor-pointer flex items-center justify-center"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* Status indicator */}
            {uploadStatus && (
              <div className="text-[9px] text-center font-sans py-1.5 px-3 bg-gold/10 border border-gold/20 text-gold font-medium animate-pulse uppercase tracking-wider rounded-xs mt-1">
                {uploadStatus}
              </div>
            )}

            {/* Actions: Clear custom video, restore defaults */}
            {isCustomVideo && (
              <button 
                onClick={handleResetVideo}
                className="w-full mt-2 flex items-center justify-center gap-2 border border-gold/30 hover:border-gold py-2.5 text-[9px] tracking-widest text-gold hover:text-white uppercase transition-all duration-300 bg-black/60 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Сбросить видео по умолчанию</span>
              </button>
            )}
          </div>
        )}

        <button 
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center justify-center gap-2.5 rounded-full border border-gold/30 bg-black/80 px-4.5 py-3 text-xs font-sans tracking-[0.2em] text-gold uppercase backdrop-blur-md transition-all duration-300 hover:border-gold hover:text-white hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] focus:outline-none cursor-pointer"
          id="settings-trigger-btn"
          title="Настроить тестовые видео фона"
        >
          <Settings className={`h-4.5 w-4.5 text-gold ${settingsOpen ? 'rotate-90' : ''} transition-transform duration-500`} />
          <span className="font-bold">ТЕСТОВЫЙ ПЛЕЕР ФОНА</span>
        </button>
      </div>

      {/* FIXED BOUTIQUE HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 transition-all duration-500 border-b border-white/5 bg-black/60 backdrop-blur-md" id="main-header">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5 md:px-8">
          
          {/* Logo element */}
          <div className="nav-header-el flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <div className="relative flex items-center justify-center border border-gold/40 h-10 w-10 rotate-45 transform transition-transform duration-700 hover:rotate-180">
              <span className="absolute -rotate-45 font-sans font-bold text-sm tracking-tighter text-gold">A</span>
            </div>
            <div className="flex flex-col ml-1">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-sans font-extrabold text-base tracking-[0.2em] text-white leading-none">AVANTGARDE</span>
                <span className="bg-gold/15 border border-gold/30 text-gold text-[7px] tracking-[0.2em] px-1 py-0.5 rounded-xs font-bold font-sans self-center">ТЕСТ</span>
              </div>
              <span className="font-sans text-[8px] tracking-[0.45em] text-gold uppercase -mt-0.5">PREMIER // ТЕСТОВЫЙ ШАБЛОН</span>
            </div>
          </div>

          {/* Nav list - Desktop */}
          <nav className="hidden md:flex items-center gap-12 text-xs font-sans tracking-[0.25em] text-zinc-300">
            <button 
              onClick={() => scrollToSection("vibe")} 
              className="nav-header-el relative py-1 uppercase hover:text-gold transition-colors duration-300 group"
            >
              Философия
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
            </button>
            <button 
              onClick={() => scrollToSection("residences")} 
              className="nav-header-el relative py-1 uppercase hover:text-gold transition-colors duration-300 group"
            >
              Резиденции
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
            </button>
            <button 
              onClick={() => scrollToSection("contacts")} 
              className="nav-header-el relative py-1 uppercase hover:text-gold transition-colors duration-300 group"
            >
              Контакты
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          {/* Quick Contacts & Action */}
          <div className="hidden lg:flex items-center gap-6 nav-header-el font-sans">
            <a href="tel:+74959990000" className="flex items-center gap-2 text-xs tracking-[0.1em] text-zinc-300 hover:text-gold transition-colors">
              <Phone className="h-3 w-3 text-gold" />
              <span>+7 (495) 999-00-00</span>
            </a>
            <button 
              onClick={() => scrollToSection("contacts")} 
              className="border border-gold/60 px-5 py-2 text-xs tracking-[0.2em] font-medium text-gold bg-transparent uppercase hover:bg-gold hover:text-black transition-all duration-300"
            >
              СВЯЗАТЬСЯ
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button"
            className="md:hidden flex items-center justify-center text-zinc-100 hover:text-gold transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            id="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Dynamic sliding drawer for mobile devices */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-b border-white/10 px-6 py-8 flex flex-col gap-6 font-sans text-xs tracking-[0.2em] animate-fade-down duration-300">
            <button onClick={() => scrollToSection("vibe")} className="text-left py-2 hover:text-gold uppercase">Философия</button>
            <button onClick={() => scrollToSection("residences")} className="text-left py-2 hover:text-gold uppercase">Резиденции</button>
            <button onClick={() => scrollToSection("contacts")} className="text-left py-2 hover:text-gold uppercase">Контакты</button>
            <hr className="border-white/5 my-2" />
            <a href="tel:+74959990000" className="flex items-center gap-2 py-2 hover:text-gold text-zinc-300">
              <Phone className="h-4 w-4 text-gold" />
              <span>+7 (495) 999-00-00</span>
            </a>
            <button 
              onClick={() => scrollToSection("contacts")} 
              className="w-full text-center border border-gold text-gold py-3 hover:bg-gold hover:text-black transition-all"
            >
              ЗАБРОНИРОВАТЬ ТУР
            </button>
          </div>
        )}
      </header>

      {/* SECTION 1: IMPRESSIVE HERO SECTION (100vh) */}
      <section 
        ref={heroRef}
        id="hero"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center px-4"
      >
        {dragActive && (
          <div className="absolute inset-0 bg-black/85 border-4 border-dashed border-gold/40 z-30 flex flex-col items-center justify-center gap-4 transition-all duration-300">
            <Upload className="h-16 w-16 text-gold animate-bounce" />
            <span className="font-sans text-lg font-bold tracking-[0.3em] text-gold uppercase text-center px-6">
              ОТПУСТИТЕ ДЛЯ ЗАГРУЗКИ ВИДЕО В ФОН
            </span>
            <span className="font-sans text-[10px] tracking-[0.2em] text-zinc-400 uppercase text-center px-6">
              Файл будет сохранен локально во внутренней базе браузера
            </span>
          </div>
        )}

        {/* Cinematic Video Background, fallback to high-end dusk design cover */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <video 
            ref={videoRef}
            src={videoSource}
            poster="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1920&auto=format&fit=crop"
            preload="auto"
            loop={false}
            autoPlay
            muted 
            playsInline
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            className="object-cover w-full h-full scale-[1.02]"
          />
        </div>

        {/* Centered Hero Content Block */}
        <div id="hero-title-group" className="relative z-20 text-center max-w-5xl flex flex-col items-center transition-all duration-100 ease-out select-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
          <div ref={heroTextRef} className="flex flex-col items-center">
            
            {/* Tiny Boutique Label */}
            <div className="hero-fade-in flex items-center gap-2 mb-6 border border-gold/30 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-xs">
              <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
              <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase font-bold">
                ИНТЕРАКТИВНЫЙ ТЕСТОВЫЙ ШАБЛОН // AVANTGARDE PREMIER
              </span>
            </div>

            {/* Massive 3-line Headline split into letters for stagger effect */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-sans font-black text-white tracking-[0.05em] leading-[1.05] sm:leading-[1.1] uppercase flex flex-col gap-1 items-center drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
              <span className="block overflow-hidden pb-1">
                <SplitText text="ВАША ЖИЗНЬ" lineId="line1" charClassName="text-white hover:text-gold transition-all drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]" />
              </span>
              <span className="block overflow-hidden pb-1">
                <SplitText text="В НОВОМ" lineId="line2" charClassName="text-white hover:text-gold transition-all drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]" />
              </span>
              <span className="block overflow-hidden pb-2">
                <SplitText text="ИЗМЕРЕНИИ" lineId="line3" charClassName="text-gold gold-glow drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]" />
              </span>
            </h1>

            {/* Luxe descriptive subtitle in Playfair script style */}
            <p className="hero-fade-in mt-8 max-w-xl text-white text-sm md:text-base leading-relaxed font-serif italic text-center px-4 bg-black/40 backdrop-blur-[4px] py-3.5 rounded-sm drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] border border-white/5">
              Патриаршие пруды. Архитектурный манифест авангардной мысли. [Частный интерактивный шаблон]: презентация премиальной структуры, панорамного остекления и 12 клубных резиденций с видом на историю.
            </p>

            {/* Interactive button (letters slide on hover) */}
            <div className="hero-fade-in mt-12 flex flex-col sm:flex-row items-center gap-6">
              <button 
                onClick={() => scrollToSection("contacts")}
                className="group relative flex items-center justify-center gap-3 overflow-hidden border border-gold bg-gold px-10 py-5 font-sans text-xs font-bold tracking-[0.25em] text-black uppercase transition-all duration-500 hover:bg-transparent hover:text-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] cursor-pointer"
                id="cta-hero-btn"
              >
                <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-2">
                  Забронировать тур
                </span>
                <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-3 text-current" />
              </button>

              <button
                onClick={() => scrollToSection("vibe")}
                className="font-sans text-xs tracking-[0.25em] text-white hover:text-gold uppercase py-2 transition-colors flex items-center gap-2 group cursor-pointer"
              >
                <span>Изучить ход строительства</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-y-1">↓</span>
              </button>
            </div>
            
          </div>
        </div>

        {/* Scroll Indicator (Bottom middle) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none opacity-50">
          <span className="font-sans text-[8px] tracking-[0.6em] text-gold uppercase">СКРОЛЛ ДЛЯ ЗНАКОМСТВА</span>
          <div className="h-10 w-[1px] bg-gradient-to-b from-gold to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-bounce" />
          </div>
        </div>
      </section>

      {/* SECTION 2: THE VIBE SECTION (100vh) */}
      <section 
        ref={vibeSectionRef}
        id="vibe"
        className="w-full min-h-screen py-24 md:py-0 flex items-center justify-center relative bg-[#111] overflow-hidden border-b border-white/5"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content side */}
          <div className="flex flex-col justify-center space-y-8 z-20">
            <div className="space-y-4">
              <span className="font-sans text-xs tracking-[0.4em] text-gold uppercase font-bold block">
                01 // ТЕСТОВЫЙ РАЗДЕЛ // ФИЛОСОФИЯ ЭСТЕТИКИ
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tight text-white uppercase leading-tight gsap-fade-up">
                ЭСТЕТИКА В <br />
                <span className="font-medium text-gold">КАЖДОЙ ЛИНИИ</span>
              </h2>
              {/* Gold line reveal */}
              <div className="h-[1px] bg-gradient-to-r from-gold via-gold/50 to-transparent luxury-line-reveal w-full mt-2" />
            </div>

            <p className="font-sans text-xs font-semibold tracking-widest text-zinc-400 font-sans uppercase">
              СИНТЕЗ МОДЕРНИСТСКОЙ ЭКСПРЕССИИ И ВЕЧНОЙ КЛАССИКИ
            </p>

            <div className="space-y-6 text-zinc-300 font-serif leading-relaxed text-base italic gsap-fade-up">
              <p>
                Линии фасадов AVANTGARDE PREMIER вдохновлены русским конструктивизмом XX века и современной органической архитектурой. Плавные, стремящиеся ввысь объемы формируют динамичный, пластичный силуэт, который гармонично дополняет историческую застройку Патриарших прудов.
              </p>
              <p className="text-sm font-sans not-italic text-zinc-400 tracking-wide">
                Авторский проект разработан ведущим европейским архитектурным бюро. В облицовке фасадов используется юрский мрамор гаммы Soft-Gold в гармонии с панорамными светопрозрачными алюминиевыми конструкциями и вставками из латуни ручной ковки. Это не просто дом — это частная галерея, произведение высокого строительного искусства.
              </p>
            </div>

            {/* Micro details / achievements */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 gsap-fade-up">
              <div className="space-y-1">
                <span className="block font-sans text-lg font-bold text-gold">12</span>
                <span className="block font-sans text-[9px] tracking-wider text-zinc-400 uppercase">КЛУБНЫХ РЕЗИДЕНЦИЙ</span>
              </div>
              <div className="space-y-1">
                <span className="block font-sans text-lg font-bold text-gold">4.2м</span>
                <span className="block font-sans text-[9px] tracking-wider text-zinc-400 uppercase">ВЫСОТА ПОТОЛКОВ</span>
              </div>
              <div className="space-y-1">
                <span className="block font-sans text-lg font-bold text-gold">360°</span>
                <span className="block font-sans text-[9px] tracking-wider text-zinc-400 uppercase">ВИДЫ НА ЦЕНТР</span>
              </div>
            </div>
          </div>

          {/* Luxury Large Showcase image with hover zoom */}
          <div className="relative group overflow-hidden border border-white/10 flex items-center justify-center bg-zinc-900 aspect-video lg:aspect-[4/5] max-w-full z-10 w-full rounded-sm" id="vibe-showcase-container">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-6 right-6 z-20 backdrop-blur-md bg-black/60 border border-gold/40 px-4 py-2 text-[9px] tracking-[0.3em] text-gold font-sans uppercase">
              LOBBY ATRIUM
            </div>
            
            <div ref={vibeImageRef} className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop" 
                alt="Avantgarde Premier Lobby Art" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="absolute bottom-8 left-8 z-20 space-y-2 max-w-sm">
              <span className="font-sans text-[9px] tracking-[0.2em] text-gold uppercase font-bold">ИНТЕРЬЕРЫ</span>
              <p className="font-serif italic text-lg text-white">
                «Мы создали грандиозный лобби-атриум как портал в мир безмятежного уединения».
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: THE RESIDENCES SECTION (Gallery / Showcase) */}
      <section 
        id="residences"
        className="w-full min-h-screen py-32 bg-[#181818] relative overflow-hidden flex flex-col items-center justify-center border-b border-white/5"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8 w-full">
          
          {/* Section Heading & Filter summary */}
          <div className="text-center relative max-w-3xl mx-auto space-y-4 mb-20">
            <span className="font-sans text-xs tracking-[0.4em] text-gold uppercase font-bold block">
              02 // ТЕСТОВЫЙ КАТАЛОГ РЕЗИДЕНЦИЙ
            </span>
            <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-white uppercase gsap-fade-up">
              КЛУБНЫЕ <span className="font-medium text-gold">РЕЗИДЕНЦИИ</span>
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent luxury-line-reveal w-48 mx-auto mt-2" />
            <p className="font-serif italic text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed pt-2">
              Каждый лот обладает собственной террасой, полностью звукоизолированной структурой и интеллектуальной системой жизнеобеспечения ClimateSense.
            </p>
          </div>

          {/* Premium Cards Grid with Hover Scale & Custom Shadow Glow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {RESIDENCES.map((res, index) => (
              <div 
                key={res.id}
                className="group relative bg-[#111] border border-white/5 overflow-hidden rounded-sm transition-all duration-500 hover:border-gold/30 gold-border-glow flex flex-col justify-between h-[620px] gsap-fade-up"
                style={{ contentVisibility: "auto" }}
                id={`residence-card-${res.id}`}
              >
                {/* Photo Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900 border-b border-white/5">
                  <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-500 group-hover:opacity-10" />
                  <img 
                    src={res.image} 
                    alt={res.title}
                    className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-108"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 z-20 rounded-full bg-black/70 border border-white/10 px-3 py-1 text-[10px] font-sans text-gold">
                    {res.area}
                  </div>
                  <div className="absolute bottom-4 right-4 z-20 backdrop-blur-md bg-black/60 px-4 py-1.5 text-xs text-white border border-gold/10 font-sans tracking-wide">
                    {res.price}
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xl font-sans font-semibold text-white tracking-wide group-hover:text-gold transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed min-h-[64px]">
                      {res.description}
                    </p>
                  </div>

                  {/* Tech Specs bullets */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {res.specs.map((spec, i) => (
                        <span 
                          key={i} 
                          className="text-[9px] font-sans tracking-wider uppercase text-zinc-300 bg-white/5 py-1 px-2.5 transition-all duration-300 group-hover:bg-gold/10 group-hover:text-gold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-sans text-zinc-500 pt-2 text-gold">
                      <span className="uppercase tracking-widest">{res.rooms}</span>
                      <span className="uppercase tracking-widest">{res.area}</span>
                    </div>
                  </div>

                  {/* Interaction Action Button */}
                  <button 
                    onClick={() => {
                      setBookingFormData({ ...bookingFormData, residenceType: res.title });
                      scrollToSection("contacts");
                    }}
                    className="w-full mt-6 flex items-center justify-center gap-2 border border-white/10 font-sans py-3.5 text-[10px] tracking-widest text-zinc-400 uppercase transition-all duration-300 group-hover:bg-gold group-hover:text-black group-hover:border-gold"
                  >
                    <span>Запросить спецификацию</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Bottom Bar Quote */}
          <div className="mt-16 text-center gsap-fade-up">
            <span className="inline-block border border-gold/20 bg-gold/5 px-6 py-4 max-w-3xl text-xs font-sans tracking-[0.15em] text-zinc-300 leading-relaxed uppercase">
              ✦ ПРЕДВАРИТЕЛЬНОЕ БРОНИРОВАНИЕ ДОСТУПНО ТОЛЬКО ДЛЯ ЧЛЕНОВ PREMIER CLUB И ПО ПЕРСОНАЛЬНОМУ ЗАПРОСУ.
            </span>
          </div>

        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION (Form / Footer) */}
      <section 
        id="contacts"
        className="w-full min-h-screen py-24 bg-[#111] relative overflow-hidden flex items-center justify-center"
      >
        {/* Cinematic abstract lighting accent */}
        <div className="absolute right-[-10%] bottom-[-5%] w-[50vw] h-[50vw] rounded-full bg-gold/5 filter blur-[150px] z-0 pointer-events-none" />
        <div className="absolute left-[-5%] top-[10%] w-[35vw] h-[35vw] rounded-full bg-gold/3 filter blur-[120px] z-0 pointer-events-none" />

        <div className="mx-auto max-w-4xl px-6 md:px-8 w-full z-10">
          
          {!bookingSubmitted ? (
            <div className="space-y-12">
              
              {/* Heading Titles */}
              <div className="text-center space-y-3">
                <span className="font-sans text-xs tracking-[0.4em] text-gold uppercase font-bold block">
                  03 // ТЕСТОВОЕ БРОНИРОВАНИЕ ТУРА
                </span>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tight text-white uppercase">
                  НАЧАТЬ <span className="font-medium text-gold font-sans underline decoration-gold/30">СВОЙ ТЕСТОВЫЙ ВИЗИТ</span>
                </h2>
                <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent luxury-line-reveal w-48 mx-auto mt-2" />
                <p className="font-serif italic text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed pt-2">
                  Заполните закрытый запрос. Наш консьерж свяжется с Вами в течение 10 минут, чтобы согласовать закрытый тур у берегов Патриарших.
                </p>
              </div>

              {/* Luxury Form Layout */}
              <form onSubmit={handleBookingSubmit} className="space-y-8 bg-[#181818] border border-white/5 p-8 md:p-12 shadow-2xl rounded-sm gsap-fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="name-input" className="block font-sans text-[10px] tracking-[0.25em] text-gold uppercase font-semibold">
                      Ваше имя
                    </label>
                    <input 
                      id="name-input"
                      type="text" 
                      required
                      placeholder="Александр Романов"
                      value={bookingFormData.name}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-4 text-sm font-sans tracking-wide text-white focus:outline-none focus:border-gold transition-colors hover:border-zinc-700"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-2">
                    <label htmlFor="phone-input" className="block font-sans text-[10px] tracking-[0.25em] text-gold uppercase font-semibold">
                      Номер телефона
                    </label>
                    <input 
                      id="phone-input"
                      type="tel" 
                      required
                      placeholder="+7 (999) 000-00-00"
                      value={bookingFormData.phone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-4 text-sm font-sans tracking-wide text-white focus:outline-none focus:border-gold transition-colors hover:border-zinc-700"
                    />
                  </div>

                </div>

                {/* Dropdown selected specification */}
                <div className="space-y-2">
                  <label htmlFor="residence-select" className="block font-sans text-[10px] tracking-[0.25em] text-gold uppercase font-semibold">
                    Интересующий тип резиденции
                  </label>
                  <select 
                    id="residence-select"
                    value={bookingFormData.residenceType || "Grand Avantgarde Penthouse"}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, residenceType: e.target.value })}
                    className="w-full bg-[#111] border border-white/10 px-4 py-4 text-sm font-sans text-zinc-300 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="Grand Avantgarde Penthouse">Grand Avantgarde Penthouse</option>
                    <option value="Patriarshie Premiere Residence">Patriarshie Premiere Residence</option>
                    <option value="The Duplex Glasshouse">The Duplex Glasshouse</option>
                    <option value="Консультация с архитектором проекта">Консультация с архитектором проекта</option>
                  </select>
                </div>

                {/* Submit deluxe card CTA (text moves slightly on hover) */}
                <button
                  type="submit"
                  className="group w-full relative overflow-hidden bg-gold border border-gold text-black font-sans text-xs font-bold tracking-[0.3em] py-5 uppercase transition-all duration-500 hover:bg-transparent hover:text-gold hover:shadow-[0_0_35px_rgba(212,175,55,0.3)] cursor-pointer"
                  id="submit-booking-btn"
                >
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-3">
                    Заказать эксклюзивный тур
                  </span>
                  <ArrowRight className="inline border-current ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-4" />
                </button>

                <p className="text-[10px] text-zinc-500 text-center font-sans tracking-wide">
                  Нажимая на кнопку, Вы добровольно соглашаетесь на обработку Ваших персональных данных в соответствии с премиальной политикой конфиденциальности Avantgarde Club.
                </p>
              </form>
            </div>
          ) : (
            /* Immersive Success state - Ticket invite generator */
            <div className="bg-[#181818] border border-gold/40 p-8 md:p-12 text-center rounded-sm space-y-8 shadow-2xl max-w-2xl mx-auto relative overflow-hidden" id="booking-success-container">
              
              {/* Confetti layout visual effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-white to-gold animate-pulse" />
              
              <div className="mx-auto h-16 w-16 bg-gold/10 border border-gold rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-gold" />
              </div>

              <div className="space-y-4">
                <span className="font-sans text-xs tracking-[0.4em] text-gold uppercase block">
                  PREMIER CLUB СТАТУС ПОДТВЕРЖДЕН
                </span>
                <h3 className="text-2xl sm:text-3xl font-sans font-light tracking-wide text-white uppercase">
                  КЛУБНАЯ КАРТА БРОНИРОВАНИЯ
                </h3>
                <p className="font-serif italic text-zinc-300 text-sm max-w-lg mx-auto leading-relaxed">
                  Александр Романов, ваш персональный консьерж уже формирует презентацию, учитывая пожелания по лоту <span className="text-gold font-sans font-medium">{bookingFormData.residenceType}</span>. Мы в скором времени согласуем дату вашего эксклюзивного визита.
                </p>
              </div>

              {/* Immersive visual ticket card */}
              <div className="border border-white/10 bg-zinc-950 p-6 rounded-md font-sans text-left space-y-4 relative">
                <div className="absolute right-6 top-6 h-12 w-12 border border-gold/30 rounded-sm flex items-center justify-center">
                  <span className="text-gold text-[10px] font-bold tracking-widest leading-none">VIP</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="block text-zinc-500 uppercase text-[9px] tracking-wider">КОД ПРИГЛАШЕНИЯ:</span>
                    <span className="text-sm font-bold text-gold font-mono tracking-widest">{ticketNumber}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 uppercase text-[9px] tracking-wider">РЕДАКТОР СТАТУСА:</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">CONCIERGE OK</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[9px] tracking-wide text-zinc-400">
                  <div className="flex items-center gap-1.5 font-sans">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    <span>ЛИСТ КЛИЕНТА ПЕРЕДАН</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-sans">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    <span>МОСКВА, ПАТРИАРШИЕ ПРУДЫ</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setBookingSubmitted(false)}
                className="font-sans text-[10px] tracking-[0.25em] text-zinc-400 hover:text-gold uppercase pt-4 transition-colors"
              >
                Вернуться или оформить новый запрос
              </button>
            </div>
          )}

          {/* Luxury Footer details */}
          <footer className="mt-28 border-t border-white/5 pt-12 text-center text-zinc-500 font-sans text-[11px] tracking-widest space-y-6">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-zinc-400 max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" />
                <span>AVANTGARDE PREMIER // AWARDS WINNER</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>КОНФИДЕНЦИАЛЬНОСТЬ НА ВЫСОТЕ</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-gold" />
                <span>ЭКОЛОГИЧЕСКИЙ СЕРТИФИКАТ BREEAM</span>
              </div>
            </div>

            <p className="leading-relaxed text-zinc-600">
              © {new Date().getFullYear()} AVANTGARDE PREMIER RESIDENCE. ВСЕ ПРАВА ЗАЩИЩЕНЫ. <br />
              ИНТЕРАКТИВНЫЙ ТЕСТОВЫЙ ШАБЛОН ДЛЯ ДЕМОНСТРАЦИИ СТРУКТУРЫ И ФУНКЦИОНАЛА ВИДЕОПЛЕЕРА. ВСЕ ПРИМЕНЕННЫЕ ВИДЕО СОХРАНЯЮТСЯ ЛОКАЛЬНО В ПАМЯТИ ВАШЕГО БРАУЗЕРА.
            </p>
          </footer>

        </div>
      </section>
    </div>
  );
}
