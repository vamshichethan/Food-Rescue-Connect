'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, ChevronDown, Activity } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hi there! I am your AI Logistics Copilot. I can help you find high-risk food listings, optimize routes, or answer food safety questions. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulated LLM Response engine (No API key needed)
    setTimeout(() => {
      let reply = "I've analyzed the network. Right now, route efficiency is at 94%.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('risk') || lower.includes('spoilage')) {
        reply = "⚠️ I detect 1 CRITICAL listing (L-8091: Baked Pastries) with an 82.4% spoilage risk. I recommend dispatching a volunteer immediately before it expires in 4 hours.";
      } else if (lower.includes('route') || lower.includes('map')) {
        reply = "Currently, the OSRM engine suggests the fastest route to 'Hope Shelter' takes 18 minutes (7.1 km) avoiding downtown traffic.";
      } else if (lower.includes('impact') || lower.includes('carbon')) {
        reply = "Great question! By recovering the 12.5 kg of food today, we are offsetting approximately 31.2 kg of CO2 equivalent emissions.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        reply = "Hello! Ready to coordinate some food rescues today?";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '320px',
          height: '450px',
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '16px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(139, 92, 246, 0.15)',
          overflow: 'hidden',
          transformOrigin: 'bottom right',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1))',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <Bot size={20} color="var(--primary)" />
                <span style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, backgroundColor: 'var(--success)', borderRadius: '50%', border: '2px solid #0a0a0f' }}></span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, color: '#fff' }}>Rescue Copilot AI</h4>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={10} color="var(--success)" /> Network Sync Active
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', marginLeft: '4px', marginRight: '4px' }}>
                  {msg.role === 'user' ? 'You' : 'Copilot'}
                </span>
                <div style={{
                  backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="dot-pulse" style={{ backgroundColor: 'var(--primary)', width: 6, height: 6 }}></span>
                <span className="dot-pulse" style={{ backgroundColor: 'var(--primary)', width: 6, height: 6, animationDelay: '0.2s' }}></span>
                <span className="dot-pulse" style={{ backgroundColor: 'var(--primary)', width: 6, height: 6, animationDelay: '0.4s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <input 
              type="text" 
              placeholder="Ask about risks, routes, impact..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 14px',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSend}
              style={{
                background: 'var(--primary)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(139,92,246,0.4)',
                opacity: input.trim() ? 1 : 0.5,
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} style={{ marginLeft: '-2px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          border: 'none',
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'transform 0.3s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
          float: 'right'
        }}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
