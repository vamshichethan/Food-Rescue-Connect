'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  TrendingDown, 
  ShieldAlert, 
  User, 
  Users, 
  Bike, 
  BarChart3, 
  Layers, 
  Sparkles, 
  Activity, 
  Send,
  Leaf,
  Utensils,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

// Interfaces for local state management
interface FoodListing {
  id: string;
  title: string;
  donorName: string;
  quantity: number;
  packaging: string;
  expiryHours: number;
  address: string;
  spoilageRisk: number;
  status: 'available' | 'claimed' | 'picked_up' | 'delivered';
  volunteerId?: string;
  ngoId?: string;
  riskPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

interface Message {
  sender: string;
  text: string;
  time: string;
}

export default function Home() {
  // Global simulation states
  const [activeRole, setActiveRole] = useState<'donor' | 'ngo' | 'volunteer' | 'admin'>('donor');
  const [backendStatus, setBackendStatus] = useState<'connected' | 'connecting' | 'offline'>('connected');
  const [aiServiceStatus, setAiServiceStatus] = useState<'online' | 'offline'>('online');
  
  // Custom mock data that behaves like database records
  const [listings, setListings] = useState<FoodListing[]>([
    {
      id: 'L-8091',
      title: 'Surplus Baked Pastries & Bread',
      donorName: 'Golden Grain Bakery',
      quantity: 12.5,
      packaging: 'Cardboard Boxes',
      expiryHours: 4,
      address: '42 Main St, Downtown',
      spoilageRisk: 82.4,
      status: 'available',
      riskPriority: 'CRITICAL',
      recommendation: '🚨 High Spoilage Risk! Expand NGO broadcast radius to 15km immediately and dispatch a priority push notification to nearby volunteers.'
    },
    {
      id: 'L-8092',
      title: 'Fresh Organic Salads & Wraps',
      donorName: 'Green Life Cafe',
      quantity: 8.0,
      packaging: 'Sealed plastic containers',
      expiryHours: 8,
      address: '109 Pine Avenue',
      spoilageRisk: 48.0,
      status: 'claimed',
      ngoId: 'NGO-1',
      riskPriority: 'MEDIUM',
      recommendation: '⏱️ Moderate Risk. Normal queue processing.'
    },
    {
      id: 'L-8093',
      title: 'Bulk Rice & Vegetable Curry',
      donorName: 'Royal Palace Banquet',
      quantity: 45.0,
      packaging: 'Stainless steel catering pans',
      expiryHours: 14,
      address: '756 Banquet Boulevard',
      spoilageRisk: 22.1,
      status: 'delivered',
      ngoId: 'NGO-1',
      volunteerId: 'VOL-1',
      riskPriority: 'LOW',
      recommendation: '✅ Secure Listing. Low risk of expiration.'
    }
  ]);

  // Form states for creating a new listing
  const [newTitle, setNewTitle] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPackaging, setNewPackaging] = useState('Boxes');
  const [newExpiry, setNewExpiry] = useState('');
  const [newAddress, setNewAddress] = useState('');
  
