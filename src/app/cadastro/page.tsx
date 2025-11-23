'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/custom/Button';
import { OptionCard } from '@/components/custom/OptionCard';
import { ProgressBar } from '@/components/custom/ProgressBar';
import { OBSTACLES, ACHIEVEMENTS } from '@/lib/types';
import { ArrowLeft, User, Mail, Lock, Calendar, Dumbbell, Target, Scale, TrendingUp, Heart, Star } from 'lucide-react';

type Step = 
  | 'personal' 
  | 'workouts' 
  | 'goal' 
  | 'current-weight' 
  | 'target-weight' 
  | 'obstacles' 
  | 'achievements'
  | 'testimonials';

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
    weeklyWorkouts: '',
    goal: '',
    currentWeight: '',
    targetWeight: '',
    obstacles: [] as string[],
    achievements: [] as string[],
  });

  const steps: Step[] = ['personal', 'workouts', 'goal', 'current-weight', 'target-weight', 'obstacles', 'achievements', 'testimonials'];
  const currentStepIndex = steps.indexOf(step);
  const totalSteps = steps.length;

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      router.push('/');
    }
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setStep(steps[currentStepIndex + 1]);
    } else {
      // Salvar dados e ir para home
      localStorage.setItem('userProfile', JSON.stringify(formData));
      router.push('/home');
    }
  };

  const canContinue = () => {
    switch (step) {
      case 'personal':
        return formData.name && formData.email && formData.password && formData.birthDate;
      case 'workouts':
        return formData.weeklyWorkouts !== '';
      case 'goal':
        return formData.goal !== '';
      case 'current-weight':
        return formData.currentWeight !== '';
      case 'target-weight':
        return formData.targetWeight !== '';
      case 'obstacles':
        return formData.obstacles.length > 0;
      case 'achievements':
        return formData.achievements.length > 0;
      case 'testimonials':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <ProgressBar current={currentStepIndex + 1} total={totalSteps} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 pb-24">
        {/* Informações Pessoais */}
        {step === 'personal' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vamos começar!</h2>
              <p className="text-gray-600">Conte-nos um pouco sobre você</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data de nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gênero (opcional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Masculino', 'Feminino', 'Outro'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setFormData({ ...formData, gender })}
                      className={`py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.gender === gender
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Treinos por Semana */}
        {step === 'workouts' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Quantos treinos faz por semana?</h2>
              <p className="text-gray-600">Isso nos ajuda a personalizar suas metas</p>
            </div>

            <div className="space-y-3">
              <OptionCard
                icon={<Dumbbell />}
                title="2 vezes"
                description="Iniciante ou rotina leve"
                selected={formData.weeklyWorkouts === '2'}
                onClick={() => setFormData({ ...formData, weeklyWorkouts: '2' })}
              />
              <OptionCard
                icon={<Dumbbell />}
                title="3 a 5 vezes"
                description="Rotina moderada e consistente"
                selected={formData.weeklyWorkouts === '3-5'}
                onClick={() => setFormData({ ...formData, weeklyWorkouts: '3-5' })}
              />
              <OptionCard
                icon={<Dumbbell />}
                title="6+ vezes"
                description="Atleta ou rotina intensa"
                selected={formData.weeklyWorkouts === '6+'}
                onClick={() => setFormData({ ...formData, weeklyWorkouts: '6+' })}
              />
            </div>
          </div>
        )}

        {/* Meta Atual */}
        {step === 'goal' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Qual sua meta atual?</h2>
              <p className="text-gray-600">Vamos criar um plano personalizado</p>
            </div>

            <div className="space-y-3">
              <OptionCard
                icon={<TrendingUp className="rotate-180" />}
                title="Perder peso"
                description="Reduzir gordura corporal"
                selected={formData.goal === 'lose'}
                onClick={() => setFormData({ ...formData, goal: 'lose' })}
              />
              <OptionCard
                icon={<TrendingUp />}
                title="Ganhar peso"
                description="Aumentar massa muscular"
                selected={formData.goal === 'gain'}
                onClick={() => setFormData({ ...formData, goal: 'gain' })}
              />
              <OptionCard
                icon={<Target />}
                title="Manter peso"
                description="Manter forma atual"
                selected={formData.goal === 'maintain'}
                onClick={() => setFormData({ ...formData, goal: 'maintain' })}
              />
            </div>
          </div>
        )}

        {/* Peso Atual */}
        {step === 'current-weight' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Qual é seu peso atual?</h2>
              <p className="text-gray-600">Seja honesto, isso é só para você</p>
            </div>

            <div className="relative">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="number"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                className="w-full pl-14 pr-16 py-6 text-3xl font-bold border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-colors text-center"
                placeholder="0"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">kg</span>
            </div>
          </div>
        )}

        {/* Peso Desejado */}
        {step === 'target-weight' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Qual é o seu peso desejado?</h2>
              <p className="text-gray-600">Defina uma meta realista e saudável</p>
            </div>

            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="number"
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                className="w-full pl-14 pr-16 py-6 text-3xl font-bold border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none transition-colors text-center"
                placeholder="0"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">kg</span>
            </div>

            {formData.currentWeight && formData.targetWeight && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-center text-gray-600">
                  Diferença:{' '}
                  <span className="font-bold text-black">
                    {Math.abs(Number(formData.targetWeight) - Number(formData.currentWeight)).toFixed(1)} kg
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Obstáculos */}
        {step === 'obstacles' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">O que está impedindo você?</h2>
              <p className="text-gray-600">Selecione todos que se aplicam</p>
            </div>

            <div className="space-y-3">
              {OBSTACLES.map((obstacle) => (
                <OptionCard
                  key={obstacle}
                  icon={<Heart />}
                  title={obstacle}
                  selected={formData.obstacles.includes(obstacle)}
                  onClick={() => {
                    const newObstacles = formData.obstacles.includes(obstacle)
                      ? formData.obstacles.filter(o => o !== obstacle)
                      : [...formData.obstacles, obstacle];
                    setFormData({ ...formData, obstacles: newObstacles });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Conquistas Desejadas */}
        {step === 'achievements' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">O que você gostaria de alcançar?</h2>
              <p className="text-gray-600">Selecione seus objetivos</p>
            </div>

            <div className="space-y-3">
              {ACHIEVEMENTS.map((achievement) => (
                <OptionCard
                  key={achievement}
                  icon={<Star />}
                  title={achievement}
                  selected={formData.achievements.includes(achievement)}
                  onClick={() => {
                    const newAchievements = formData.achievements.includes(achievement)
                      ? formData.achievements.filter(a => a !== achievement)
                      : [...formData.achievements, achievement];
                    setFormData({ ...formData, achievements: newAchievements });
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Depoimentos */}
        {step === 'testimonials' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold mb-2">Junte-se a milhares de pessoas!</h2>
              <p className="text-gray-600">Veja o que nossos usuários dizem</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: 'Maria Silva',
                  text: 'Perdi 8kg em 2 meses com o AI BR, recomendo!',
                  rating: 5,
                },
                {
                  name: 'João Santos',
                  text: 'Aplicativo simples e completo, me ajudou muito!',
                  rating: 5,
                },
                {
                  name: 'Ana Costa',
                  text: 'A IA de calorias é surpreendente, amei!',
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                </div>
              ))}
            </div>

            <div className="bg-black text-white p-6 rounded-2xl text-center">
              <p className="text-3xl font-bold mb-2">+50.000</p>
              <p className="text-gray-300">Usuários ativos</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer com botão */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canContinue()}
            className="w-full"
          >
            {step === 'testimonials' ? 'Começar agora' : 'Continuar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
