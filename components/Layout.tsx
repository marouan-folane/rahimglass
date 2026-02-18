import React from 'react';
import { NavBar } from './NavBar';
import { MessageCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string, param?: any) => void;
  onAuthRequest: () => void;
  favoritesCount: number;
  hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, onAuthRequest, favoritesCount, hideFooter = false }) => {
  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 relative flex flex-col">
      <NavBar 
        onNavigate={onNavigate} 
        onAuthRequest={onAuthRequest} 
        favoritesCount={favoritesCount}
      />
      
      <main className="flex-grow">
        {children}
      </main>

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/212655293248" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-105 z-50 flex items-center gap-2"
      >
        <MessageCircle size={24} />
      </a>

      {!hideFooter && (
        <footer className="bg-black text-white py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="font-serif text-2xl font-bold tracking-tighter text-white">
                Rahim<span className="text-gray-500">Glass</span>
              </span>
              <p className="mt-4 text-gray-400 text-sm font-light leading-relaxed">
                N°49 Lotissement Al Hoda, Rue de l'Egypte, Témara.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-6 text-sm uppercase tracking-wider text-gray-300">Boutique</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('shop')}>Miroirs</li>
                <li className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('shop')}>Verre Trempé</li>
                <li className="hover:text-white cursor-pointer transition-colors" onClick={() => onNavigate('shop')}>Cloisons Bureau</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6 text-sm uppercase tracking-wider text-gray-300">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>06 55 29 32 48</li>
                <li>06 67 20 47 17</li>
                <li>contact@rahimglass.com</li>
              </ul>
            </div>
             <div>
              <h4 className="font-medium mb-6 text-sm uppercase tracking-wider text-gray-300">Admin</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                 <li onClick={onAuthRequest} className="hover:text-white cursor-pointer transition-colors">Accès Staff</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-900 text-center text-gray-600 text-xs">
            © 2024 Rahim Glass SARL. Tous droits réservés.
          </div>
        </footer>
      )}
    </div>
  );
};