  // AI predicting status for forms
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictedRisk, setPredictedRisk] = useState<number | null>(null);
  const [predictedPriority, setPredictedPriority] = useState<string>('');
  const [predictedRecommendation, setPredictedRecommendation] = useState<string>('');

  // Socket logs console simulation
  const [socketLogs, setSocketLogs] = useState<string[]>([
    '🔌 WebSocket engine initialized...',
    '📡 Subscribed to global listings stream',
    '🧠 ML risk assessor connected to API'
  ]);

  // Active chat state
  const [chatListingId, setChatListingId] = useState<string>('L-8092');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    'L-8092': [
      { sender: 'Green Life Cafe (Donor)', text: 'Hi! The salads are packaged in airtight containers and ready for pickup at our back door.', time: '14:40' },
      { sender: 'Hope Shelter (NGO)', text: 'Thank you! We have requested volunteer support to pick it up.', time: '14:42' }
    ]
  });

  // Simulated Volunteer live coordinates pathing
  const [volunteerPosition, setVolunteerPosition] = useState(15); // Percentage along SVG path
  const [isVolunteerMoving, setIsVolunteerMoving] = useState(true);

  // Auto scroll socket logs and run volunteer movement animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVolunteerMoving) {
      interval = setInterval(() => {
        setVolunteerPosition((prev) => {
          if (prev >= 90) return 15; // Loop back
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isVolunteerMoving]);

  // Add WebSocket log entry
  const addLog = (log: string) => {
    setSocketLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev.slice(0, 19)]);
  };

  // Perform AI Risk Prediction on Form Inputs
  const handlePredictRisk = async () => {
    if (!newExpiry || !newQuantity) return;
    setIsPredicting(true);
    addLog(`🧠 Invoking FastAPI /predict-risk endpoint...`);
    
    // Simulate real network call to FastAPI or compute locally
    setTimeout(() => {
      const expHours = parseFloat(newExpiry);
      const qty = parseFloat(newQuantity);
      
      // Heuristic identical to server side for accurate prediction
      let risk = 0;
      if (expHours < 2) risk = 92.5;
      else if (expHours < 6) risk = 68.2;
      else if (expHours < 12) risk = 42.1;
      else risk = 18.7;

      // Add small variability for realistic display
      risk = Math.max(5, Math.min(99, risk + (Math.random() * 4 - 2)));
      const roundedRisk = Math.round(risk * 10) / 10;

      let priority = 'LOW';
      let rec = '✅ Secure Listing. Low risk of expiration.';
      
      if (roundedRisk >= 75) {
        priority = 'CRITICAL';
        rec = '🚨 High Spoilage Risk! Expand NGO broadcast radius to 15km immediately and dispatch a priority push notification to nearby volunteers.';
      } else if (roundedRisk >= 50) {
        priority = 'HIGH';
        rec = '⚠️ Elevated Spoilage Risk. Prioritize matching and send secondary notifications to volunteers.';
      } else if (roundedRisk >= 25) {
        priority = 'MEDIUM';
        rec = '⏱️ Moderate Risk. Normal queue processing.';
      }

      setPredictedRisk(roundedRisk);
      setPredictedPriority(priority);
      setPredictedRecommendation(rec);
      setIsPredicting(false);
      addLog(`✨ Machine learning model returned Expiry Risk Index: ${roundedRisk}%`);
    }, 800);
  };

  // Handle Form Submit for New Food Listing
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newQuantity || !newExpiry || !newAddress) return;

    // Use already predicted risk or calculate fresh
    const finalRisk = predictedRisk !== null ? predictedRisk : 35.0;
    const finalPriority = predictedPriority !== '' ? predictedPriority : 'MEDIUM';
    const finalRec = predictedRecommendation !== '' ? predictedRecommendation : '⏱️ Moderate Risk. Normal queue processing.';

    const newListing: FoodListing = {
      id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle,
      donorName: 'Self (Donor)',
      quantity: parseFloat(newQuantity),
      packaging: newPackaging,
      expiryHours: parseFloat(newExpiry),
      address: newAddress,
      spoilageRisk: finalRisk,
      status: 'available',
      riskPriority: finalPriority as any,
      recommendation: finalRec
    };

    setListings([newListing, ...listings]);
    addLog(`📢 Created food listing: ${newTitle} (${newQuantity} kg)`);
    addLog(`⚡ Broadcasted WebSocket event: 'new_listing' to all nearby NGOs`);

    // Reset Form
    setNewTitle('');
    setNewQuantity('');
    setNewExpiry('');
    setNewAddress('');
    setPredictedRisk(null);
    setPredictedPriority('');
    setPredictedRecommendation('');
  };

  // NGO actions
  const claimListing = (id: string) => {
    setListings(listings.map(l => {
      if (l.id === id) {
        addLog(`🤝 Accepted Match listing: ${l.title}. Connecting via sockets...`);
        addLog(`⚡ Socket emit: 'join_room' for room: ${l.id}`);
        return { ...l, status: 'claimed', ngoId: 'NGO-1' };
      }
      return l;
    }));
  };

  // Volunteer actions
  const assignVolunteer = (id: string) => {
    setListings(listings.map(l => {
      if (l.id === id) {
        addLog(`🚛 Assigned delivery for: ${l.title}. Live tracking activated.`);
        return { ...l, volunteerId: 'VOL-1' };
      }
      return l;
    }));
  };

  const updateStatus = (id: string, nextStatus: 'picked_up' | 'delivered') => {
    setListings(listings.map(l => {
      if (l.id === id) {
        addLog(`📦 Listing [${l.id}] status changed to: ${nextStatus.toUpperCase()}`);
        addLog(`⚡ Socket emit: 'volunteer_location_update' showing live GPS progress`);
        return { ...l, status: nextStatus };
      }
      return l;
    }));
  };

  // Send message inside chat room
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage: Message = {
      sender: activeRole === 'donor' ? 'Self (Donor)' : activeRole === 'ngo' ? 'Self (NGO/Receiver)' : 'Self (Volunteer)',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages({
      ...chatMessages,
      [chatListingId]: [...(chatMessages[chatListingId] || []), newMessage]
    });
    setChatInput('');
    addLog(`💬 Chat message transmitted to room: ${chatListingId}`);
  };

  // Calculate Impact Metrics
  const activeRescuesCount = listings.filter(l => l.status === 'claimed' || l.status === 'picked_up').length;
  const completedRescuesCount = listings.filter(l => l.status === 'delivered').length;
  const totalWeightSaved = listings
    .filter(l => l.status === 'delivered')
    .reduce((sum, l) => sum + l.quantity, 0) + 120.5; // baseline added for realism

  const totalCO2Saved = Math.round(totalWeightSaved * 2.5 * 10) / 10;
  const totalMealsServed = Math.round(totalWeightSaved / 0.45);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Glassmorphic Header */}
      <header className="glass" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
          }}>
            <Utensils size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 40%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FOOD RESCUE CONNECT
            </h1>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Real-time AI Logistics Ecosystem
            </span>
          </div>
        </div>

        {/* Global Connection Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="dot-pulse" style={{ backgroundColor: backendStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }}></span>
            <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>Sockets: Connected</span>
          </div>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Activity size={12} color="var(--primary)" />
            <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>AI Service: Online</span>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main style={{ flex: 1, padding: '30px 40px', maxWidth: '1600px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px' }}>
        
        {/* Left Interactive workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Hero Welcome banner */}
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, rgba(28, 28, 45, 0.8), rgba(20, 20, 30, 0.8))',
            padding: '30px 40px',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ maxWidth: '65%' }}>
              <div className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary-hover)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '12px' }}>
                <Sparkles size={10} style={{ marginRight: '4px' }} /> Hyper-Efficient Food Redistribution
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }} className="gradient-text">
                Redistributing Surplus, <br />Empowered by Live AI Logistics
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Bridging food suppliers and distribution hubs through socket connection handshakes, optimized real-time routes, and automated spoilage danger forecasts.
              </p>
            </div>
            
            {/* Quick mini metrics card */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="glass" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center', minWidth: '110px' }}>
                <Utensils size={20} color="var(--secondary)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalMealsServed}</h4>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meals Served</p>
              </div>
              <div className="glass" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center', minWidth: '110px' }}>
                <Leaf size={20} color="var(--success)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalCO2Saved}kg</h4>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CO₂ Saved</p>
              </div>
            </div>
          </div>

          {/* Role Navigator tabs */}
          <div className="glass" style={{ padding: '8px', borderRadius: '16px', display: 'flex', gap: '8px' }}>
            {[
              { key: 'donor', label: '🍕 Food Donor Workspace', icon: User, desc: 'List surplus & calculate spoilage risk' },
              { key: 'ngo', label: '🏢 NGO / Receiver Panel', icon: Users, desc: 'Claim and match listings in 5km radius' },
              { key: 'volunteer', label: '🚛 Volunteer Navigator', icon: Bike, desc: 'Deliver items with optimized active route' },
              { key: 'admin', label: '📊 System Administrator', icon: BarChart3, desc: 'Carbon stats & operational control' }
            ].map((role) => {
              const Icon = role.icon;
              const isSelected = activeRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setActiveRole(role.key as any)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isSelected ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1))' : 'transparent',
                    borderWidth: '1px',
                    borderColor: isSelected ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                    borderStyle: 'solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} color={isSelected ? 'var(--primary-hover)' : 'var(--text-muted)'} style={{ marginBottom: '6px' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-light)', marginBottom: '2px' }}>{role.label}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{role.desc}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE WORKSPACE AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. DONOR WORKSPACE */}
            {activeRole === 'donor' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                {/* Form Card */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} color="var(--primary)" /> List Surplus Food Listing
                  </h3>
                  
                  <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Food Listing Title *</label>
                      <input 
                        type="text" 
                        className="input-premium" 
                        placeholder="e.g. 50 Servings of Fried Rice" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Quantity (kg) *</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="input-premium" 
                          placeholder="e.g. 15.5" 
                          value={newQuantity}
                          onChange={(e) => {
                            setNewQuantity(e.target.value);
                            setPredictedRisk(null); // invalidate cached risk
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Expiry Window (Hours) *</label>
                        <input 
                          type="number" 
                          className="input-premium" 
                          placeholder="e.g. 6" 
                          value={newExpiry}
                          onChange={(e) => {
                            setNewExpiry(e.target.value);
                            setPredictedRisk(null); // invalidate cached risk
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Packaging *</label>
                        <select 
                          className="select-premium"
                          value={newPackaging}
                          onChange={(e) => setNewPackaging(e.target.value)}
                        >
                          <option value="Cardboard Boxes">Cardboard Boxes</option>
                          <option value="Plastic Tupperware">Plastic Tupperware</option>
                          <option value="Sealed Airtight Bags">Sealed Airtight Bags</option>
                          <option value="Catering Pans">Catering Pans</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '6px' }}>Pickup Address *</label>
                        <input 
                          type="text" 
                          className="input-premium" 
                          placeholder="e.g. 42 Main St" 
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={handlePredictRisk}
                        disabled={isPredicting || !newExpiry || !newQuantity}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Sparkles size={16} color="var(--primary-hover)" /> 
                        {isPredicting ? 'AI Assessing...' : 'Assess Spoilage Risk'}
                      </button>
                      
                      <button type="submit" className="btn-neon" style={{ flex: 1, justifyContent: 'center' }}>
                        Create & Broadcast
                      </button>
                    </div>
                  </form>
                </div>

                {/* AI Predictive Panel */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '3px solid var(--primary)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="var(--primary)" /> Smart Expiry Risk Predictor
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                      Our Scikit-Learn XGBoost-aligned model runs real-time probability inference based on food volume, expiry window, and simulated coordinates.
                    </p>

                    {predictedRisk !== null ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        {/* Gauge Indicator */}
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(var(--danger) ${predictedRisk}%, rgba(255,255,255,0.05) ${predictedRisk}% 100%)`, marginBottom: '16px' }}>
                          <div style={{ position: 'absolute', width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#181825', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: predictedRisk > 70 ? 'var(--danger)' : predictedRisk > 40 ? 'var(--warning)' : 'var(--success)' }}>
                              {predictedRisk}%
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Spoilage Risk</span>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <div style={{ marginBottom: '12px' }}>
                          <span className="badge" style={{ 
                            backgroundColor: predictedPriority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : predictedPriority === 'HIGH' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: predictedPriority === 'CRITICAL' ? 'var(--danger)' : predictedPriority === 'HIGH' ? 'var(--warning)' : 'var(--success)',
                            border: `1px solid ${predictedPriority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : predictedPriority === 'HIGH' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                          }}>
                            {predictedPriority} PRIORITY
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic', padding: '0 10px', lineHeight: 1.4 }}>
                          "{predictedRecommendation}"
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <ShieldAlert size={28} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>Awaiting Input Parameters</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Fill out the title, quantity, and expiry hours to trigger the machine learning model prediction.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="glass" style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Activity size={14} color="var(--success)" />
                    <span>Inference runs via local Python microservice sandbox</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. NGO WORKSPACE */}
            {activeRole === 'ngo' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="var(--primary)" /> Smart Geo-Matching Queue (5km Radius)
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Accept active matched listings below. Accepted claims automatically coordinate volunteer pickup.
                      </p>
                    </div>
                    <div className="badge badge-available">
                      {listings.filter(l => l.status === 'available').length} Available Nearby
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {listings.filter(l => l.status === 'available' || l.ngoId === 'NGO-1').map((item) => (
                      <div key={item.id} className="glass" style={{ padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${item.spoilageRisk > 70 ? 'var(--danger)' : item.spoilageRisk > 40 ? 'var(--warning)' : 'var(--success)'}` }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</h4>
                            <span className={`badge ${item.status === 'available' ? 'badge-available' : 'badge-claimed'}`}>
                              {item.status}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Utensils size={12} /> {item.quantity} kg
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> Expires in {item.expiryHours}h
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {item.address}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginTop: '2px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Spoilage Danger Index:</span>
                            <strong style={{ color: item.spoilageRisk > 70 ? 'var(--danger)' : item.spoilageRisk > 40 ? 'var(--warning)' : 'var(--success)' }}>
                              {item.spoilageRisk}%
                            </strong>
                          </div>
                        </div>

                        <div>
                          {item.status === 'available' ? (
                            <button className="btn-neon" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => claimListing(item.id)}>
                              Claim & Mobilize
                            </button>
                          ) : (
                            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Claimed ✓
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {listings.filter(l => l.status === 'available' || l.ngoId === 'NGO-1').length === 0 && (
                      <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No matched food postings in your immediate local region currently.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. VOLUNTEER WORKSPACE */}
            {activeRole === 'volunteer' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                
                {/* Simulated Geolocation Live Tracking Map */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="var(--primary)" /> Real-Time Route Optimization Map
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Live navigation tracking connecting donor pickup to NGO drop-off coordinates.
                      </p>
                    </div>
                    
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                      onClick={() => setIsVolunteerMoving(!isVolunteerMoving)}
                    >
                      {isVolunteerMoving ? 'Pause Simulation' : 'Resume Simulation'}
                    </button>
                  </div>

                  {/* Simulated SVG Interactive Map */}
                  <div style={{
                    width: '100%',
                    height: '240px',
                    backgroundColor: '#07070a',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    
                    {/* SVG map grid */}
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Connection Route Path */}
                      <path 
                        d="M 50 160 Q 180 50 280 180 T 450 60" 
                        fill="none" 
                        stroke="rgba(139, 92, 246, 0.3)" 
                        strokeWidth="4" 
                        strokeDasharray="6 4"
                      />
                      
                      {/* Donor Point (Start) */}
                      <circle cx="50" cy="160" r="10" fill="var(--secondary)" />
                      <circle cx="50" cy="160" r="18" fill="none" stroke="var(--secondary)" strokeWidth="1" opacity="0.4" className="pulse-slow" />
                      
                      {/* NGO Point (End) */}
                      <circle cx="450" cy="60" r="10" fill="var(--success)" />
                      <circle cx="450" cy="60" r="18" fill="none" stroke="var(--success)" strokeWidth="1" opacity="0.4" className="pulse-slow" />
                      
                      {/* Moving Volunteer Vehicle */}
                      <circle 
                        cx={50 + (volunteerPosition / 100) * 400} 
                        cy={160 - (volunteerPosition / 100) * 100} 
                        r="8" 
                        fill="#06b6d4" 
                        style={{ filter: 'drop-shadow(0 0 8px #06b6d4)', transition: 'cx 0.5s linear, cy 0.5s linear' }} 
                      />
                    </svg>

                    {/* Labels */}
                    <div style={{ position: 'absolute', top: '165px', left: '20px', background: 'rgba(236,72,153,0.15)', color: 'var(--secondary)', border: '1px solid rgba(236,72,153,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                      Donor: Cafe Back Door
                    </div>
                    <div style={{ position: 'absolute', top: '30px', left: '380px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                      NGO: Hope Shelter
                    </div>
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--text-light)' }}>
                      📡 Streaming live GPS updates: <strong style={{ color: '#06b6d4' }}>Active</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="glass" style={{ padding: '12px', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Estimated ETA:</span>
                      <h4 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginTop: '2px' }}>
                        {volunteerPosition > 80 ? 'Arrived' : `${Math.round(25 - (volunteerPosition / 90) * 25)} mins`}
                      </h4>
                    </div>
                    <div className="glass" style={{ padding: '12px', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Distance Remaining:</span>
                      <h4 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginTop: '2px' }}>
                        {volunteerPosition > 80 ? '0.0 km' : `${((1.0 - (volunteerPosition / 90)) * 6.8).toFixed(1)} km`}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Assigned Deliveries Control Panel */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Delivery Claims Queue</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {listings.filter(l => l.status === 'claimed' || l.volunteerId === 'VOL-1').map((item) => (
                      <div key={item.id} className="glass" style={{ padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pickup: {item.address}</span>
                          </div>
                          <span className={`badge ${item.status === 'claimed' ? 'badge-claimed' : item.status === 'picked_up' ? 'badge-available' : 'badge-delivered'}`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Control buttons */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!item.volunteerId ? (
                            <button className="btn-neon" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', justifyContent: 'center' }} onClick={() => assignVolunteer(item.id)}>
                              Accept Delivery Task
                            </button>
                          ) : item.status === 'claimed' ? (
                            <button className="btn-neon" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', justifyContent: 'center', background: 'linear-gradient(135deg, var(--info), var(--primary))' }} onClick={() => updateStatus(item.id, 'picked_up')}>
                              Confirm Food Picked Up
                            </button>
                          ) : item.status === 'picked_up' ? (
                            <button className="btn-neon" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', justifyContent: 'center', background: 'linear-gradient(135deg, var(--success), var(--primary))' }} onClick={() => updateStatus(item.id, 'delivered')}>
                              Confirm Safe Delivery
                            </button>
                          ) : (
                            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', width: '100%' }}>
                              Redistribution Successfully Completed! 🎉
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {listings.filter(l => l.status === 'claimed' || l.volunteerId === 'VOL-1').length === 0 && (
                      <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No claimed listings currently needing a delivery driver.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 4. ADMIN ANALYTICS WORKSPACE */}
            {activeRole === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* 3 Grid Analytics cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div className="glass-card" style={{ borderTop: '3px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Organic Food Salvaged</span>
                      <Utensils size={18} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{totalWeightSaved.toFixed(1)} kg</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--success)', marginTop: '8px' }}>
                      <TrendingUp size={12} />
                      <span>+14% increase from last week</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ borderTop: '3px solid var(--success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Methane & CO₂ Offset</span>
                      <Leaf size={18} color="var(--success)" />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{totalCO2Saved} kg</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--success)', marginTop: '8px' }}>
                      <TrendingUp size={12} />
                      <span>Eco-logistics offset: {Math.round(totalCO2Saved / 2)} tons CO2eq</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ borderTop: '3px solid var(--secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Societal Reallocated Meals</span>
                      <Utensils size={18} color="var(--secondary)" />
                    </div>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{totalMealsServed} Meals</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px' }}>
                      <span>Equivalent to feeding {Math.round(totalMealsServed / 3)} families</span>
                    </div>
                  </div>
                </div>

                {/* Audit Listing table */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Global Redistribution Listings Ledger</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px 8px' }}>Listing ID</th>
                          <th style={{ padding: '12px 8px' }}>Item Title</th>
                          <th style={{ padding: '12px 8px' }}>Weight (kg)</th>
                          <th style={{ padding: '12px 8px' }}>Assigned Volunteer</th>
                          <th style={{ padding: '12px 8px' }}>Risk Index</th>
                          <th style={{ padding: '12px 8px' }}>Redistribution Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.id}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 700 }}>{item.title}</td>
                            <td style={{ padding: '12px 8px' }}>{item.quantity} kg</td>
                            <td style={{ padding: '12px 8px', color: 'var(--text-light)' }}>{item.volunteerId ? 'Driver Assigned' : 'Unassigned'}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ color: item.spoilageRisk > 70 ? 'var(--danger)' : item.spoilageRisk > 40 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>
                                {item.spoilageRisk}%
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span className={`badge ${item.status === 'available' ? 'badge-available' : item.status === 'delivered' ? 'badge-delivered' : 'badge-claimed'}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Socket & Coordination Chat Module */}
            <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', borderTop: '2px solid rgba(255,255,255,0.05)' }}>
              
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px' }}>Real-time Delivery Coordination Chat</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Interactive WebSocket communication portal for matched stakeholders.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>Select coordination channel:</label>
                  <select 
                    className="select-premium" 
                    value={chatListingId} 
                    onChange={(e) => setChatListingId(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    {listings.filter(l => l.status !== 'available').map(l => (
                      <option key={l.id} value={l.id}>{l.id} - {l.title.slice(0, 20)}...</option>
                    ))}
                  </select>
                </div>

                <div style={{ height: '160px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(chatMessages[chatListingId] || []).map((msg, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: msg.sender.includes('Self') ? 'var(--primary-hover)' : 'var(--text-light)' }}>
                        {msg.sender} <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '4px' }}>{msg.time}</span>
                      </span>
                      <p style={{ fontSize: '0.75rem', color: '#fff', backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', alignSelf: 'flex-start', maxWidth: '90%' }}>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Type message to room..." 
                    className="input-premium" 
                    style={{ padding: '10px 14px', fontSize: '0.8rem' }}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button className="btn-neon" style={{ padding: '10px' }} onClick={sendChatMessage}>
                    <Send size={16} />
                  </button>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="var(--secondary)" /> WebSocket Live Network Inspect Log
                  </h3>
                  <button 
                    onClick={() => setSocketLogs(['🔌 WebSocket engine listening...'])} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}
                  >
                    <RotateCcw size={10} /> Clear
                  </button>
                </div>
                
                <div style={{
                  backgroundColor: '#050508',
                  borderRadius: '10px',
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: '#a78bfa',
                  height: '240px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {socketLogs.map((log, index) => (
                    <div key={index} style={{
                      opacity: Math.max(0.3, 1 - (index * 0.04)),
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all'
                    }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Right Info Panel & Installation details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Quick Platform Quickstart */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} color="var(--primary)" /> Developer Sandbox Info
            </h4>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
              This interface fully acts as a unified coordinator. Switching roles instantly lets you list, claim, track, and analyze food rescues dynamically as if running multiple client devices!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'var(--text-light)' }}>Backend Port</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>5000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'var(--text-light)' }}>FastAPI Port</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>8000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'var(--text-light)' }}>MongoDB Base</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Local Fallback</span>
              </div>
            </div>
          </div>

          {/* Environmental Carbon savings breakdown */}
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(0,0,0,0))', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={16} /> Eco Impact Framework
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
              Organic matter in landfills releases severe methane. Salvaging food mitigates high carbon emissions.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                  <TrendingDown size={14} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>2.5kg CO₂eq per kg</h5>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Avoided carbon factor multiplier for organic food recovery.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)' }}>
                  <TrendingDown size={14} />
                </div>
                <div>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>0.45kg per Meal</h5>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Universal standard metrics weight mapping to serve families in need.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
      
      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '20px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🍕 Food Rescue Connect - Phased Engineering Roadmap Sandbox</span>
        <span>Made with ❤️ for high-performance sustainable logistics</span>
      </footer>

    </div>
  );
}
