
import React from 'react';
import { Truck, Clock, MapPin, Shield, Star } from 'lucide-react';

const Shipping = () => {
  const shippingPartners = [
    {
      name: "Amana",
      logo: "🚛",
      description: "Leader de la livraison au Maroc",
      coverage: "Toutes les villes du Maroc",
      deliveryTime: "24-48h",
      rating: 4.8,
      features: ["Suivi en temps réel", "Livraison express", "Paiement à la livraison"],
      zones: "Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir et 200+ villes"
    },
    {
      name: "Chronopost Maroc",
      logo: "⚡",
      description: "Livraison express internationale et nationale",
      coverage: "Principales villes + International",
      deliveryTime: "24h Express",
      rating: 4.6,
      features: ["Livraison express", "Assurance colis", "Signature électronique"],
      zones: "Casablanca, Rabat, Marrakech, Fès, Tanger + Europe"
    },
    {
      name: "CTM Messagerie",
      logo: "🚌",
      description: "Réseau national fiable et économique",
      coverage: "Tout le territoire national",
      deliveryTime: "2-3 jours",
      rating: 4.5,
      features: ["Prix compétitifs", "Réseau étendu", "Livraison domicile"],
      zones: "Toutes les villes et villages du Maroc"
    },
    {
      name: "DHL Maroc",
      logo: "✈️",
      description: "Livraison internationale premium",
      coverage: "Maroc + 220 pays",
      deliveryTime: "24-72h",
      rating: 4.7,
      features: ["Livraison internationale", "Service premium", "Suivi avancé"],
      zones: "Grandes villes du Maroc + International"
    }
  ];

  const deliveryZones = [
    {
      zone: "Zone 1 - Casablanca",
      cities: ["Casablanca", "Mohammedia", "Nouaceur"],
      price: "15 DH",
      time: "24h"
    },
    {
      zone: "Zone 2 - Rabat-Salé",
      cities: ["Rabat", "Salé", "Témara", "Skhirat"],
      price: "20 DH",
      time: "24-48h"
    },
    {
      zone: "Zone 3 - Grandes Villes",
      cities: ["Marrakech", "Fès", "Tanger", "Agadir", "Oujda", "Meknès"],
      price: "25 DH",
      time: "48h"
    },
    {
      zone: "Zone 4 - Autres Villes",
      cities: ["Toutes les autres villes du royaume"],
      price: "30 DH",
      time: "2-3 jours"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Livraison au Maroc
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous travaillons avec les meilleurs partenaires de livraison au Maroc 
            pour vous garantir une livraison rapide et sécurisée dans tout le royaume.
          </p>
        </div>

        {/* Nos Partenaires de Livraison */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            Nos Partenaires de Livraison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shippingPartners.map((partner, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="text-4xl mr-4">{partner.logo}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {partner.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {partner.description}
                    </p>
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{partner.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">{partner.coverage}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-700">Délai: {partner.deliveryTime}</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-2">Zones couvertes:</p>
                    <p className="text-xs text-gray-500">{partner.zones}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {partner.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zones et Tarifs */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
            Zones de Livraison et Tarifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliveryZones.map((zone, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {zone.zone}
                </h3>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {zone.price}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {zone.time}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Villes incluses:</strong>
                    <p className="mt-1">{zone.cities.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informations Pratiques */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Informations Pratiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Livraison Gratuite
              </h3>
              <p className="text-gray-600 text-sm">
                Commandes supérieures à 500 DH dans les grandes villes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Colis Sécurisés
              </h3>
              <p className="text-gray-600 text-sm">
                Tous nos colis sont assurés et suivis en temps réel
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Paiement à la Livraison
              </h3>
              <p className="text-gray-600 text-sm">
                Payez en espèces ou par carte à la réception de votre commande
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Note Importante :</h4>
            <p className="text-gray-700 text-sm">
              Les délais de livraison peuvent varier selon les conditions météorologiques, 
              les jours fériés et la disponibilité des produits. Nous nous engageons à vous 
              tenir informé en cas de retard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
