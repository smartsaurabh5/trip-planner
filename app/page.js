'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Sun, 
  Sunset, 
  Compass, 
  Luggage, 
  Info,
  Loader2,
  Printer,
  Copy,
  Check,
  Hotel,
  Utensils,
  Car,
  Ticket,
  PieChart,
  ExternalLink,
  Languages,
  RefreshCw,
  CloudSun,
  Shirt,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  History,
  Trash2,
  X,
  BookmarkCheck,
  Banknote,
  Maximize2,
  Download,
  Play,
  Pause,
  Heart,
  HelpCircle,
  ChevronDown,
  Coffee,
  Share2,
  Sliders
} from 'lucide-react';

// Crucial: RouteMap dynamic import MUST be at module scope so Next.js never re-creates the component class on parent state changes!
const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] xs:h-[340px] sm:h-[380px] md:h-[420px] bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 text-sm border border-slate-800">
      Loading interactive route map...
    </div>
  ),
});

export default function Home() {
  const [formData, setFormData] = useState({
    destination: '',
    daysOption: '3',
    customDays: '',
    budgetOption: 'Moderate',
    customBudget: '',
    travelersOption: 'Solo / 1 Person',
    customTravelers: '',
    interests: 'Sightseeing, Local Food, Photography',
    language: 'English',
    currency: 'INR (₹)'
  });

  const [loading, setLoading] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Real-time live online users count tracking (Accurate live visitors)
  const [onlineUsers, setOnlineUsers] = useState(1);

  useEffect(() => {
    let sessionId = sessionStorage.getItem('ghumakkad_session_id');
    if (!sessionId) {
      sessionId = 'user_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      sessionStorage.setItem('ghumakkad_session_id', sessionId);
    }

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data && typeof data.activeUsers === 'number') {
          setOnlineUsers(data.activeUsers);
        }
      } catch (err) {
        // Silent fallback
      }
    };

    // Initial heartbeat pulse
    sendHeartbeat();

    // Send heartbeat every 10 seconds to maintain active status
    const interval = setInterval(sendHeartbeat, 10000);

    // Notify server instantly when tab closes
    const handleUnload = () => {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ sessionId, action: 'leave' })], { type: 'application/json' });
        navigator.sendBeacon('/api/presence', blob);
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // Saved Trips Drawer State
  const [savedTrips, setSavedTrips] = useState([]);
  
  // Modals state: null | 'about' | 'faq' | 'support' | 'drawer' | 'lightbox'
  const [activeModal, setActiveModal] = useState(null);

  // Ambient Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('trip_planner_history');
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load trips from storage', e);
    }
  }, []);

  const resultsRef = useRef(null);

  const saveTripToHistory = (newPlan) => {
    const tripWithId = {
      ...newPlan,
      id: Date.now().toString(),
      savedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };
    const updated = [tripWithId, ...savedTrips.filter(t => t.destination !== newPlan.destination)].slice(0, 10);
    setSavedTrips(updated);
    localStorage.setItem('trip_planner_history', JSON.stringify(updated));
  };

  const deleteSavedTrip = (id, e) => {
    e.stopPropagation();
    const updated = savedTrips.filter((t) => t.id !== id);
    setSavedTrips(updated);
    localStorage.setItem('trip_planner_history', JSON.stringify(updated));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const quickSelectVibe = (presetInterests, presetDest = '') => {
    setFormData(prev => ({
      ...prev,
      interests: presetInterests,
      destination: presetDest || prev.destination
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalDays = formData.daysOption === 'custom' ? (formData.customDays || '3') : formData.daysOption;
    const finalBudget = formData.budgetOption === 'custom' ? (formData.customBudget || 'Moderate') : formData.budgetOption;
    const finalTravelers = formData.travelersOption === 'custom' ? `${formData.customTravelers || 1} People` : formData.travelersOption;

    const payload = {
      destination: formData.destination,
      days: finalDays,
      budget: finalBudget,
      exactBudgetAmount: formData.budgetOption === 'custom' ? formData.customBudget : '',
      travelers: finalTravelers,
      exactTravelersCount: formData.travelersOption === 'custom' ? formData.customTravelers : '',
      interests: formData.interests,
      language: formData.language,
      currency: formData.currency,
    };
    
    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setTripPlan(data.data);
      saveTripToHistory(data.data);

      // Scroll smoothly to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (dayNumber, currentTheme) => {
    setRegeneratingDay(dayNumber);

    const finalBudget = formData.budgetOption === 'custom' ? (formData.customBudget || 'Moderate') : formData.budgetOption;

    try {
      const res = await fetch('/api/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripPlan.destination,
          dayNumber,
          currentTheme,
          budget: finalBudget,
          interests: formData.interests,
          language: formData.language,
          currency: formData.currency,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate day');

      const updatedDailyPlan = tripPlan.dailyPlan.map((d) => (d.day === dayNumber ? data.data : d));
      const updatedTrip = { ...tripPlan, dailyPlan: updatedDailyPlan };
      
      setTripPlan(updatedTrip);
      saveTripToHistory(updatedTrip);
    } catch (err) {
      alert(err.message || 'Could not regenerate this day. Try again.');
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!tripPlan) return;
    const text = `Trip to ${tripPlan.destination} (${tripPlan.duration})\n\nSummary: ${tripPlan.summary}\nEstimated Budget: ${tripPlan.estimatedCost}\n\nDaily Plan:\n` +
      tripPlan.dailyPlan.map(d => `Day ${d.day} - ${d.theme}\n- Morning: ${d.morning}\n- Afternoon: ${d.afternoon}\n- Evening: ${d.evening}\n- Tip: ${d.tips || 'N/A'}\n`).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMapsUrl = (query, destination) => {
    const searchQuery = encodeURIComponent(`${query} in ${destination}`);
    return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(e => console.log('Audio play blocked', e));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background Audio element */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" 
      />

      {/* FLOATING AUDIO PLAYER - LEFT DOWNSIDE CORNER */}
      <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 print:hidden max-w-[calc(100vw-1.5rem)]">
        <div className="glass-panel px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl flex items-center gap-2 border border-slate-700/60 shadow-2xl hover:border-amber-500/40 transition">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          </div>
          
          <div className="hidden xs:block min-w-0 max-w-[130px] sm:max-w-[160px]">
            <p className="text-[10px] sm:text-[11px] font-bold text-white truncate">Raah Mein Unse Mulaqat</p>
            <p className="text-[9px] text-slate-400 truncate">Roadtrip Playlist • Ghumakkad</p>
          </div>

          <button
            onClick={toggleAudio}
            className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition shadow-md shrink-0 cursor-pointer active:scale-95"
            title={isPlayingAudio ? "Pause Travel Music" : "Play Travel Music"}
          >
            {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* FULL SCREEN WALLPAPER HERO CONTAINER - FITS EXACTLY 100VH WITHOUT SCROLLING */}
      <div className="relative h-screen min-h-[560px] w-full flex flex-col justify-between overflow-hidden bg-slate-950">
        
        {/* Completely Clear Responsive Wallpaper Background */}
        <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
          {/* Desktop Wallpaper */}
          <img 
            src="/ghumakkad-saathi.jpg" 
            alt="घुम्मकड़ साथी - Wallpaper Desktop" 
            className="hidden sm:block w-full h-full object-cover object-center filter brightness-100 contrast-100"
          />
          {/* Mobile Wallpaper - Shrunk & fitted with object-contain so zero left/right clipping occurs */}
          <img 
            src="/ghumakkad-saathi-mobile.jpg" 
            alt="घुम्मकड़ साथी - Wallpaper Mobile" 
            className="block sm:hidden w-full h-full object-contain object-center filter brightness-100 contrast-100 scale-[0.98]"
          />
        </div>

        {/* TOP NAVIGATION BAR */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-2.5 sm:py-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          {/* Top Left: Live Online Users Badge + Mobile Saved Plans Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-slate-900/85 border border-slate-700/60 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-slate-200 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span className="font-mono font-bold text-white">{onlineUsers}</span>
              <span className="text-slate-400 hidden xs:inline">online</span>
            </div>

            {/* Saved Plans accessible on mobile screens */}
            <button
              onClick={() => setActiveModal('drawer')}
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-indigo-950/85 border border-indigo-500/40 text-indigo-200 hover:text-white text-[11px] sm:text-xs font-semibold transition shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
              title="Saved Plans History"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Saved ({savedTrips.length})</span>
            </button>
          </div>

          {/* Top Center/Right: Artwork & Pill Buttons (About, FAQ, Support us) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveModal('lightbox')}
              className="hidden md:flex px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-900/85 border border-slate-700/60 text-slate-200 hover:text-white hover:border-amber-500/50 text-[11px] sm:text-xs font-semibold transition shadow-md cursor-pointer items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Artwork</span>
            </button>

            <button
              onClick={() => setActiveModal('about')}
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/85 border border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:text-white text-[11px] sm:text-xs font-semibold transition shadow-md cursor-pointer active:scale-95"
            >
              About
            </button>

            <button
              onClick={() => setActiveModal('faq')}
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-900/85 border border-slate-700/60 text-slate-200 hover:bg-slate-800 hover:text-white text-[11px] sm:text-xs font-semibold transition shadow-md cursor-pointer active:scale-95"
            >
              FAQ
            </button>

            <button
              onClick={() => setActiveModal('support')}
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold hover:brightness-110 text-[11px] sm:text-xs transition shadow-lg flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden xs:inline">Support</span>
              <span className="xs:hidden">♥</span>
            </button>
          </div>
        </header>

        {/* CENTER HERO SEARCH SECTION - LOWER THIRD ALIGNED TO LEAVE ARTWORK TEXT 100% UNCOVERED */}
        <main className="relative z-10 w-full max-w-3xl mx-auto px-3 sm:px-4 flex-1 flex flex-col justify-end items-center text-center pb-2.5 sm:pb-4 pt-0">
          
          {/* MAIN SEARCH & TRIP FORM DECK */}
          <div className="w-full glass-panel amber-glow rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-700/60">
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              
              {/* Primary Search Input Row */}
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <MapPin className="absolute left-3.5 sm:left-4 w-4 sm:w-5 h-4 sm:h-5 text-amber-400 z-10 pointer-events-none" />
                  <input
                    type="text"
                    name="destination"
                    required
                    placeholder="Destination (e.g. Manali, Varanasi, Goa)"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-36 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl glass-input text-sm sm:text-base text-white placeholder-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="hidden sm:flex absolute right-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-lg disabled:opacity-70 items-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile Full Width Search Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:hidden w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:brightness-110 text-slate-950 font-extrabold text-sm transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate AI Trip Plan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Settings Bar - Days, Budget & People in clean responsive 3-column layout */}
              <div className="space-y-1.5 pt-0.5">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-xs text-slate-300">
                  
                  {/* Days Dropdown */}
                  <div className="flex flex-col items-center justify-center bg-slate-900/90 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700/80">
                    <div className="flex items-center gap-1 mb-0.5 sm:mb-0">
                      <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Days</span>
                    </div>
                    <select
                      name="daysOption"
                      value={formData.daysOption}
                      onChange={handleChange}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer text-center w-full"
                    >
                      <option value="1" className="bg-slate-900">1 Day</option>
                      <option value="2" className="bg-slate-900">2 Days</option>
                      <option value="3" className="bg-slate-900">3 Days</option>
                      <option value="5" className="bg-slate-900">5 Days</option>
                      <option value="7" className="bg-slate-900">7 Days</option>
                      <option value="custom" className="bg-slate-900 text-amber-400">Custom...</option>
                    </select>

                    {formData.daysOption === 'custom' && (
                      <input
                        type="number"
                        name="customDays"
                        min="1"
                        max="60"
                        placeholder="Days"
                        value={formData.customDays}
                        onChange={handleChange}
                        className="mt-1 w-full bg-slate-950 border border-amber-500/50 text-amber-300 font-bold text-xs px-1 py-0.5 rounded-md focus:outline-none text-center"
                        required
                      />
                    )}
                  </div>

                  {/* Budget Dropdown */}
                  <div className="flex flex-col items-center justify-center bg-slate-900/90 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700/80">
                    <div className="flex items-center gap-1 mb-0.5 sm:mb-0">
                      <DollarSign className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Budget</span>
                    </div>
                    <select
                      name="budgetOption"
                      value={formData.budgetOption}
                      onChange={handleChange}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer text-center w-full"
                    >
                      <option value="Budget / Backpacker" className="bg-slate-900">Budget</option>
                      <option value="Moderate" className="bg-slate-900">Moderate</option>
                      <option value="Luxury" className="bg-slate-900">Luxury</option>
                      <option value="custom" className="bg-slate-900 text-emerald-400">Custom...</option>
                    </select>

                    {formData.budgetOption === 'custom' && (
                      <input
                        type="text"
                        name="customBudget"
                        placeholder="₹15k"
                        value={formData.customBudget}
                        onChange={handleChange}
                        className="mt-1 w-full bg-slate-950 border border-emerald-500/50 text-emerald-300 font-bold text-xs px-1 py-0.5 rounded-md focus:outline-none text-center"
                        required
                      />
                    )}
                  </div>

                  {/* People Dropdown */}
                  <div className="flex flex-col items-center justify-center bg-slate-900/90 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-700/80">
                    <div className="flex items-center gap-1 mb-0.5 sm:mb-0">
                      <Users className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Travelers</span>
                    </div>
                    <select
                      name="travelersOption"
                      value={formData.travelersOption}
                      onChange={handleChange}
                      className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer text-center w-full"
                    >
                      <option value="Solo / 1 Person" className="bg-slate-900">Solo (1)</option>
                      <option value="Couple (2 People)" className="bg-slate-900">Couple (2)</option>
                      <option value="Family (3-4 People)" className="bg-slate-900">Family (3-4)</option>
                      <option value="Friends Group (5+ People)" className="bg-slate-900">Friends (5+)</option>
                      <option value="custom" className="bg-slate-900 text-sky-400">Custom...</option>
                    </select>

                    {formData.travelersOption === 'custom' && (
                      <input
                        type="number"
                        name="customTravelers"
                        min="1"
                        max="100"
                        placeholder="Count"
                        value={formData.customTravelers}
                        onChange={handleChange}
                        className="mt-1 w-full bg-slate-950 border border-sky-500/50 text-sky-300 font-bold text-xs px-1 py-0.5 rounded-md focus:outline-none text-center"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-[10px] sm:text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer py-0.5 px-2 rounded-lg bg-amber-500/10 border border-amber-500/20 active:scale-95"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{showAdvancedFilters ? 'Less Filters' : 'More Filters (Language, Currency, Vibes)'}</span>
                  </button>
                </div>
              </div>

              {/* Advanced Options Accordion - COMPACT & CLEAN */}
              {showAdvancedFilters && (
                <div className="pt-2 mt-1 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left animate-in fade-in duration-200">
                  <div>
                    <label className="text-[10px] sm:text-[11px] font-semibold text-slate-300 mb-0.5 block">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full bg-slate-900/95 text-white rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Hinglish">Hinglish</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-[11px] font-semibold text-slate-300 mb-0.5 block">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full bg-slate-900/95 text-white rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="INR (₹)">INR (₹)</option>
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-[11px] font-semibold text-slate-300 mb-0.5 block">Interests</label>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      placeholder="e.g. Photography, Dhaba"
                      className="w-full bg-slate-900/95 text-white rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </form>

            {error && (
              <div className="mt-2 p-2.5 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs text-center">
                {error}
              </div>
            )}
          </div>

          {/* Preset Quick Vibe Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3.5 px-1">
            <button
              type="button"
              onClick={() => quickSelectVibe('Rainy Roadtrip, Highway Tea Stalls, Scenic Overlooks', 'Manali')}
              className="glass-pill px-3 py-1.5 rounded-full text-[11px] sm:text-xs text-amber-200 font-medium transition cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <span>🌧️ Baarish Roadtrip?</span>
            </button>
            <button
              type="button"
              onClick={() => quickSelectVibe('Dhaba Food, Highway Stops, Heritage Forts', 'Jaipur')}
              className="glass-pill px-3 py-1.5 rounded-full text-[11px] sm:text-xs text-slate-200 font-medium transition cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <span>🚗 Highway Dhaba Guide</span>
            </button>
            <button
              type="button"
              onClick={() => quickSelectVibe('Ghats, Local Food, Ancient Temples', 'Varanasi')}
              className="glass-pill px-3 py-1.5 rounded-full text-[11px] sm:text-xs text-emerald-200 font-medium transition cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <span>📍 Heritage Route</span>
            </button>
          </div>

        </main>

        {/* BOTTOM SCROLL INDICATOR */}
        <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 md:px-8 py-3 sm:py-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-300 uppercase drop-shadow-md">
            <span>SCROLL</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
          </div>
        </footer>

      </div>

      {/* RESULTS DISPLAY SECTION */}
      <div ref={resultsRef} id="itinerary-results" className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
        
        {tripPlan ? (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            
            {/* Action Buttons Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wider">Itinerary Ready</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">{tripPlan.destination}</h2>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopy}
                  className="w-full justify-center px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full justify-center px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>PDF / Print</span>
                </button>
              </div>
            </div>

            {/* Overview Card */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-800 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Trip Summary</h3>
                    <span className="text-[10px] sm:text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
                      Auto-Saved
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium">{tripPlan.duration}</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl sm:rounded-2xl self-start sm:self-auto">
                  <p className="text-[10px] sm:text-xs text-amber-400 font-semibold uppercase tracking-wider">Estimated Budget</p>
                  <p className="text-base sm:text-lg font-bold text-white">{tripPlan.estimatedCost}</p>
                </div>
              </div>

              <p className="mt-4 text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">{tripPlan.summary}</p>
            </div>

            {/* Weather Advisory Card */}
            {tripPlan.weather && (
              <div className="bg-sky-950/60 border border-sky-800/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
                <h3 className="text-sm sm:text-base font-bold text-sky-300 mb-3 flex items-center gap-2">
                  <CloudSun className="w-4 sm:w-5 h-4 sm:h-5 text-sky-400 shrink-0" /> Weather Advisory & Clothing Guide
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                      <Thermometer className="w-3.5 h-3.5" /> Expected Temp
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white">{tripPlan.weather.temperature || 'Moderate'}</p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                      <CloudSun className="w-3.5 h-3.5" /> Conditions
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-white">{tripPlan.weather.condition || 'Pleasant'}</p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                      <Shirt className="w-3.5 h-3.5" /> What to Wear
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-white">{tripPlan.weather.clothingTip || 'Casual wear'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Local Safety & Scam Advisory */}
            {tripPlan.safetyAdvisory && (
              <div className="bg-amber-950/50 border border-amber-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 sm:mb-4 border-b border-amber-500/20 pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-amber-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 shrink-0" /> Local Safety & Tourist Advice
                  </h3>
                  {tripPlan.safetyAdvisory.emergencyContact && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto">
                      <PhoneCall className="w-3 h-3 text-amber-400" /> Helpline: {tripPlan.safetyAdvisory.emergencyContact}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Common Tourist Traps & Scams
                    </p>
                    <ul className="space-y-2">
                      {tripPlan.safetyAdvisory.commonScams?.map((scam, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{scam}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Safety Recommendations
                    </p>
                    <ul className="space-y-2">
                      {tripPlan.safetyAdvisory.safeTravelTips?.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Route Map */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" /> Interactive Route Map
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    Explore landmarks and suggested routes for {tripPlan.destination}
                  </p>
                </div>
              </div>
              <RouteMap 
                key={tripPlan.id || tripPlan.destination || 'route-map'}
                destination={tripPlan.destination} 
                mapData={tripPlan.mapCoordinates || tripPlan.mapData} 
                mapCoordinates={tripPlan.mapCoordinates}
                coordinates={tripPlan.mapCoordinates}
              />
            </div>

            {/* Day-by-Day Experience Schedule */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Calendar className="w-5 sm:w-6 h-5 sm:h-6 text-amber-400" /> Day-by-Day Itinerary
              </h3>

              {tripPlan.dailyPlan.map((day) => (
                <div 
                  key={day.day} 
                  className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl space-y-4"
                >
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 border-b border-slate-800 pb-3.5 sm:pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center shadow-md shrink-0">
                        {day.day}
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-white leading-tight">{day.theme}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-400">Day {day.day} Timeline</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegenerateDay(day.day, day.theme)}
                      disabled={regeneratingDay === day.day}
                      className="w-full xs:w-auto justify-center px-3.5 py-1.5 rounded-xl border border-amber-500/40 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {regeneratingDay === day.day ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" /> Swap Vibe
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                    {/* Morning */}
                    <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <Sun className="w-4 h-4" /> MORNING
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{day.morning}</p>
                      </div>
                      <a 
                        href={getMapsUrl(day.morning, tripPlan.destination)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer w-full"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>Explore in Map</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>

                    {/* Afternoon */}
                    <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                            <Compass className="w-4 h-4" /> AFTERNOON
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{day.afternoon}</p>
                      </div>
                      <a 
                        href={getMapsUrl(day.afternoon, tripPlan.destination)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition cursor-pointer w-full"
                      >
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        <span>Explore in Map</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>

                    {/* Evening */}
                    <div className="bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <Sunset className="w-4 h-4" /> EVENING
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{day.evening}</p>
                      </div>
                      <a 
                        href={getMapsUrl(day.evening, tripPlan.destination)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer w-full"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>Explore in Map</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>

                  {day.tips && (
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Day Tip:</strong> {day.tips}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Estimated Expenses Breakdown */}
            {(() => {
              const breakdown = tripPlan.budgetBreakdown || tripPlan.costBreakdown;

              const formatCostVal = (item, defaultPercent) => {
                if (!item) return defaultPercent;
                if (typeof item === 'string') return item;
                if (typeof item === 'number') return `${item}%`;
                if (item.estimatedAmount && item.percentage) return `${item.estimatedAmount} (${item.percentage}%)`;
                if (item.estimatedAmount) return item.estimatedAmount;
                if (item.percentage) return `${item.percentage}%`;
                return defaultPercent;
              };

              return (
                <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl">
                  <h3 className="text-sm sm:text-base font-bold text-emerald-400 mb-3.5 sm:mb-4 flex items-center gap-2">
                    <PieChart className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" /> Estimated Expenses Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center">
                    <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                      <Hotel className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 text-indigo-400" />
                      <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Stay & Hotel</p>
                      <p className="text-xs sm:text-sm font-bold text-white mt-0.5 sm:mt-1">{formatCostVal(breakdown?.stay, '35%')}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                      <Utensils className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 text-amber-400" />
                      <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Food & Dhabas</p>
                      <p className="text-xs sm:text-sm font-bold text-white mt-0.5 sm:mt-1">{formatCostVal(breakdown?.food, '30%')}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                      <Car className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 text-sky-400" />
                      <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Transport</p>
                      <p className="text-xs sm:text-sm font-bold text-white mt-0.5 sm:mt-1">{formatCostVal(breakdown?.transport, '20%')}</p>
                    </div>
                    <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
                      <Ticket className="w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 text-emerald-400" />
                      <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Activities</p>
                      <p className="text-xs sm:text-sm font-bold text-white mt-0.5 sm:mt-1">{formatCostVal(breakdown?.activities, '15%')}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        ) : (
          /* Empty state guide when no search has been done yet */
          <div className="text-center py-12 sm:py-16 px-4 glass-panel rounded-2xl sm:rounded-3xl border border-slate-800 max-w-2xl mx-auto">
            <Compass className="w-10 sm:w-12 h-10 sm:h-12 text-amber-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg sm:text-xl font-bold text-white">Ready for your next journey?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Enter a destination above (e.g. Manali, Varanasi, Jaipur, Dubai) and click <strong className="text-amber-400">Search</strong> to generate your complete AI itinerary.
            </p>
          </div>
        )}

      </div>

      {/* ABOUT MODAL */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base sm:text-lg">About घुम्मकड़ साथी</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>घुम्मकड़ साथी (Ghumakkad Saathi)</strong> is your intelligent AI-powered Indian roadtrip & travel companion designed to celebrate authentic travel experiences.
              </p>
              <p>
                Whether you are exploring monsoon highways, hunting for iconic roadside dhaba tea stalls, or discovering ancient heritage routes, Ghumakkad Saathi generates personalized itineraries with weather forecasts, local safety advisories, and interactive route mapping.
              </p>
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-amber-300 font-mono">
                ⚡ Powered by Google Gemini AI & Live Leaflet Interactive Maps.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {activeModal === 'faq' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="relative max-w-xl w-full glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base sm:text-lg">Frequently Asked Questions</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800">
                <p className="font-bold text-amber-300 mb-1">1. How does Ghumakkad Saathi generate plans?</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  We use Google Gemini AI tuned with local travel intelligence to generate tailored morning, afternoon, and evening experiences according to your budget and interests.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800">
                <p className="font-bold text-amber-300 mb-1">2. Can I export or print my itinerary?</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Yes! Click the <strong>PDF / Print</strong> button at any time to save a print-formatted PDF copy of your plan.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800">
                <p className="font-bold text-amber-300 mb-1">3. Are my itineraries auto-saved?</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Yes, your recent 10 generated itineraries are stored securely in your browser storage. Access them anytime via <strong>Saved Plans</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT US MODAL */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="relative max-w-md w-full glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center mx-auto shadow-lg">
              <Heart className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>

            <h3 className="font-black text-white text-lg sm:text-xl">Support घुम्मकड़ साथी</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you love planning your travels with Ghumakkad Saathi, consider supporting our project or buying us a roadside tapri chai! ☕
            </p>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => alert('Thank you for buying us a chai! ☕ Support link simulated.')}
                className="w-full py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Coffee className="w-4 h-4" /> Buy us a Tapri Chai (₹50)
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Link copied! Share Ghumakkad Saathi with your friends.');
                }}
                className="w-full py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4 text-indigo-400" /> Share with Friends
              </button>
            </div>

            <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:underline pt-2 block mx-auto py-1 px-3">
              Close
            </button>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {activeModal === 'lightbox' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-5xl w-full bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm sm:text-lg">घुम्मकड़ साथी — Official Artwork</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[65vh] sm:max-h-[75vh] overflow-hidden">
              <picture className="max-h-[60vh] sm:max-h-[70vh] w-auto">
                <source media="(max-width: 639px)" srcSet="/ghumakkad-saathi-mobile.jpg" />
                <img
                  src="/ghumakkad-saathi.jpg"
                  alt="घुम्मकड़ साथी Artwork"
                  className="max-h-[60vh] sm:max-h-[70vh] w-auto object-contain rounded-xl shadow-lg mx-auto"
                />
              </picture>
            </div>
            <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-400">
              <p className="text-center sm:text-left text-[11px] sm:text-xs">Roadside India Nostalgia • Highway Dhaba & Rainy Highway</p>
              <div className="flex items-center gap-2">
                <a
                  href="/ghumakkad-saathi-mobile.jpg"
                  download="ghumakkad-saathi-mobile.jpg"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold transition flex items-center gap-1.5 shrink-0 text-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> Mobile HD
                </a>
                <a
                  href="/ghumakkad-saathi.jpg"
                  download="ghumakkad-saathi-wallpaper.jpg"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5 shrink-0 active:scale-95 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Desktop HD
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVED TRIPS DRAWER */}
      {activeModal === 'drawer' && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
            onClick={() => setActiveModal(null)} 
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <div className="w-screen max-w-xs xs:max-w-sm sm:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-4 sm:p-6 flex flex-col text-slate-100">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base sm:text-lg">Saved Trips History</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 pr-0.5">
                {savedTrips.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <History className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-medium text-slate-400">No saved trips yet.</p>
                  </div>
                ) : (
                  savedTrips.map((saved) => (
                    <div
                      key={saved.id}
                      onClick={() => {
                        setTripPlan(saved);
                        setActiveModal(null);
                        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
                      }}
                      className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between gap-2 active:scale-[0.98]"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-bold text-white text-sm sm:text-base truncate">{saved.destination}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-400 truncate">{saved.duration} • {saved.estimatedCost}</p>
                      </div>

                      <button
                        onClick={(e) => deleteSavedTrip(saved.id, e)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg shrink-0"
                        title="Delete trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}