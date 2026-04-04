import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useActiveDiscounts } from '@/hooks/useDiscounts';
import { motion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';

const brands = ['Tom Ford', 'Chanel', 'Dior', 'Guerlain', 'Creed', 'YSL'];

export default function HomePage() {
  const { data: products = [] } = useProducts();
  const { data: discounts = [] } = useActiveDiscounts();
  const websiteOffers = discounts.filter((d) => !d.code);
  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen">
      <Navbar />
      {websiteOffers.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 overflow-x-auto">
            {websiteOffers.map((d) => (
              <div key={d.id} className="flex items-center gap-1.5 shrink-0">
                <Tag className="h-3 w-3 text-primary" />
                <span className="text-xs font-sans text-primary font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="relative h-[80vh] flex items-center justify-center bg-gradient-to-b from-background/60 via-background to-background">
        <div className="text-center px-4">
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs tracking-[0.4em] uppercase text-muted-foreground font-sans mb-4">Premium Fragrance House</motion.p>
          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
            className="font-serif text-5xl md:text-7xl mb-6 leading-tight">Diamond<br />Perfume</motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-sm text-muted-foreground max-w-md mx-auto mb-8 font-sans leading-relaxed">
            Curated collection of the world's finest fragrances.
          </motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
            <Link to="/shop" className="btn-luxury inline-flex items-center gap-2">Explore Collection <ArrowRight className="h-4 w-4" /></Link>
          </motion.div>
        </div>
      </motion.section>
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {brands.map((b) => (
              <Link key={b} to="/shop" className="text-sm md:text-base tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors font-sans">{b}</Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-heading">Featured</h2>
              <p className="text-sm text-muted-foreground font-sans mt-1">Our most coveted fragrances</p>
            </div>
            <Link to="/shop" className="text-xs uppercase tracking-[0.2em] hover:text-primary transition-colors font-sans flex items-center gap-2">View All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featured.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">The Art of Scent</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8 font-sans leading-relaxed">Every fragrance in our collection is handpicked for its exceptional quality.</p>
          <Link to="/shop" className="btn-luxury inline-block">Shop Now</Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
