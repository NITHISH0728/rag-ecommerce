import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Trash2,
  AlertCircle,
  Info,
  Database,
  Sparkles,
  Bookmark,
  GitCompare,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { askAssistantStream, clearConversation, type ChatStreamEvent, type RecommendedProduct, type ProductCitation } from '../services/assistantService';
import { useCartStore } from '../stores/useCartStore';
import { useWishlistStore } from '../stores/useWishlistStore';
import { useCompareStore } from '../stores/useCompareStore';

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isServiceUnavailable?: boolean;
  citations?: ProductCitation[];
  products?: RecommendedProduct[];
  grounded?: boolean;
  retrievalStatus?: string;
}

export const AIAssistantPage: React.FC = () => {
  useDocumentTitle('AI Shopping Assistant', 'Conversational technology product discovery.');

  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const navigate = useNavigate();

  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const compareStore = useCompareStore();

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Welcome to ShopSmart AI. I am your RAG-powered shopping assistant. Ask me questions about technology products, and I will recommend options grounded strictly in our catalog.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
      products: [],
      grounded: true,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrievalStatusMsg, setRetrievalStatusMsg] = useState<string | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, retrievalStatusMsg]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    // Create abort controller for request cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);
    setRetrievalStatusMsg('Analyzing query constraints...');

    // Placeholder assistant message for streaming tokens
    const assistantMsgId = `assistant-${Date.now()}`;
    let streamedText = '';
    let citations: ProductCitation[] = [];
    let products: RecommendedProduct[] = [];
    let isGrounded = true;
    let retrievalStatus = 'success';

    try {
      await askAssistantStream(
        {
          message: textToSend.trim(),
          conversation_id: conversationId || undefined,
        },
        (event: ChatStreamEvent) => {
          switch (event.event) {
            case 'retrieval_started':
              setRetrievalStatusMsg('Searching product vector index...');
              break;
            case 'filters_applied':
              setRetrievalStatusMsg(`Applied catalog filters: ${JSON.stringify(event.data)}`);
              break;
            case 'products_retrieved':
              setRetrievalStatusMsg(`Found ${event.data.count} matching products. Ranking results...`);
              break;
            case 'generation_started':
              setRetrievalStatusMsg(null);
              // Initialize streaming message block
              setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== assistantMsgId);
                return [
                  ...filtered,
                  {
                    id: assistantMsgId,
                    sender: 'assistant',
                    content: '',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    citations: [],
                    products: [],
                    grounded: true,
                  },
                ];
              });
              break;
            case 'token':
              streamedText += event.data.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: streamedText }
                    : m
                )
              );
              break;
            case 'citations':
              citations = event.data.citations;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, citations } : m
                )
              );
              break;
            case 'products':
              products = event.data.products;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, products } : m
                )
              );
              break;
            case 'completed':
              isGrounded = event.data.grounded;
              if (event.data.conversation_id) {
                setConversationId(event.data.conversation_id);
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, grounded: isGrounded, retrievalStatus }
                    : m
                )
              );
              setRetrievalStatusMsg(null);
              break;
            case 'error':
              retrievalStatus = 'failed';
              setRetrievalStatusMsg(null);
              throw new Error(event.data.message || 'Stream processing failure.');
          }
        },
        controller.signal
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.info('Generation cancelled by user.');
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== assistantMsgId),
          {
            id: `cancelled-${Date.now()}`,
            sender: 'assistant',
            content: 'Response generation was cancelled by the user.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations: [],
            products: [],
            grounded: false,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== assistantMsgId),
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            content: `AI Service is degraded: ${err.message || 'Connecting to Groq RAG pipeline failed.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isServiceUnavailable: true,
          },
        ]);
      }
    } finally {
      setLoading(false);
      setRetrievalStatusMsg(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearConversation = async () => {
    if (conversationId) {
      try {
        await clearConversation(conversationId);
      } catch (e) {
        console.error(e);
      }
    }
    setConversationId(null);
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content:
          'Welcome to ShopSmart AI. I am your RAG-powered shopping assistant. Ask me questions about technology products, and I will recommend options grounded strictly in our catalog.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [],
        products: [],
        grounded: true,
      },
    ]);
  };

  const handleCitationClick = (productId: string) => {
    setHighlightedCardId(productId);
    
    // Scroll highlighted card into view
    const ref = cardRefs.current[productId];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedCardId((current) => current === productId ? null : current);
    }, 3000);
  };

  const formatTextWithCitations = (text: string, citations: ProductCitation[]) => {
    // Regex matches [P1], [P2] etc.
    const parts = text.split(/(\[P\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[P(\d+)\]/);
      if (match) {
        const label = `P${match[1]}`;
        const citation = citations.find((c) => c.citation_id === label);
        if (citation) {
          return (
            <button
              key={i}
              onClick={() => handleCitationClick(citation.product_id)}
              className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 rounded bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-bold border border-[#2563EB]/20 hover:bg-[#2563EB] hover:text-white transition-colors cursor-pointer"
              title={`View catalog detail for ${citation.product_name}`}
            >
              {label}
            </button>
          );
        }
      }
      return part;
    });
  };

  const suggestedQueries = [
    'Find a laptop suitable for coding under ₹60,000',
    'Recommend a phone with strong battery life',
    'Show wireless keyboards for typing',
    'Compare top two laptop models',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
            <Bot className="w-4 h-4" /> RAG Discovery Assistant
          </span>
          <h1 className="text-2xl font-extrabold text-[#111111] font-display mt-0.5">
            Conversational Shopping Interface
          </h1>
        </div>

        <button
          onClick={handleClearConversation}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E2] text-xs font-semibold text-[#8A8A8A] hover:text-[#111111] hover:bg-[#F7F7F5] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* RAG Status Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#0A0A0A] text-white border border-[#262626] flex items-start gap-3 shadow-md">
        <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>Grounded Retrieval-Augmented Generation</span>
            <span className="px-2 py-0.5 rounded bg-[#2563EB] text-white text-[10px]">
              Live ChromaDB + Groq Pipeline
            </span>
          </div>
          <p className="text-[#AAAAAA] leading-relaxed">
            All shopping answers and product pricing are strictly resolved server-side from verified catalog dataset files. halluncinated listings are filtered out dynamically during generation check phases.
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="rounded-3xl border border-[#E5E5E2] bg-white shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#111111] text-white rounded-br-none'
                    : 'bg-[#F7F7F5] text-[#111111] border border-[#E5E5E2] rounded-bl-none'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E2] pb-2 mb-2">
                    <span className="font-bold font-display text-[11px] text-[#2563EB] flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" /> ShopSmart Assistant
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.grounded && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Grounded
                        </span>
                      )}
                      <span className="text-[10px] text-[#8A8A8A]">{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-line">
                  {msg.sender === 'assistant' && msg.citations
                    ? formatTextWithCitations(msg.content, msg.citations)
                    : msg.content}
                </div>

                {/* Citation manifest list */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E5E2] text-[10px] text-[#8A8A8A] space-y-1">
                    <span className="font-bold uppercase tracking-wider block text-[9px] text-[#555555]">Citations & Retrieval Sources:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {msg.citations.map((c) => (
                        <button
                          key={c.citation_id}
                          onClick={() => handleCitationClick(c.product_id)}
                          className="flex items-center gap-1.5 hover:text-[#111111] transition-colors text-left cursor-pointer"
                        >
                          <Database className="w-3 h-3 text-[#2563EB]" />
                          <span>[{c.citation_id}] {c.product_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Product Cards Grid */}
                {msg.products && msg.products.length > 0 && (
                  <div className="pt-3 border-t border-[#E5E5E2] space-y-2">
                    <span className="font-bold uppercase tracking-wider block text-[9px] text-[#555555] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#2563EB]" /> Grounded Recommendations:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {msg.products.map((p) => {
                        const isHighlighted = highlightedCardId === p.product_id;
                        const inWishlist = wishlistStore.isInWishlist(p.product_id);
                        const inCompare = compareStore.isInCompare(p.product_id);
                        
                        return (
                          <div
                            key={p.product_id}
                            ref={(el) => { cardRefs.current[p.product_id] = el; }}
                            className={`rounded-xl border bg-white p-3 space-y-2.5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                              isHighlighted
                                ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md scale-[1.01]'
                                : 'border-[#E5E5E2] hover:border-[#111111] shadow-xs'
                            }`}
                          >
                            <div className="flex gap-2">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-14 h-14 rounded-lg object-cover border border-[#E5E5E2] bg-[#FAF9F6] shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://placehold.co/100x100?text=Tech';
                                }}
                              />
                              <div className="min-w-0 space-y-0.5">
                                <span className="text-[9px] font-bold text-[#8A8A8A] uppercase tracking-wider">
                                  {p.brand}
                                </span>
                                <h4 className="text-xs font-bold text-[#111111] truncate leading-tight">
                                  {p.name}
                                </h4>
                                <div className="text-[11px] font-extrabold text-[#111111]">
                                  ₹{p.price.toLocaleString('en-IN')}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px]">
                                  <span className="text-amber-500 font-bold">★ {p.rating}</span>
                                  <span className={`px-1.5 py-0.2 rounded-full font-semibold ${
                                    p.stock_status === 'in_stock'
                                      ? 'bg-emerald-500/10 text-emerald-600'
                                      : p.stock_status === 'low_stock'
                                      ? 'bg-amber-500/10 text-amber-600'
                                      : 'bg-rose-500/10 text-rose-600'
                                  }`}>
                                    {p.stock_status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-[10px] text-[#626262] bg-[#F7F7F5] rounded-lg p-2 leading-relaxed">
                              {p.reason}
                            </p>

                            <div className="flex items-center gap-1.5 pt-1 border-t border-[#F0F0EE]">
                              <button
                                onClick={() => navigate(`/products/${p.product_id}`)}
                                className="flex-1 py-1.5 rounded-lg bg-[#111111] text-white text-[10px] font-bold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                View Product <ArrowRight className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={() => cartStore.addToCart(p.product_id, 1)}
                                disabled={p.stock_status === 'out_of_stock'}
                                className="p-1.5 rounded-lg border border-[#E5E5E2] hover:border-[#111111] hover:bg-[#F7F7F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                title="Add to Bag"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-[#111111]" />
                              </button>

                              <button
                                onClick={() => wishlistStore.toggleWishlist(p.product_id)}
                                className="p-1.5 rounded-lg border border-[#E5E5E2] hover:border-[#111111] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${inWishlist ? 'fill-[#2563EB] text-[#2563EB]' : 'text-[#111111]'}`} />
                              </button>

                              <button
                                onClick={() => compareStore.toggleCompare(p.product_id)}
                                className="p-1.5 rounded-lg border border-[#E5E5E2] hover:border-[#111111] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                                title="Compare Product"
                              >
                                <GitCompare className={`w-3.5 h-3.5 ${inCompare ? 'text-[#2563EB]' : 'text-[#111111]'}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {msg.isServiceUnavailable && (
                  <div className="p-3 rounded-xl bg-white border border-[#E5E5E2] text-xs text-[#626262] space-y-1">
                    <div className="font-bold text-[#B45309] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Backend Service Status
                    </div>
                    <p className="text-[11px] text-[#8A8A8A]">
                      The AI Assistant service is degraded. Product catalogs can still be searched and compared normally from direct grids.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {retrievalStatusMsg && (
            <div className="flex flex-col items-start space-y-1.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-[10px] font-bold text-[#2563EB]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {retrievalStatusMsg}
              </div>
            </div>
          )}

          {loading && !retrievalStatusMsg && (
            <div className="flex flex-col items-start">
              <div className="bg-[#F7F7F5] border border-[#E5E5E2] rounded-2xl rounded-bl-none p-4 max-w-[85%] space-y-2 animate-pulse">
                <div className="h-3 bg-[#E5E5E2] rounded-full w-48" />
                <div className="h-3 bg-[#E5E5E2] rounded-full w-32" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-6 py-3 bg-[#FAF9F6] border-t border-[#E5E5E2] overflow-x-auto flex items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider shrink-0">
            Suggested Queries:
          </span>
          {suggestedQueries.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full bg-white border border-[#E5E5E2] text-[11px] font-medium text-[#111111] hover:bg-[#111111] hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-[#E5E5E2] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI about laptops, budget comparison, specs..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
          />
          
          {loading && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Stop
            </button>
          )}

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="px-5 py-3 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2563EB] disabled:bg-[#E5E5E2] disabled:text-[#8A8A8A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
