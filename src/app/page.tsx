'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from '@/lib/types';
import { Button } from '@/components/custom/Button';
import { Globe } from 'lucide-react';

export default function SplashScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const [showLanguages, setShowLanguages] = useState(false);

  const handleContinue = () => {
    localStorage.setItem('language', selectedLanguage);
    router.push('/cadastro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center p-6">
      {/* Logo e Título */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold text-white">AI</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
          BR AI Calorias
        </h1>
        <p className="text-gray-600 text-lg">
          Seu assistente inteligente de nutrição
        </p>
      </div>

      {/* Seleção de Idioma */}
      <div className="w-full max-w-md mb-8">
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="w-full bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-gray-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6" />
            <span className="font-semibold">
              {LANGUAGES.find(l => l.code === selectedLanguage)?.flag}{' '}
              {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
            </span>
          </div>
          <span className="text-gray-400">▼</span>
        </button>

        {showLanguages && (
          <div className="mt-2 bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  setShowLanguages(false);
                }}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedLanguage === lang.code ? 'bg-gray-100' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="w-full max-w-md space-y-4 mb-12">
        {[
          { icon: '📸', text: 'Scanner inteligente de refeições' },
          { icon: '🎯', text: 'Metas personalizadas de calorias' },
          { icon: '⌚', text: 'Conexão com smartwatch' },
          { icon: '📊', text: 'Relatórios detalhados de progresso' },
        ].map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
          >
            <span className="text-3xl">{feature.icon}</span>
            <span className="text-gray-700">{feature.text}</span>
          </div>
        ))}
      </div>

      {/* Botão Continuar */}
      <Button
        size="lg"
        onClick={handleContinue}
        className="w-full max-w-md"
      >
        Começar
      </Button>

      <p className="text-gray-400 text-sm mt-6">
        Versão 1.0.0 • Powered by AI
      </p>
    </div>
  );
}
