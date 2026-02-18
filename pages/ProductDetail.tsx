import React, { useEffect, useState } from 'react';
import { Product, Profile } from '../types';
import { api, getProductImageUrl } from '../api';
import { ProductCalculator } from '../components/ProductCalculator';
import { LazyImage } from '../components/LazyImage';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw, Heart, Share2, Info } from 'lucide-react';

interface ProductDetailProps {
   product: Product;
   userProfile: Profile | null;
   onAddToCart: (quantity: number, width?: number, height?: number, price?: number) => void;
   onNavigate: (page: string, product?: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, userProfile, onAddToCart, onNavigate }) => {
   const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
   const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');

   // Fetch similar products from Supabase based on category
   useEffect(() => {
      const fetchSimilar = async () => {
         if (!product) return;

         try {
            const all = await api.products.list();
            if (all) {
               const similar = all.filter((p: Product) =>
                  p.category_id === product.category_id && p.id !== product.id
               ).slice(0, 4);
               setSimilarProducts(similar);
            }
         } catch (err) {
            console.error('Error fetching similar', err);
         }
      };

      fetchSimilar();
      // Scroll to top when product changes
      window.scrollTo(0, 0);
   }, [product]);

   if (!product) return null;

   return (
      <div className="animate-fade-in bg-white">
         {/* Breadcrumb Header */}
         <div className="bg-gray-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
               <button
                  onClick={() => onNavigate('shop')}
                  className="text-xs uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-2 group transition-colors"
               >
                  <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Retour à la Collection
               </button>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

               {/* Left Column: Images (Sticky on Desktop) */}
               <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-6">
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative group shadow-sm">
                     <LazyImage
                        src={getProductImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                     />
                     <div className="absolute top-6 left-6 flex flex-col gap-2">
                        {product.stock < 10 && (
                           <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-md">
                              Dernières Pièces
                           </span>
                        )}
                        {product.is_customizable && (
                           <span className="bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-md">
                              Sur Mesure
                           </span>
                        )}
                     </div>
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="aspect-video bg-gray-100 overflow-hidden">
                        <LazyImage
                           src={getProductImageUrl(product.image_url)}
                           alt="Detail View"
                           className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                     </div>
                     <div className="bg-gray-50 flex items-center justify-center text-center p-8">
                        <div>
                           <ShieldCheck size={32} className="mx-auto text-gray-400 mb-3" strokeWidth={1.5} />
                           <h4 className="font-serif font-bold text-gray-900 mb-1">Qualité Garantie</h4>
                           <p className="text-xs text-gray-500">Verre haute résistance</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Column: Details & Calculator */}
               <div className="lg:col-span-5 reveal-on-scroll">

                  {/* Header Info */}
                  <div className="mb-8 border-b border-gray-100 pb-8">
                     <div className="flex justify-between items-start mb-4">
                        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">{product.name}</h1>
                        <button className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                           <Share2 size={20} />
                        </button>
                     </div>

                     <div className="flex items-center gap-6 mb-6">
                        <p className="text-3xl font-mono text-gray-900 font-medium">{product.price_per_m2} MAD<span className="text-sm text-gray-500 font-sans font-normal"> / m²</span></p>
                        <div className="flex text-yellow-500 text-xs items-center bg-yellow-50 px-3 py-1 rounded-full">
                           <Star fill="currentColor" size={12} />
                           <span className="text-gray-900 font-bold ml-1 mr-2">4.9</span>
                           <span className="text-gray-400 text-[10px] border-l border-yellow-200 pl-2">24 Avis</span>
                        </div>
                     </div>

                     <p className="text-gray-600 leading-relaxed font-light text-lg">
                        {product.description || "Verre architectural haut de gamme traité avec précision. Idéal pour les intérieurs modernes, offrant à la fois durabilité et clarté esthétique."}
                     </p>
                  </div>

                  {/* Calculator Section */}
                  <div className="mb-10 shadow-xl shadow-gray-100/50">
                     <ProductCalculator
                        product={product}
                        userProfile={userProfile}
                        onAddToCart={onAddToCart}
                     />
                  </div>

                  {/* Info Tabs */}
                  <div className="mb-12">
                     <div className="flex gap-8 mb-6 border-b border-gray-100">
                        {['desc', 'specs', 'shipping'].map(tab => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`text-xs uppercase tracking-widest pb-3 transition-all relative ${activeTab === tab ? 'text-black font-bold' : 'text-gray-400 hover:text-black'}`}
                           >
                              {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Spécifications' : 'Livraison'}
                              {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></span>}
                           </button>
                        ))}
                     </div>

                     <div className="text-sm text-gray-600 leading-relaxed animate-fade-in">
                        {activeTab === 'desc' && (
                           <div className="space-y-4">
                              <p>Fabriqué à la perfection, ce produit en verre offre une clarté et une résistance supérieures. Convient pour diverses applications, y compris les dessus de table, les fenêtres et les étagères.</p>
                              <p>Notre technologie de polissage des bords garantit la sécurité et une finition haut de gamme, tandis que le traitement thermique assure une durabilité à toute épreuve.</p>
                           </div>
                        )}
                        {activeTab === 'specs' && (
                           <div className="bg-gray-50 p-6">
                              <ul className="space-y-3">
                                 <li className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                                    <span className="text-gray-500">Épaisseur</span>
                                    <span className="font-mono font-medium text-black">{product.thickness}mm</span>
                                 </li>
                                 <li className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                                    <span className="text-gray-500">Type de Verre</span>
                                    <span className="font-medium text-black">{product.category_id === '1' ? 'Verre Trempé Sécurit' : 'Float Standard'}</span>
                                 </li>
                                 <li className="flex justify-between border-b border-gray-200 pb-2 border-dashed">
                                    <span className="text-gray-500">Finition Bords</span>
                                    <span className="font-medium text-black">Joint Plat Poli (JPP)</span>
                                 </li>
                                 <li className="flex justify-between pt-1">
                                    <span className="text-gray-500">Référence</span>
                                    <span className="font-mono text-xs text-gray-400">{product.id.split('-')[0].toUpperCase()}</span>
                                 </li>
                              </ul>
                           </div>
                        )}
                        {activeTab === 'shipping' && (
                           <div className="space-y-6">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Truck size={20} className="text-gray-900" />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Livraison Express</h4>
                                    <p className="text-xs text-gray-500">Livraison standard : 3-5 jours ouvrables. <br /> Les coupes sur mesure peuvent nécessiter 24-48 heures supplémentaires de traitement.</p>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck size={20} className="text-gray-900" />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Garantie Casse</h4>
                                    <p className="text-xs text-gray-500">Livraison garantie sans casse. Remplacement intégral et immédiat si endommagé pendant le transport.</p>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
                     <Info size={16} className="flex-shrink-0" />
                     <p>Besoin d'une forme complexe ou d'une installation ? Contactez notre support technique pour un devis personnalisé.</p>
                  </div>
               </div>
            </div>

            {/* Similar Products Section */}
            {similarProducts.length > 0 && (
               <div className="mt-32 border-t border-gray-200 pt-16 reveal-on-scroll">
                  <div className="flex justify-between items-end mb-12">
                     <h2 className="text-3xl font-serif text-gray-900">Vous Aimerez Aussi</h2>
                     <button onClick={() => onNavigate('shop')} className="hidden sm:block text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">Voir Tout</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                     {similarProducts.map((p, i) => (
                        <div
                           key={p.id}
                           className="group cursor-pointer"
                           onClick={() => onNavigate('product', p)}
                        >
                           <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative mb-4">
                              <LazyImage
                                 src={getProductImageUrl(p.image_url)}
                                 alt={p.name}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute bottom-0 left-0 w-full bg-white/95 py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center shadow-lg">
                                 <span className="text-xs uppercase font-bold tracking-wider">Voir le Produit</span>
                                 <ArrowRight size={14} />
                              </div>
                           </div>
                           <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">{p.name}</h3>
                           <p className="text-sm text-gray-500 font-mono mt-1">{p.price_per_m2} MAD</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};