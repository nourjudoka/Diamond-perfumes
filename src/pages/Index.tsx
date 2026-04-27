import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { PromoStrip } from '@/components/Buy2Get1Promo';
import { useProducts } from '@/hooks/useProducts';
import { useActiveDiscounts } from '@/hooks/useDiscounts';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Star, ChevronDown, FlaskConical } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";



export default function HomePage() {
  const { data: products = [] } = useProducts();
  const { data: discounts = [] } = useActiveDiscounts();
  const { data: storeSettings } = useStoreSettings();
  const websiteOffers = discounts.filter((d) => !d.code);
  const bestSellers = products.filter(p => p.is_best_seller);
  const testers = products.filter(p => p.product_type === 'Tester');
  const isPromoEnabled = storeSettings?.promo_buy2get1_enabled ?? true;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {websiteOffers.length > 0 && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4 overflow-x-auto">
            {websiteOffers.map((d) => (
              <div key={d.id} className="flex items-center gap-2 shrink-0">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] uppercase tracking-[0.2em] font-sans text-primary font-semibold">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPromoEnabled && (
        <PromoStrip />
      )}

      {/* Ultra-Luxury Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative min-h-[85vh] flex items-center justify-center bg-black overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center bg-no-repeat opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/60 pointer-events-none" />
        <div className="text-center px-4 relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.9 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
            className="mb-12 flex flex-col items-center"
          >
            <img src="/diamond-logo.png" alt="Diamond Scent Studio Logo" className="w-[280px] md:w-[400px] h-auto mx-auto object-contain drop-shadow-2xl brightness-110 contrast-125" />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 1.0, ease: "easeOut" }}
              style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              className="mt-6 text-xl md:text-3xl tracking-[0.25em] uppercase text-[#D4AF37] drop-shadow-[0_0_18px_rgba(212,175,55,0.55)]"
            >
              More than perfume, it is you
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' })}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-sans">Discover</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col items-center justify-center mb-16 text-center">
              <Star className="h-6 w-6 text-primary mb-4" />
              <h2 className="font-serif text-4xl md:text-5xl mb-4">Best Sellers</h2>
              <p className="text-sm tracking-[0.1em] text-muted-foreground uppercase font-sans">Our Most Celebrated Masterpieces</p>
            </div>
            <Carousel
              plugins={[
                Autoplay({
                  delay: 1500,
                  stopOnInteraction: false,
                }),
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-[100vw]"
            >
              <CarouselContent className="-ml-4 md:-ml-8">
                {bestSellers.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 md:pl-8 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                 <CarouselPrevious className="left-0 xl:-left-12 border-primary/20 hover:bg-primary/20 hover:text-primary transition-colors" />
                 <CarouselNext className="right-0 xl:-right-12 border-primary/20 hover:bg-primary/20 hover:text-primary transition-colors" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      {/* Tester Collection Section */}
      {testers.length > 0 && (
        <section className="py-24 md:py-32 bg-black border-t border-white/10">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col items-center justify-center mb-16 text-center">
              <FlaskConical className="h-6 w-6 text-[#D4AF37] mb-4" />
              <h2 className="font-serif text-4xl md:text-5xl mb-4 text-white tracking-widest uppercase">Tester Collection</h2>
              <p className="text-sm tracking-[0.15em] text-white/50 uppercase font-sans">Authentic Fragrances · Unboxed · Full Size</p>
            </div>
            <Carousel
              plugins={[
                Autoplay({
                  delay: 2000,
                  stopOnInteraction: false,
                }),
              ]}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-[100vw]"
            >
              <CarouselContent className="-ml-4 md:-ml-8">
                {testers.map((product) => (
                  <CarouselItem key={product.id} className="pl-4 md:pl-8 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <ProductCard product={product} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-0 xl:-left-12 border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors" />
                <CarouselNext className="right-0 xl:-right-12 border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors" />
              </div>
            </Carousel>
            <div className="flex justify-center mt-12">
              <Link
                to="/shop?type=Tester"
                onClick={() => window.scrollTo({ top: 0 })}
                className="inline-flex items-center gap-3 px-10 py-3 border border-[#D4AF37]/50 text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-sans hover:bg-[#D4AF37]/10 transition-colors"
              >
                View All Testers <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Explore Collection CTA */}
      <section className="py-24 md:py-32 bg-secondary/30 border-t border-border/30 text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl flex flex-col items-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Choose From Our Collection</h2>
          <p className="text-sm tracking-[0.1em] text-muted-foreground uppercase font-sans mb-10 leading-relaxed">
            Discover our entire range of exceptional designer fragrances, carefully curated for those who demand the absolute best.
          </p>
          <Link to="/shop" onClick={() => window.scrollTo({ top: 0 })} className="btn-luxury inline-flex items-center gap-3 px-12 py-4 shadow-xl hover:-translate-y-1 transition-all">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
