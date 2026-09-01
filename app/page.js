'use client';

import { useState } from 'react';
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
  PieChart
} from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    destination: '',
    days: '3',
    budget: 'Moderate',
    travelers: '1 Person',
    interests: 'Sightseeing, Local Food, Photography'
  });

  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 md:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Header - Hidden on Print */}
        <header className="text-center mb-10 print:hidden">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full text-indigo-700 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" /> AI Travel Assistant
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            Plan Your Next Adventure
          </h1>
          <p className="text-slate-600 mt-2 text-base md:text-lg">
            Personalized, day-by-day travel itineraries powered by Gemini AI.
          </p>
        </header>

        {/* Form Card - Hidden on Print */}
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
            {/* Actions Bar (Print & Copy) */}
            <div className="flex items-center justify-end gap-3 print:hidden">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer shadow-sm"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" /> Save as PDF / Print
              </button>
            </div>

            {/* Trip Overview */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {tripPlan.destination}
                  </h2>
                  <p className="text-slate-500 font-medium">{tripPlan.duration} Trip</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl print:bg-transparent print:border-none">
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Estimated Budget</p>
                  <p className="text-lg font-bold text-indigo-900">{tripPlan.estimatedCost}</p>
                </div>
              </div>
              <p className="mt-4 text-slate-600 leading-relaxed">{tripPlan.summary}</p>
            </div>

            {/* Budget Breakdown Visualizer */}
            {tripPlan.budgetBreakdown && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" /> Estimated Expense Breakdown
                </h3>
                
                {/* Visual Multi-color Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden mb-6">
                  <div style={{ width: `${tripPlan.budgetBreakdown.stay?.percentage || 35}%` }} className="bg-blue-500" title="Stay" />
                  <div style={{ width: `${tripPlan.budgetBreakdown.food?.percentage || 25}%` }} className="bg-amber-500" title="Food" />
                  <div style={{ width: `${tripPlan.budgetBreakdown.transport?.percentage || 20}%` }} className="bg-emerald-500" title="Transport" />
                  <div style={{ width: `${tripPlan.budgetBreakdown.activities?.percentage || 20}%` }} className="bg-purple-500" title="Activities" />
                </div>

                {/* 4 Category Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Stay */}
                  <div className="bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mb-1">
                      <Hotel className="w-3.5 h-3.5" /> Stay ({tripPlan.budgetBreakdown.stay?.percentage || 35}%)
                    </div>
                    <p className="text-sm font-bold text-blue-950">{tripPlan.budgetBreakdown.stay?.estimatedAmount || 'N/A'}</p>
                  </div>

                  {/* Food */}
                  <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs mb-1">
                      <Utensils className="w-3.5 h-3.5" /> Food ({tripPlan.budgetBreakdown.food?.percentage || 25}%)
                    </div>
                    <p className="text-sm font-bold text-amber-950">{tripPlan.budgetBreakdown.food?.estimatedAmount || 'N/A'}</p>
                  </div>

                  {/* Transport */}
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs mb-1">
                      <Car className="w-3.5 h-3.5" /> Transport ({tripPlan.budgetBreakdown.transport?.percentage || 20}%)
                    </div>
                    <p className="text-sm font-bold text-emerald-950">{tripPlan.budgetBreakdown.transport?.estimatedAmount || 'N/A'}</p>
                  </div>

                  {/* Activities */}
                  <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl">
                    <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs mb-1">
                      <Ticket className="w-3.5 h-3.5" /> Activities ({tripPlan.budgetBreakdown.activities?.percentage || 20}%)
                    </div>
                    <p className="text-sm font-bold text-purple-950">{tripPlan.budgetBreakdown.activities?.estimatedAmount || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Breakdown */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Daily Itinerary</h3>
              {tripPlan.dailyPlan?.map((item) => (
                <div key={item.day} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:border-slate-300">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                    <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg text-sm print:bg-slate-800">
                      Day {item.day}
                    </span>
                    <h4 className="font-semibold text-lg text-slate-800">{item.theme}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Morning */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                        <Sun className="w-4 h-4" /> Morning
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.morning}</p>
                    </div>

                    {/* Afternoon */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                        <Clock className="w-4 h-4" /> Afternoon
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.afternoon}</p>
                    </div>

                    {/* Evening */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                        <Sunset className="w-4 h-4" /> Evening
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
              {/* Packing Essentials */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm print:border-slate-300">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Luggage className="w-5 h-5 text-indigo-600" /> Packing Essentials
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

              {/* Travel Tips */}
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
    </main>
  );
}