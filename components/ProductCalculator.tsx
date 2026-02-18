import React, { useState, useEffect } from 'react';
import { Product, Profile } from '../types';
import { Calculator, TrendingDown, ShieldCheck, MessageCircle } from 'lucide-react';

interface Props {
  product: Product;
  userProfile: Profile | null;
  onAddToCart: (quantity: number, width?: number, height?: number, price?: number) => void;
}

export const ProductCalculator: React.FC<Props> = ({ product, userProfile, onAddToCart }) => {
  const [width, setWidth] = useState<number>(100); // cm
  const [height, setHeight] = useState<number>(100); // cm
  const [quantity, setQuantity] = useState<number>(1);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [basePriceTotal, setBasePriceTotal] = useState<number>(0);

  // Constants
  const MIN_DIMENSION = 20; // cm
  const MAX_DIMENSION = 300; // cm
  const VOLUME_THRESHOLD_M2 = 10;
  
  // B2B Logic
  const isWholesale = userProfile?.role === 'wholesale';
  const wholesaleDiscount = 0.15; // 15%
  const volumeDiscount = 0.10; // 10%

  useEffect(() => {
    calculatePrice();
  }, [width, height, quantity, product, isWholesale]);

  const calculatePrice = () => {
    let unitPrice = 0;
    let areaM2 = 0;

    if (product.is_customizable) {
      areaM2 = (width * height) / 10000;
      unitPrice = areaM2 * product.price_per_m2;
      
      const minPrice = 0.5 * product.price_per_m2;
      if (unitPrice < minPrice) unitPrice = minPrice;
    } else {
      unitPrice = product.price_per_m2;
      areaM2 = 0; // Not relevant for fixed items
    }

    const totalRaw = unitPrice * quantity;
    setBasePriceTotal(totalRaw);

    // Apply Discounts
    let price = totalRaw;
    
    // 1. Wholesale Discount
    if (isWholesale) {
      price = price * (1 - wholesaleDiscount);
    }

    // 2. Volume Discount
    // Only applies if custom glass area > threshold
    if (product.is_customizable && (areaM2 * quantity) > VOLUME_THRESHOLD_M2) {
      price = price * (1 - volumeDiscount);
    }

    setFinalPrice(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart(quantity, product.is_customizable ? width : undefined, product.is_customizable ? height : undefined, finalPrice);
  };

  const isVolumeEligible = product.is_customizable && ((width * height) / 10000) * quantity > VOLUME_THRESHOLD_M2;

  // WhatsApp Handler
  const sendWhatsApp = () => {
    const text = `Bonjour RahimGlass, je suis intéressé par ${product.name}. Dimensions: ${width}cm x ${height}cm. Quantité: ${quantity}.`;
    window.open(`https://wa.me/212655293248?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-gray-50 p-6 rounded-none border border-gray-200">
      <div className="flex items-center gap-2 mb-6 text-gray-900 font-serif text-lg font-medium">
        <Calculator size={20} className="text-gray-400" />
        {product.is_customizable ? 'Calculateur de Coupe sur Mesure' : 'Tarification'}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {product.is_customizable && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Largeur (cm)</label>
              <input
                type="number"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-none focus:ring-1 focus:ring-black focus:border-black transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Hauteur (cm)</label>
              <input
                type="number"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-none focus:ring-1 focus:ring-black focus:border-black transition-colors bg-white"
              />
            </div>
          </div>
        )}

        {/* Pricing Specs */}
        <div className="bg-white p-4 border border-gray-200 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Épaisseur Matériau</span>
            <span>{product.thickness}mm</span>
          </div>
          {product.is_customizable && (
            <div className="flex justify-between text-xs text-gray-500">
               <span>Surface Totale</span>
               <span>{(((width * height) / 10000) * quantity).toFixed(2)} m²</span>
            </div>
          )}
          
          {/* Discount Indicators */}
          <div className="pt-2 border-t border-gray-100 space-y-1">
             {isWholesale && (
               <div className="flex items-center justify-between text-xs text-gray-800 font-medium">
                  <span className="flex items-center gap-1"><ShieldCheck size={12}/> Partenaire Grossiste</span>
                  <span>-{(wholesaleDiscount * 100)}%</span>
               </div>
             )}
             {isVolumeEligible && (
               <div className="flex items-center justify-between text-xs text-gray-800 font-medium">
                  <span className="flex items-center gap-1"><TrendingDown size={12}/> Remise sur Volume ({'>'}10m²)</span>
                  <span>-{(volumeDiscount * 100)}%</span>
               </div>
             )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center border border-gray-300 bg-white">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >-</button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-[3.5rem] text-center text-sm font-medium">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >+</button>
             </div>
             <div className="text-right">
                {(isWholesale || isVolumeEligible) && (
                   <div className="text-xs text-gray-400 line-through mb-0.5">
                     {basePriceTotal.toFixed(2)} MAD
                   </div>
                )}
                <span className="text-3xl font-serif font-medium text-gray-900">
                  {finalPrice.toFixed(2)} MAD
                </span>
             </div>
           </div>

           <div className="flex flex-col gap-3">
             <button
               type="submit"
               className="w-full bg-black text-white py-4 px-4 rounded-none hover:bg-gray-800 transition-colors duration-200 uppercase tracking-widest text-xs font-bold"
             >
               Ajouter au Panier
             </button>
             
             {product.is_customizable && (
               <button
                 type="button"
                 onClick={sendWhatsApp}
                 className="w-full border border-green-600 text-green-700 py-3 px-4 rounded-none hover:bg-green-50 transition-colors duration-200 text-xs font-medium flex items-center justify-center gap-2"
               >
                 <MessageCircle size={16} /> Envoyer Mesures via WhatsApp
               </button>
             )}
           </div>
        </div>
      </form>
    </div>
  );
};