import React, { useEffect, useState } from 'react';
import { getProductImageUrl } from '../api';
import { Product } from '../types';
import { Truck, ShieldCheck, MessageCircle, Package, Heart, Star, Loader2, RefreshCw } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

interface HomeProps {
   onNavigate: (page: string, product?: Product) => void;
   toggleFavorite: (id: string) => void;
   favorites: string[];
   products: Product[];
   loading: boolean;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, toggleFavorite, favorites, products = [], loading }) => {
   const featuredProducts = Array.isArray(products) ? products.slice(0, 4) : [];
   const error = null;

   return (
      <div className="animate-fade-in">
         {/* Hero Section - Centered */}
         <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden mb-12">
            {/* Background */}
            <div className="absolute inset-0">
               <img
                  src="https://images.unsplash.com/photo-1620416265040-cc777cad1883?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="w-full h-full object-cover animate-reveal"
                  alt="Hero Background"
                  loading="eager"
               />
               <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Hero Content - Centered Alignment */}
            <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center sm:px-6 lg:px-8">
               <div className="max-w-4xl pt-20">
                  <p className="text-white/90 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
                     Profitez de la livraison gratuite pour toute commande de plus de 1000 MAD !
                  </p>
                  <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-[1.1] animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s' }}>
                     Une Approche <br />
                     Tranquille de la <br />
                     Décoration
                  </h1>
                  <div className="animate-fade-in-up opacity-0 flex flex-col items-center" style={{ animationDelay: '0.5s' }}>
                     <p className="text-white/80 text-lg md:text-xl font-light mb-10 max-w-lg leading-relaxed mx-auto">
                        Où la beauté est intentionnelle et chaque pièce raconte une histoire.
                     </p>
                     <button
                        onClick={() => onNavigate('shop')}
                        className="bg-transparent border border-white text-white px-8 py-4 text-xs uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300"
                     >
                        Découvrir la Collection
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Promo Grid Section */}
         <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Creative Interiors */}
               <div className="relative h-[600px] group overflow-hidden cursor-pointer" onClick={() => onNavigate('shop')}>
                  <LazyImage src="https://images.unsplash.com/photo-1585128719715-46776b56a0d1?auto=format&fit=crop&q=80&w=800" priority className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Creative Interiors" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                  <div className="absolute top-12 left-12 right-12 text-center">
                     <h3 className="text-white text-4xl font-serif mb-4">Intérieurs Créatifs<br />Pour Chaque Ambiance</h3>
                     <p className="text-white/90 uppercase tracking-wider text-sm mb-6">Nouvelle Collection - 2025</p>
                     <button className="bg-white text-black px-6 py-2 text-xs uppercase font-bold tracking-wider hover:bg-gray-100">Voir la Collection</button>
                  </div>
               </div>

               <div className="flex flex-col gap-8">
                  {/* Luxury Living */}
                  <div className="flex-1 relative bg-[#2a2a2a] flex items-center justify-between p-12 overflow-hidden group cursor-pointer" onClick={() => onNavigate('shop')}>
                     <div className="z-10 relative">
                        <h3 className="text-white text-3xl font-serif mb-4">Le Luxe,<br />Redéfini</h3>
                        <button className="bg-white text-black px-6 py-2 text-xs uppercase font-bold tracking-wider hover:bg-gray-100">Voir Détails</button>
                     </div>
                     <img src="https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&q=80&w=400" className="absolute right-0 top-0 bottom-0 w-1/2 object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 mask-image-gradient" alt="Luxury Living" />
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-8">
                     {/* Clearance */}
                     <div className="relative bg-[#d4a373] flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-[#c69466] transition-colors" onClick={() => onNavigate('shop')}>
                        <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center text-white mb-4">
                           <span className="text-xl font-serif">%</span>
                        </div>
                        <h3 className="text-white text-xl font-serif mb-2">Déstockage</h3>
                        <p className="text-white/80 text-sm mb-4">pour cette saison festive</p>
                        <button className="bg-white text-[#d4a373] px-4 py-2 text-[10px] uppercase font-bold tracking-wider">Parcourir</button>
                     </div>

                     {/* Timeless Interiors */}
                     <div className="relative group overflow-hidden cursor-pointer bg-gray-200" onClick={() => onNavigate('shop')}>
                        <LazyImage src="https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Timeless Interiors" />
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-8 left-8">
                           <h3 className="text-white text-xl font-serif mb-2">Intérieurs<br />Intemporels</h3>
                           <p className="text-white/90 text-sm">Économisez 30%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Special Products (Real API Data) */}
         <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-serif text-gray-900 mb-4">Produits Spéciaux</h2>
               <p className="text-gray-500">Ajoutez nos nouveautés à votre sélection.</p>
               <div className="flex justify-center gap-4 mt-8">
                  {['Nouveautés', 'Meilleures Ventes', 'En Vedette'].map((tab, i) => (
                     <button key={tab} className={`px-6 py-2 text-sm uppercase tracking-widest transition-colors ${i === 0 ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                        {tab}
                     </button>
                  ))}
               </div>
            </div>

            {loading ? (
               // Skeleton Loader
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="animate-pulse">
                        <div className="aspect-[1/1] bg-gray-200 mb-4"></div>
                        <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 w-1/4"></div>
                     </div>
                  ))}
               </div>
            ) : error ? (
               <div className="text-center py-12 bg-red-50 rounded-lg">
                  <p className="text-red-500 font-medium mb-4">{error}</p>
                  <button
                     onClick={() => window.location.reload()}
                     className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                  >
                     <RefreshCw size={16} /> Réessayer
                  </button>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {featuredProducts.length > 0 ? featuredProducts.map(product => (
                     <div key={product.id} className="group relative" onClick={() => onNavigate('product', product)}>
                        <div className="relative aspect-[1/1] bg-gray-100 overflow-hidden mb-4 cursor-pointer">
                           <LazyImage
                              src={getProductImageUrl(product.image_url)}
                              alt={product.name}
                              priority
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 grayscale-[10%]"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                           <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                              className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10"
                           >
                              <Heart size={16} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"} />
                           </button>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-gray-600">
                           {product.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                           <p className="text-sm text-gray-500 font-mono">{product.price_per_m2} MAD/m²</p>
                           <div className="flex text-gray-900 text-xs gap-0.5">
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                              <Star size={12} fill="currentColor" />
                           </div>
                        </div>
                     </div>
                  )) : (
                     <div className="col-span-4 text-center py-12">
                        <p className="text-gray-500">Aucun produit en vedette pour le moment.</p>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Natural Beauty Banner */}
         <div className="relative py-32 bg-fixed bg-cover bg-center my-16" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000")' }}>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 flex items-center justify-center text-center">
               <div className="max-w-xl text-white">
                  <h2 className="text-5xl font-serif mb-6 leading-tight">Révélez Votre<br />Beauté Naturelle</h2>
                  <p className="text-lg opacity-90 mb-8 font-light">
                     Nous appartenons à quelque chose de beau. Découvrez nos solutions en verre écologique.
                  </p>
                  <button onClick={() => onNavigate('shop')} className="bg-[#d4a373] text-white px-8 py-3 uppercase tracking-widest text-sm hover:bg-[#c69466] transition-colors">
                     Acheter Maintenant
                  </button>
               </div>
            </div>
         </div>

         {/* Latest News */}
         <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-serif text-gray-900 mb-4">Dernières Actualités</h2>
               <p className="text-gray-500">Ajoutez nos nouveautés à votre sélection hebdomadaire.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { date: "15 Avril 2025", title: "Transformez votre salon avec du verre", img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600" },
                  { date: "20 Mai 2025", title: "Tendances d'éclairage moderne", img: "https://images.unsplash.com/photo-1513506003011-38f45e86c459?auto=format&fit=crop&q=80&w=600" },
                  { date: "28 Juin 2025", title: "Améliorez votre chambre avec des miroirs", img: "https://images.unsplash.com/photo-1595876686616-e4905d549706?auto=format&fit=crop&q=80&w=600" },
               ].map((post, i) => (
                  <div key={i} className="group cursor-pointer">
                     <div className="overflow-hidden mb-6 h-64">
                        <LazyImage src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                     </div>
                     <div className="text-xs text-gray-400 mb-2 uppercase tracking-widest">{post.date}</div>
                     <h3 className="text-xl font-serif text-gray-900 mb-3 group-hover:text-[#d4a373] transition-colors">{post.title}</h3>
                     <p className="text-gray-500 text-sm mb-4 line-clamp-2">Découvrez des produits d'intérieur qui ajoutent chaleur et sophistication instantanément. Créez une atmosphère relaxante avec de belles solutions d'éclairage.</p>
                     <button className="text-xs uppercase font-bold tracking-widest border-b border-black pb-1 group-hover:border-[#d4a373] group-hover:text-[#d4a373] transition-colors">Lire Plus</button>
                  </div>
               ))}
            </div>
         </div>

         {/* Service Highlights */}
         <div className="bg-[#f9f9f9] py-16">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                  { icon: Truck, title: "Livraison Gratuite", desc: "Partout au Maroc" },
                  { icon: ShieldCheck, title: "Paiement Sécurisé", desc: "Sans Tracas" },
                  { icon: MessageCircle, title: "Support en Ligne", desc: "24/7 Disponible" },
                  { icon: Package, title: "Grandes Économies", desc: "Articles Exclusifs" },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
                     <item.icon size={40} className="text-gray-900" strokeWidth={1.5} />
                     <div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};