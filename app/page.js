'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
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
  BookmarkCheck
} from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    destination: '',
    days: '3',
    budget: 'Moderate',
    travelers: '1 Person',
    interests: 'Sightseeing, Local Food, Photography',
    language: 'English'
  });

  const [loading, setLoading] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Saved Trips Drawer State
  const [savedTrips, setSavedTrips] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load saved trips from localStorage on client mount
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

  // Save current trip to history
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTripPlan(null);

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setTripPlan(data.data);
      saveTripToHistory(data.data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateDay = async (dayNumber, currentTheme) => {
    setRegeneratingDay(dayNumber);
    try {
      const res = await fetch('/api/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripPlan.destination,
          dayNumber,
          currentTheme,
          budget: formData.budget,
          interests: formData.interests,
          language: formData.language,
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 md:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Top App Bar with Saved Trips Toggle */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full text-indigo-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI Travel Assistant
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition shadow-xs cursor-pointer"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Saved Plans</span>
            {savedTrips.length > 0 && (
              <span className="ml-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {savedTrips.length}
              </span>
            )}
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-10 print:hidden">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            Plan Your Next Adventure
          </h1>
          <p className="text-slate-600 mt-2 text-base md:text-lg">
            Personalized, weather-synced travel itineraries powered by Gemini AI.
          </p>
        </header>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-10 print:hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Destination */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  required
                  placeholder="e.g., Manali, Paris, Kyoto"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Number of Days */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Number of Days
                </label>
                <input
                  type="number"
                  name="days"
                  min="1"
                  max="14"
                  required
                  value={formData.days}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" /> Budget Level
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  <option value="Budget / Backpacker">Budget / Backpacker</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              {/* Travelers */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Travelers
                </label>
                <select
                  name="travelers"
                  value={formData.travelers}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  <option value="Solo / 1 Person">Solo (1 Person)</option>
                  <option value="Couple (2 People)">Couple (2 People)</option>
                  <option value="Family">Family</option>
                  <option value="Friends Group">Friends Group</option>
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-indigo-600" /> Itinerary Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Hinglish">Hinglish (Casual Hindi in English)</option>
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" /> Interests & Vibes
                </label>
                <input
                  type="text"
                  name="interests"
                  placeholder="e.g., Adventure, Cafes, Historical sites, Nightlife"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Itinerary with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Itinerary
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Generated Itinerary Section */}
        {tripPlan && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Itinerary
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" /> Save as PDF / Print
              </button>
            </div>

            {/* Trip Overview */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {tripPlan.destination}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                      <BookmarkCheck className="w-3 h-3" /> Auto-Saved
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium">{tripPlan.duration} Trip</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl print:bg-transparent print:border-none">
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Estimated Budget</p>
                  <p className="text-lg font-bold text-indigo-900">{tripPlan.estimatedCost}</p>
                </div>
              </div>
              <p className="mt-4 text-slate-600 leading-relaxed">{tripPlan.summary}</p>
            </div>

            {/* Weather Advisory Card */}
            {tripPlan.weather && (
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 rounded-2xl p-6 border border-sky-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-sky-600" /> Weather Advisory & Clothing Guide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-sky-100/60">
                    <p className="text-xs font-semibold text-sky-800 flex items-center gap-1.5 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-sky-600" /> Expected Temp
                    </p>
                    <p className="text-sm font-bold text-slate-800">{tripPlan.weather.temperature || 'Moderate'}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-sky-100/60">
                    <p className="text-xs font-semibold text-sky-800 flex items-center gap-1.5 mb-1">
                      <CloudSun className="w-3.5 h-3.5 text-sky-600" /> Conditions
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{tripPlan.weather.condition || 'Pleasant'}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-sky-100/60">
                    <p className="text-xs font-semibold text-sky-800 flex items-center gap-1.5 mb-1">
                      <Shirt className="w-3.5 h-3.5 text-sky-600" /> What to Wear
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{tripPlan.weather.clothingTip || 'Casual wear'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Local Safety & Scam Advisory Card */}
            {tripPlan.safetyAdvisory && (
              <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200/70 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-amber-200/50 pb-3">
                  <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" /> Local Safety & Scam Advisory
                  </h3>
                  {tripPlan.safetyAdvisory.emergencyContact && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-700" /> Emergency: {tripPlan.safetyAdvisory.emergencyContact}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-200/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Common Tourist Traps & Scams
                    </p>
                    <ul className="space-y-2">
                      {tripPlan.safetyAdvisory.commonScams?.map((scam, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{scam}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-200/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Safety Recommendations
                    </p>
                    <ul className="space-y-2">
                      {tripPlan.safetyAdvisory.safeTravelTips?.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Breakdown Visualizer */}
            {tripPlan.budgetBreakdown && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" /> Estimated Expense Breakdown
                </h3>
                
                <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden mb-6">
                  <div style={{ width: `${tripPlan.budgetBreakdown.stay?.percentage || 35}%` }} className="bg-blue-500" title="Stay" />
                  <div style={{ width: `${tripPlan.budgetBreakdown.food?.percentage || 25}%` }} className="bg-amber-500" title="Food" />
                  <div style={{ width: `${tripPlan.budgetBreakdown.transport?.percentage || 20}%` }} className="bg-emerald-500" title="Transport" />
                  <div style={{ width: `${tripPlan.budgetBreakdown.activities?.percentage || 20}%` }} className="bg-purple-500" title="Activities" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mb-1">
                      <Hotel className="w-3.5 h-3.5" /> Stay ({tripPlan.budgetBreakdown.stay?.percentage || 35}%)
                    </div>
                    <p className="text-sm font-bold text-blue-950">{tripPlan.budgetBreakdown.stay?.estimatedAmount || 'N/A'}</p>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs mb-1">
                      <Utensils className="w-3.5 h-3.5" /> Food ({tripPlan.budgetBreakdown.food?.percentage || 25}%)
                    </div>
                    <p className="text-sm font-bold text-amber-950">{tripPlan.budgetBreakdown.food?.estimatedAmount || 'N/A'}</p>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
                      <Car className="w-3.5 h-3.5" /> Transport ({tripPlan.budgetBreakdown.transport?.percentage || 20}%)
                    </div>
                    <p className="text-sm font-bold text-emerald-950">{tripPlan.budgetBreakdown.transport?.estimatedAmount || 'N/A'}</p>
                  </div>

                  <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs mb-1">
                      <Ticket className="w-3.5 h-3.5" /> Activities ({tripPlan.budgetBreakdown.activities?.percentage || 20}%)
                    </div>
                    <p className="text-sm font-bold text-purple-950">{tripPlan.budgetBreakdown.activities?.estimatedAmount || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Breakdown with Maps Links & Regenerate Button */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Daily Itinerary</h3>
              {tripPlan.dailyPlan?.map((item) => (
                <div key={item.day} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:border-slate-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg text-sm print:bg-slate-800">
                        Day {item.day}
                      </span>
                      <h4 className="font-semibold text-lg text-slate-800">{item.theme}</h4>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                      <button
                        onClick={() => handleRegenerateDay(item.day, item.theme)}
                        disabled={regeneratingDay === item.day}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        title="Generate alternative plan for this day"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${regeneratingDay === item.day ? 'animate-spin text-indigo-600' : ''}`} />
                        {regeneratingDay === item.day ? 'Updating...' : 'Regenerate Day'}
                      </button>
                      <a
                        href={getMapsUrl(item.theme, tripPlan.destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Explore in Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Morning */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                          <Sun className="w-4 h-4" /> Morning
                        </div>
                        <a
                          href={getMapsUrl(item.morning, tripPlan.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 print:hidden"
                          title="View on Map"
                        >
                          Map <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.morning}</p>
                    </div>

                    {/* Afternoon */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                          <Clock className="w-4 h-4" /> Afternoon
                        </div>
                        <a
                          href={getMapsUrl(item.afternoon, tripPlan.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 print:hidden"
                          title="View on Map"
                        >
                          Map <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.afternoon}</p>
                    </div>

                    {/* Evening */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                          <Sunset className="w-4 h-4" /> Evening
                        </div>
                        <a
                          href={getMapsUrl(item.evening, tripPlan.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 print:hidden"
                          title="View on Map"
                        >
                          Map <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.evening}</p>
                    </div>
                  </div>

                  {item.tips && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Tip:</strong> {item.tips}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Extras: Packing & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:border-slate-300">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Luggage className="w-5 h-5 text-indigo-600" /> Weather-Synced Packing
                </h4>
                <ul className="space-y-2">
                  {tripPlan.packingEssentials?.map((pack, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pack}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:border-slate-300">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600" /> Important Travel Tips
                </h4>
                <ul className="space-y-2">
                  {tripPlan.importantTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Trips Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-lg">Saved Trips History</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-3">
                {savedTrips.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No saved trips yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Generated plans will automatically appear here.</p>
                  </div>
                ) : (
                  savedTrips.map((saved) => (
                    <div
                      key={saved.id}
                      onClick={() => {
                        setTripPlan(saved);
                        setIsDrawerOpen(false);
                      }}
                      className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        tripPlan?.destination === saved.destination
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{saved.destination}</h4>
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {saved.duration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{saved.estimatedCost}</p>
                        <p className="text-[10px] text-slate-400">Created: {saved.savedAt}</p>
                      </div>

                      <button
                        onClick={(e) => deleteSavedTrip(saved.id, e)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete this saved plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {savedTrips.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (confirm('Clear all saved trips from history?')) {
                        setSavedTrips([]);
                        localStorage.removeItem('trip_planner_history');
                      }
                    }}
                    className="w-full py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition font-medium cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}