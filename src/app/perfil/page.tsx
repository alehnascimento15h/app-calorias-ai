'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/custom/Button';
import { ArrowLeft, User, Mail, Calendar, Target, Activity, Save, Edit2 } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    currentWeight: '',
    targetWeight: '',
    weeklyWorkouts: '',
    goal: '',
  });

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const data = JSON.parse(profile);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        birthDate: data.birthDate || '',
        currentWeight: data.currentWeight || '',
        targetWeight: data.targetWeight || '',
        weeklyWorkouts: data.weeklyWorkouts || '',
        goal: data.goal || '',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(formData));
    setIsEditing(false);
    alert('✅ Perfil atualizado com sucesso!');
  };

  const handleCancel = () => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setFormData(JSON.parse(profile));
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Avatar Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-1">{formData.name || 'Usuário'}</h2>
          <p className="text-gray-600">{formData.email || 'email@exemplo.com'}</p>
        </div>

        {/* Informações Pessoais */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-6 h-6" />
            Informações Pessoais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Metas e Objetivos */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Metas e Objetivos
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                name="currentWeight"
                value={formData.currentWeight}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Desejado (kg)
              </label>
              <input
                type="number"
                name="targetWeight"
                value={formData.targetWeight}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="65"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treinos por Semana
              </label>
              <select
                name="weeklyWorkouts"
                value={formData.weeklyWorkouts}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecione</option>
                <option value="2">2 vezes</option>
                <option value="3-5">3 a 5 vezes</option>
                <option value="6+">6+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Atual
              </label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecione</option>
                <option value="lose">Perder peso</option>
                <option value="gain">Ganhar peso</option>
                <option value="maintain">Manter peso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {isEditing && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCancel}
              className="p-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar
            </button>
          </div>
        )}

        {/* Configurações Adicionais */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold mb-4">Configurações</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="font-medium">Idioma</span>
              <span className="text-gray-600">Português 🇧🇷</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="font-medium">Notificações</span>
              <span className="text-gray-600">Ativadas</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="font-medium">Plano</span>
              <span className="text-gray-600">Gratuito</span>
            </button>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          onClick={() => {
            if (confirm('Deseja realmente sair?')) {
              localStorage.clear();
              router.push('/');
            }
          }}
          className="w-full p-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
        >
          Sair da Conta
        </button>
      </div>

      {/* Spacing for bottom */}
      <div className="h-8" />
    </div>
  );
}
