
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  const contacts = [
    {
      name: "IYAD KHALIL",
      role: "Ingénieur AI",
      phone: "+212654890931",
      speciality: "Intelligence Artificielle & Machine Learning"
    },
    {
      name: "RAJI Oussama",
      role: "Ingénieur AI", 
      phone: "+212639585618",
      speciality: "Développement & Architecture Logicielle"
    },
    {
      name: "BENSALEK ABDERRAHMANE",
      role: "Support Technique",
      phone: "+212 669-946164",
      speciality: "Support Client & Résolution de Problèmes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Notre équipe d'experts est disponible pour vous aider. 
            En cas d'urgence, contactez directement nos spécialistes.
          </p>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Contacts d'Urgence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contacts.map((contact, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">
                      {contact.name.split(' ')[0][0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {contact.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">
                    {contact.role}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    {contact.speciality}
                  </p>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {contact.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Information */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Informations Générales
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-gray-600">support@ecommerceai.ma</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">
                      123 Avenue Mohammed V<br />
                      Casablanca, Maroc
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Heures d'Ouverture
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="font-medium">9h00 - 18h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samedi</span>
                  <span className="font-medium">9h00 - 14h00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="font-medium">Fermé</span>
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-red-700 text-sm">
                    <strong>Urgences :</strong> Nos experts sont disponibles 24h/24 via les numéros ci-dessus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
