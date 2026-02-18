import React from 'react';
import { LazyImage } from '../components/LazyImage';
import { Award, Users, Globe, PenTool } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage 
            src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop" 
            alt="Glass Workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] mb-4 reveal-on-scroll">Est. 2010</p>
          <h1 className="text-5xl md:text-7xl font-serif mb-6 reveal-on-scroll reveal-delay-100">L'Art de la Transparence</h1>
          <p className="text-lg md:text-xl font-light opacity-90 leading-relaxed reveal-on-scroll reveal-delay-200">
            Création des meilleures solutions en verre pour l'architecture moderne et les intérieurs à Témara et au-delà.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-on-scroll">
            <h2 className="text-4xl font-serif text-gray-900 mb-6">Notre Histoire</h2>
            <div className="w-20 h-1 bg-black mb-8"></div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Fondée à Témara, <strong>RahimGlass</strong> a commencé avec une mission simple : apporter clarté, élégance et durabilité aux espaces grâce à un artisanat du verre de haute qualité. Ce qui a commencé comme un petit atelier est devenu un fournisseur de premier plan de solutions de vitrage pour les projets résidentiels et commerciaux.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nous croyons que le verre n'est pas seulement un matériau ; c'est un médium de lumière. Qu'il s'agisse d'un miroir sur mesure qui ouvre une pièce ou d'une cloison en verre trempé robuste pour un bureau, chaque pièce que nous livrons est coupée, polie et inspectée avec précision.
            </p>
            <div className="flex gap-8 mt-12">
               <div>
                  <h3 className="text-4xl font-serif font-bold text-gray-900">14+</h3>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">Années d'Expérience</p>
               </div>
               <div>
                  <h3 className="text-4xl font-serif font-bold text-gray-900">5k+</h3>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mt-2">Projets Réalisés</p>
               </div>
            </div>
          </div>
          <div className="relative h-[600px] reveal-on-scroll reveal-delay-200">
            <LazyImage 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1000" 
              alt="Interior Design"
              className="w-full h-full object-cover grayscale-[20%]"
            />
            <div className="absolute -bottom-8 -left-8 bg-white p-8 shadow-xl max-w-xs hidden md:block">
               <p className="font-serif italic text-lg text-gray-800">"La qualité n'est jamais un accident ; c'est toujours le résultat d'un effort intelligent."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-gray-50 py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
               <h2 className="text-3xl font-serif text-gray-900 mb-4">Pourquoi Choisir RahimGlass ?</h2>
               <p className="text-gray-500">Nous ne vendons pas seulement du verre ; nous fournissons des solutions architecturales adaptées à vos besoins spécifiques.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                  { icon: Award, title: "Qualité Premium", desc: "Provenant des meilleurs fabricants et traité avec des machines de haute technologie." },
                  { icon: PenTool, title: "Fabrication Sur Mesure", desc: "Chaque pièce est coupée à vos dimensions exactes avec une précision millimétrique." },
                  { icon: Users, title: "Équipe Experte", desc: "Nos artisans et installateurs ont des décennies d'expérience combinée." },
                  { icon: Globe, title: "Écologique", desc: "Pratiques durables et matériaux recyclés dans la mesure du possible." },
               ].map((item, i) => (
                  <div key={i} className="bg-white p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300 reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                     <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full mb-6">
                        <item.icon size={24} />
                     </div>
                     <h3 className="text-lg font-bold font-serif mb-3">{item.title}</h3>
                     <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Location / CTA */}
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
         <div className="bg-black text-white p-12 md:p-24 relative overflow-hidden reveal-on-scroll">
            <div className="relative z-10">
               <h2 className="text-4xl md:text-5xl font-serif mb-6">Prêt à Transformer Votre Espace ?</h2>
               <p className="text-white/70 max-w-xl mx-auto mb-10 text-lg">
                  Visitez notre showroom à Témara ou parcourez notre catalogue en ligne pour commencer votre projet.
               </p>
               <button className="bg-white text-black px-8 py-4 uppercase tracking-widest font-bold text-sm hover:bg-gray-200 transition-colors">
                  Contactez-nous Aujourd'hui
               </button>
            </div>
            {/* Abstract bg shapes */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
         </div>
      </div>
    </div>
  );
};