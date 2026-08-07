import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  Sparkles,
  ShieldCheck,
  Scale,
  Search,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Plug,
  ChevronRight,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { CATEGORIES } from '../data/categories';
import { ProductRepository } from '../repositories/productRepository';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCard } from '../components/product/ProductCard';

const emailSchema = z.string().email('Please enter a valid email address');

export const HomePage: React.FC = () => {
  useDocumentTitle(
    'Intelligent Technology Shopping',
    'Explore technology products, compare specifications, manage your shortlist, and prepare for AI-assisted product discovery.'
  );

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const featuredProducts = ProductRepository.getFeaturedProducts();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setEmailError(validation.error.errors[0].message);
      return;
    }

    setSubscribed(true);
    toast.success('Subscription confirmed! You will receive catalog integration alerts.');
    setEmail('');
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return Laptop;
      case 'Smartphone': return Smartphone;
      case 'Tablet': return Tablet;
      case 'Monitor': return Monitor;
      case 'Keyboard': return Keyboard;
      case 'Mouse': return Mouse;
      case 'Headphones': return Headphones;
      case 'Plug': default: return Plug;
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* A. HERO SECTION */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEFEC] border border-[#E5E5E2] text-xs font-semibold text-[#111111]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Intelligent shopping starts here</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.1] font-display">
              Find the right product, <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">not just more products.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#626262] max-w-xl leading-relaxed">
              Explore technology products, compare specifications, manage your shortlist, and prepare for AI-assisted product discovery.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/products"
                className="px-8 py-4 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB] transition-all duration-200 shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/ai-assistant"
                className="px-8 py-4 rounded-xl bg-white border border-[#E5E5E2] text-[#111111] text-sm font-semibold hover:bg-[#F7F7F5] hover:border-[#111111] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-[#2563EB]" />
                <span>Open AI Assistant</span>
              </Link>
            </div>

            {/* Subtext info */}
            <div className="pt-4 flex items-center gap-6 text-xs text-[#8A8A8A]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" /> Normalized Specs
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" /> Zero Hallucinations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" /> RAG Ready Architecture
              </span>
            </div>
          </div>

          {/* Right Hero Showcase Media Area (Abstract Tech Device Composition) */}
          <div className="lg:col-span-5 relative">
            <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-tr from-[#EFEFEC] via-white to-[#F7F7F5] border border-[#E5E5E2] shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden group">
              {/* Top Bar Mock */}
              <div className="flex items-center justify-between border-b border-[#E5E5E2] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E5E5E2]" />
                  <div className="w-3 h-3 rounded-full bg-[#E5E5E2]" />
                  <div className="w-3 h-3 rounded-full bg-[#E5E5E2]" />
                </div>
                <div className="text-[11px] font-mono text-[#8A8A8A] bg-white px-3 py-1 rounded-full border border-[#E5E5E2]">
                  ShopSmart Engine v2.0
                </div>
              </div>

              {/* Central Abstract Device Silhouette Composition */}
              <div className="my-6 relative flex items-center justify-center">
                {/* Abstract Glowing Backdrop */}
                <div className="absolute w-48 h-48 rounded-full bg-[#2563EB]/10 blur-2xl group-hover:bg-[#2563EB]/20 transition-all duration-700" />
                
                {/* Silhouette Glass Card */}
                <div className="relative z-10 w-full max-w-xs bg-white/90 backdrop-blur-md border border-[#E5E5E2] rounded-2xl p-5 shadow-lg space-y-4 transform group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#F7F7F5] to-[#EFEFEC] border border-[#E5E5E2] flex items-center justify-center">
                    <Laptop className="w-12 h-12 text-[#2563EB]/70 stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-[#111111]/80 rounded-full w-3/4" />
                    <div className="h-2 bg-[#8A8A8A]/40 rounded-full w-1/2" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E2]">
                    <div className="h-4 bg-[#2563EB]/80 rounded-md w-16" />
                    <div className="px-3 py-1 bg-[#111111] text-white rounded-lg text-[10px] font-bold">
                      Compare Specs
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Specs Strip */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E5E2] text-center text-[11px] text-[#626262]">
                <div className="p-2 rounded-xl bg-white/60 border border-[#E5E5E2]">
                  <span className="block font-bold text-[#111111]">100%</span> Verified Specs
                </div>
                <div className="p-2 rounded-xl bg-white/60 border border-[#E5E5E2]">
                  <span className="block font-bold text-[#111111]">Multi-Dim</span> Matrix
                </div>
                <div className="p-2 rounded-xl bg-white/60 border border-[#E5E5E2]">
                  <span className="block font-bold text-[#2563EB]">RAG</span> Queryable
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. TRUST STRIP */}
      <section className="py-8 px-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#2563EB]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111111]">Verified Catalog Structure</h4>
              <p className="text-xs text-[#626262] mt-0.5 leading-relaxed">
                Strict Zod schema validation ensures accurate product metadata.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#2563EB]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111111]">Intelligent Search-Ready</h4>
              <p className="text-xs text-[#626262] mt-0.5 leading-relaxed">
                Debounced multi-attribute tokenization across titles and specs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#2563EB]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111111]">Transparent Comparison</h4>
              <p className="text-xs text-[#626262] mt-0.5 leading-relaxed">
                Normalized specification union without fabricated values.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#15803D]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111111]">Secure Checkout Experience</h4>
              <p className="text-xs text-[#626262] mt-0.5 leading-relaxed">
                Client-side address & order validation with demo checkout safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* C. FEATURED CATEGORIES */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E2] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Browse Hardware
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight font-display mt-1">
              Featured Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-[#111111] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
          >
            View All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const IconComponent = getCategoryIcon(cat.iconName);
            return (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group p-6 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#111111] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] group-hover:bg-[#111111] group-hover:text-white flex items-center justify-center text-[#111111] transition-colors mb-4">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#2563EB] transition-colors font-display">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#626262] mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E5E2] flex items-center justify-between text-xs font-semibold text-[#8A8A8A] group-hover:text-[#111111]">
                  <span>Explore Series</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* D. FEATURED PRODUCTS SECTION */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E2] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Handpicked Hardware
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight font-display mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#111111] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
          >
            Explore Full Catalog <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            variant="catalog"
            actionLabel="View Integration Guide"
            actionHref="/products"
          />
        )}
      </section>

      {/* E. AI SHOPPING ASSISTANT PREVIEW */}
      <section className="relative rounded-3xl bg-[#0A0A0A] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#2563EB]/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F1F1F] border border-[#333333] text-xs font-semibold text-[#2563EB]">
            <Bot className="w-4 h-4" />
            <span>Next-Gen RAG Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight">
            Conversational discovery. <br />
            Powered by Retrieval-Augmented Generation.
          </h2>

          <p className="text-sm sm:text-base text-[#AAAAAA] leading-relaxed max-w-2xl">
            In Phase 2, our AI shopping assistant will query vector embeddings in ChromaDB to answer complex technical inquiries, recommend products within your budget, and explain differences between options.
          </p>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs font-medium text-[#D4D4D4]">
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> Budget-based discovery
            </div>
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> Multi-attribute product comparison
            </div>
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> Specification clarification
            </div>
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> Catalog-grounded responses
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] transition-colors shadow-lg"
            >
              <span>Launch AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* F. COMPARISON FEATURE HIGHLIGHT */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white border border-[#E5E5E2] shadow-xs space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Side-by-Side Matrix
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-display">
            Compare specs with total clarity.
          </h2>
          <p className="text-sm text-[#626262] leading-relaxed">
            Add up to 4 products to your comparison board. Our system dynamically merges specification keys without inventing missing values.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {['Price', 'Specifications', 'Warranty', 'Rating', 'Availability', 'Intended Use'].map(
            (spec) => (
              <div
                key={spec}
                className="p-4 rounded-xl bg-[#F7F7F5] border border-[#E5E5E2] space-y-1"
              >
                <div className="w-2 h-2 rounded-full bg-[#2563EB] mx-auto mb-2" />
                <span className="text-xs font-bold text-[#111111]">{spec}</span>
              </div>
            )
          )}
        </div>
      </section>

      {/* G. NEWSLETTER UPDATE SECTION */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#EFEFEC]/50 border border-[#E5E5E2] max-w-4xl mx-auto text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-[#111111] font-display">
            Stay updated on dataset releases
          </h3>
          <p className="text-sm text-[#626262]">
            Subscribe to receive notifications when Phase 2 real product catalog datasets are imported into ShopSmart AI.
          </p>
        </div>

        {subscribed ? (
          <div className="p-4 rounded-xl bg-[#15803D]/10 border border-[#15803D]/20 text-[#15803D] text-sm font-semibold max-w-md mx-auto">
            ✓ Subscription active! You will be notified on dataset updates.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#E5E5E2] text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </div>
            {emailError && (
              <p className="text-xs text-[#B91C1C] font-medium text-left">{emailError}</p>
            )}
          </form>
        )}
      </section>
    </div>
  );
};
