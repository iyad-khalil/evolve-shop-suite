
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EC</span>
              </div>
              <span className="text-xl font-bold">EcommerceAI</span>
            </div>
            <p className="text-gray-400 text-sm">
              La plateforme e-commerce intelligente qui révolutionne votre façon de vendre en ligne.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Produits</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors">Catégories</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Livraison</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 EcommerceAI. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Confidentialité
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
