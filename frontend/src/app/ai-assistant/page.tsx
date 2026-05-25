'use client';

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'ai', 
      text: 'Olá! Sou o **Co-Pilot Inteligente** do Contable. Analiso suas despesas, contas e metas para ajudar a otimizar sua vida financeira. \n\nPergunte-me coisas como: \n* *"Quanto eu gastei este mês?"*\n* *"Qual é o meu saldo de contas?"*\n* *"Como posso poupar dinheiro?"*'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.ai.askChat(textToSend);
      setMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Desculpe, tive um problema ao analisar seus dados. Tente novamente mais tarde.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Qual é o meu saldo total?',
    'Quanto eu gastei este mês?',
    'Dicas para economizar dinheiro',
    'Status da minha reserva de emergência'
  ];

  return (
    <DashboardLayout>
      <div className="h-[80vh] flex flex-col gap-6 animate-fade-in">
        {/* Header Pitch */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span>IA Co-Pilot Financeiro</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">Analise orçamentos e planeje seu futuro financeiro conversando</p>
          </div>
        </div>

        {/* Chat window panel */}
        <div className="flex-1 glass-panel rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative border-brand-500/10">
          {/* Scrollable messages container */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[80%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  m.sender === 'user' 
                    ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' 
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                }`}>
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed whitespace-pre-line border ${
                  m.sender === 'user' 
                    ? 'bg-brand-600/10 border-brand-500/20 text-white rounded-tr-none' 
                    : 'bg-white/5 border-white/5 text-gray-300 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 mr-auto items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-400 font-semibold italic">
                  <span>Analisando contas</span>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Quick prompt chips (only display when not loading) */}
          {!loading && messages.length < 5 && (
            <div className="flex flex-wrap gap-2 pb-4">
              {quickQuestions.map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="flex items-center gap-1 text-[10px] font-bold tracking-wide bg-white/5 hover:bg-brand-500/10 hover:text-brand-300 text-gray-400 border border-white/5 hover:border-brand-500/30 px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* User input box */}
          <div className="flex gap-3 border-t border-border pt-4 bg-black/10 rounded-2xl px-4 py-3 border border-white/5">
            <input 
              type="text" 
              placeholder="Pergunte ao Co-Pilot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
              className="flex-1 bg-transparent border-none text-xs font-semibold focus:outline-none text-white placeholder-gray-500"
            />
            <button 
              onClick={() => handleSendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center transition-all shadow-neon-brand disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
