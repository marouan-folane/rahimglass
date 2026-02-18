import React, { useState } from 'react';
import { X, ArrowRight, Mail, Lock, User, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  error: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      await onLogin(email, password);
    } else {
      await onRegister(email, password, name, phone);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-fade-in-up min-h-[600px]">
        
        {/* Left Side - Image (Hidden on mobile) */}
        <div className="hidden md:block w-1/2 relative bg-black">
          <img 
            src="https://images.unsplash.com/photo-1621262466075-8a2119eb8932?auto=format&fit=crop&q=80&w=1000" 
            alt="Glass Texture" 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 p-12 text-white z-10">
            <h2 className="text-4xl font-serif font-bold mb-4">Reflétez Votre<br/>Vrai Style.</h2>
            <p className="text-white/80 font-light text-lg">Rejoignez notre communauté exclusive pour des solutions en verre premium.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center relative bg-white">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors p-2"
          >
            <X size={24} />
          </button>

          <div className="max-w-xs mx-auto w-full">
            {/* Logo */}
            <div className="mb-12 text-center">
              <span className="font-serif text-3xl font-bold tracking-tighter text-gray-900">
                Rahim<span className="text-gray-400">Glass</span>
              </span>
            </div>

            <h3 className="text-2xl font-serif font-medium mb-2 text-center">
              {isLogin ? 'Bon Retour' : 'Créer un Compte'}
            </h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              {isLogin ? 'Entrez vos détails pour accéder à votre compte' : 'Inscrivez-vous pour suivre vos commandes'}
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="group">
                    <div className="relative">
                      <User className="absolute left-0 top-3 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Nom Complet" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-8 py-3 border-b border-gray-200 focus:border-black outline-none transition-all placeholder:text-gray-400 text-sm bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <div className="relative">
                      <Phone className="absolute left-0 top-3 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                      <input 
                        type="tel" 
                        placeholder="Numéro de Téléphone" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 py-3 border-b border-gray-200 focus:border-black outline-none transition-all placeholder:text-gray-400 text-sm bg-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="group">
                <div className="relative">
                  <Mail className="absolute left-0 top-3 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="Adresse Email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 py-3 border-b border-gray-200 focus:border-black outline-none transition-all placeholder:text-gray-400 text-sm bg-transparent"
                  />
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Lock className="absolute left-0 top-3 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                  <input 
                    type="password" 
                    placeholder="Mot de Passe" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 py-3 border-b border-gray-200 focus:border-black outline-none transition-all placeholder:text-gray-400 text-sm bg-transparent"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white h-12 mt-4 uppercase tracking-widest text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? 'Traitement...' : (isLogin ? 'Connexion' : 'S\'inscrire')}
                {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 mb-3">
                {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
              </p>
              <button 
                onClick={() => { setIsLogin(!isLogin); }}
                className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors"
              >
                {isLogin ? 'Créer un Compte' : 'Connexion'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};