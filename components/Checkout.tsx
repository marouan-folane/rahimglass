import React, { useState, useEffect } from 'react';
import { CartItem, ShippingDetails, ShippingZone } from '../types';
import { ArrowLeft, CreditCard, Truck, Check, MapPin } from 'lucide-react';
import { getProductImageUrl } from '../api';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  onPlaceOrder: (shipping: ShippingDetails, paymentMethod: string) => Promise<void>;
  onBack: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cart, total, onPlaceOrder, onBack }) => {
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: '',
    address: '',
    city: 'Rabat',
    zipCode: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('invoice');
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [shippingCost, setShippingCost] = useState(0);

  // Mock shipping zones if DB is empty, otherwise fetch
  useEffect(() => {
    // Static zones for now
    setZones([
      { id: '1', city: 'Rabat', cost: 50, delivery_days: 1 },
      { id: '2', city: 'Casablanca', cost: 100, delivery_days: 2 },
      { id: '3', city: 'Témara', cost: 30, delivery_days: 1 },
      { id: '4', city: 'Tanger', cost: 150, delivery_days: 3 },
      { id: '5', city: 'Marrakech', cost: 150, delivery_days: 3 },
    ]);
  }, []);

  useEffect(() => {
    const zone = zones.find(z => z.city === shipping.city);
    setShippingCost(zone ? zone.cost : 200); // Default national shipping
  }, [shipping.city, zones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') {
      setStep('payment');
    } else {
      setLoading(true);
      await onPlaceOrder(shipping, paymentMethod);
      setLoading(false);
    }
  };

  const tax = total * 0.2;
  const grandTotal = total + tax + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-black mb-8 flex items-center gap-2">
        <ArrowLeft size={16} /> Retour au Panier
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Forms */}
        <div>
          {/* Progress Indicators */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 text-sm ${step === 'shipping' ? 'text-black font-bold' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'shipping' ? 'border-black' : 'border-gray-300'}`}>1</div>
              Livraison
            </div>
            <div className="w-8 h-[1px] bg-gray-300"></div>
            <div className={`flex items-center gap-2 text-sm ${step === 'payment' ? 'text-black font-bold' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'payment' ? 'border-black' : 'border-gray-300'}`}>2</div>
              Paiement
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-200 shadow-sm">
            {step === 'shipping' ? (
              <div className="space-y-6">
                <h2 className="text-xl font-serif mb-4">Détails de Livraison</h2>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Nom Complet</label>
                  <input required className="w-full p-3 border border-gray-200 focus:border-black focus:outline-none" value={shipping.fullName} onChange={e => setShipping({ ...shipping, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Adresse</label>
                  <input required className="w-full p-3 border border-gray-200 focus:border-black focus:outline-none" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Ville</label>
                    <select
                      className="w-full p-3 border border-gray-200 focus:border-black focus:outline-none bg-white"
                      value={shipping.city}
                      onChange={e => setShipping({ ...shipping, city: e.target.value })}
                    >
                      {zones.map(zone => (
                        <option key={zone.id} value={zone.city}>{zone.city}</option>
                      ))}
                      <option value="Other">Autre (National)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Code Postal</label>
                    <input required className="w-full p-3 border border-gray-200 focus:border-black focus:outline-none" value={shipping.zipCode} onChange={e => setShipping({ ...shipping, zipCode: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Téléphone</label>
                  <input required type="tel" className="w-full p-3 border border-gray-200 focus:border-black focus:outline-none" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} />
                </div>
                <button type="submit" className="w-full bg-black text-white py-4 mt-4 uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors">
                  Continuer vers Paiement
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-serif mb-4">Méthode de Paiement</h2>
                <div className="space-y-4">
                  <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'invoice' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="invoice" checked={paymentMethod === 'invoice'} onChange={() => setPaymentMethod('invoice')} className="accent-black" />
                      <Truck size={20} />
                      <div>
                        <p className="font-medium text-sm">Paiement à la Livraison / Facture</p>
                        <p className="text-xs text-gray-500">Pour les clients professionnels et vérifiés</p>
                      </div>
                    </div>
                  </label>
                  <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="accent-black" />
                      <CreditCard size={20} />
                      <div>
                        <p className="font-medium text-sm">Virement Bancaire</p>
                        <p className="text-xs text-gray-500">Commande traitée après réception des fonds</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                    <span>Livraison à :</span>
                    <button type="button" onClick={() => setStep('shipping')} className="text-black underline">Modifier</button>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-sm">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{shipping.fullName}</p>
                      <p className="text-sm text-gray-600">{shipping.address}</p>
                      <p className="text-sm text-gray-600">{shipping.city}, {shipping.zipCode}</p>
                      <p className="text-sm text-gray-600">{shipping.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Email Notification Simulation */}
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Check size={12} className="text-green-500" />
                  La confirmation de commande sera envoyée par email.
                </div>

                <button disabled={loading} type="submit" className="w-full bg-black text-white py-4 mt-4 uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {loading ? 'Traitement...' : `Confirmer la Commande (${grandTotal.toFixed(2)} MAD)`}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="h-fit sticky top-24">
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h3 className="font-serif text-lg mb-6">Résumé de la Commande</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                    {item.custom_image ? (
                      <img src={item.custom_image} className="w-full h-full object-contain bg-gray-50 border border-gray-100" />
                    ) : (
                      <img src={getProductImageUrl(item.product?.image_url || null)} className="w-full h-full object-cover grayscale-[20%]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                    {item.custom_width && (
                      <p className="text-xs text-gray-500">{item.custom_width}cm x {item.custom_height}cm</p>
                    )}
                    {item.custom_specs && (
                      <p className="text-[10px] text-purple-600 mt-0.5">Sur Mesure IA</p>
                    )}
                  </div>
                  <p className="text-sm font-medium font-mono">{item.calculated_price.toFixed(2)} MAD</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{total.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>TVA (20%)</span>
                <span>{tax.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Livraison ({shipping.city})</span>
                <span>{shippingCost.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};