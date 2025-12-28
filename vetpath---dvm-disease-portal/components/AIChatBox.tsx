import React, { useState, useRef, useEffect } from 'react';
import { Message, sendMessageToGroq } from '../services/chatService';
import { Send, X, MessageSquare, Loader, User, Bot, Minimize2, Maximize2 } from 'lucide-react';

const AIChatBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await sendMessageToGroq([...messages, userMessage]);
            const assistantMessage: Message = { role: 'assistant', content: aiResponse };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl transition-all hover:scale-110 z-[100] flex items-center justify-center group"
                title="AI Assistant"
            >
                <MessageSquare size={24} />
                <span className="absolute right-full mr-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Chat with AI Assistant
                </span>
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] flex flex-col transition-all duration-300 overflow-hidden ${isMinimized ? 'h-14' : 'h-[500px]'}`}
        >
            {/* Header */}
            <div className="p-4 bg-teal-600 text-white flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Bot size={18} />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Vatpath AI Assistant <p style={{ fontSize: '8px' }}>@Developed By Naim Hossain</p></span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 px-4">
                                <Bot size={40} className="text-teal-600" />
                                <p className="text-sm text-slate-500 font-medium">
                                    Hello! I'm your Veterinary AI Assistant. How can I help you today?
                                </p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`mt-1 p-1 rounded-full ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-teal-50 dark:bg-teal-900/30'}`}>
                                        {msg.role === 'user' ? <User size={12} className="text-slate-500" /> : <Bot size={12} className="text-teal-600" />}
                                    </div>
                                    <div
                                        className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-teal-600 text-white rounded-tr-none'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="mt-1 p-1 rounded-full bg-teal-50 dark:bg-teal-900/30">
                                        <Bot size={12} className="text-teal-600" />
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-tl-none flex items-center gap-2">
                                        <Loader size={14} className="animate-spin" />
                                        <span className="text-xs">AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:text-white transition-all"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 text-white rounded-xl transition-all flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default AIChatBox;
