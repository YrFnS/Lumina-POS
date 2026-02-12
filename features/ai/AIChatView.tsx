
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface AIChatViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ isOpen, onClose }) => {
  const { 
    lang, products, cart, salesHistory, customers, currentShift 
  } = useStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: lang === 'en' ? 'Hello. I am Lumina Intelligence. Ask me about your inventory, sales, or customers.' : 'مرحباً. أنا ذكاء لومينا. اسألني عن المخزون، المبيعات، أو العملاء.', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Construct the "Brain" of the POS
  const getSystemContext = () => {
    const now = new Date();
    
    // Simplify data to save tokens and focus on relevance
    const inventorySummary = products.map(p => 
      `- ${p.name} (SKU: ${p.sku}): Stock ${p.stock}, Price $${p.price}, Cost $${p.costPrice}`
    ).join('\n');

    const lowStock = products.filter(p => p.stock <= p.minStock).map(p => p.name).join(', ');

    const recentSales = salesHistory.slice(0, 5).map(o => 
      `- Order #${o.id.slice(-4)}: $${o.total.toFixed(2)} (${o.items.length} items) - Status: ${o.status}`
    ).join('\n');

    const currentCart = cart.length > 0 
      ? cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ') 
      : 'Empty';

    const shiftStatus = currentShift 
      ? `Open (Started: ${new Date(currentShift.openedAt).toLocaleTimeString()}, Expected Cash: $${currentShift.expectedCash.toFixed(2)})` 
      : 'Closed';

    return `
      You are Lumina, an advanced AI assistant integrated into a Point of Sale system.
      Current Date/Time: ${now.toLocaleString()}
      Language: ${lang === 'en' ? 'English' : 'Arabic'} (Respond in this language).

      REAL-TIME DATA CONTEXT:
      -----------------------
      SHIFT STATUS: ${shiftStatus}
      CURRENT CART: ${currentCart}
      
      INVENTORY SNAPSHOT:
      Low Stock Warnings: ${lowStock || 'None'}
      Product List (Partial):
      ${inventorySummary}

      RECENT SALES (Last 5):
      ${recentSales}

      CUSTOMERS: ${customers.length} registered.
      -----------------------

      INSTRUCTIONS:
      1. Be concise. Use a professional, slightly robotic "avant-garde" tone.
      2. If asked about revenue/profit, calculate it based on the provided data.
      3. If the user asks to perform an action (like "add to cart"), explain that you cannot physically control the UI yet, but guide them on how to do it.
      4. If data is missing, admit it. Do not hallucinate inventory.
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize client lazily to prevent crash if key is missing on startup
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
        throw new Error("System Error: API_KEY is missing. Please rename 'GEMINI_API_KEY' to 'API_KEY' in your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = getSystemContext();
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            ...messages.filter(m => m.id !== 'welcome').map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            })),
            { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2, // Low temperature for factual data
        }
      });

      const text = response.text;
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: text || 'System Error.', timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      const errorText = error.message || 'Connection to Intelligence Core failed.';
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: errorText, timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={`fixed inset-y-0 md:left-16 left-0 z-20 w-full md:w-[400px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col font-sans
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-gray-50/50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lumina-500 flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Lumina Intelligence</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500"
        >
          <X size={16} />
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1
              ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-800 text-gray-600' : 'bg-lumina-100 text-lumina-700 dark:bg-lumina-900/20 dark:text-lumina-400'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`
              max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-black rounded-tr-none' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-lumina-100 dark:bg-lumina-900/20 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin text-lumina-600" />
             </div>
             <div className="text-xs text-gray-400 flex items-center h-8">Computing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input */}
      <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sales, stock..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lumina-500 focus:border-transparent text-sm font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-lumina-500 text-white rounded-lg hover:bg-lumina-600 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="text-[10px] text-center text-gray-400 mt-2 flex justify-center items-center gap-1">
           <Sparkles size={8} /> Powered by Gemini 3.0 Flash
        </div>
      </div>
    </div>
  );
};
