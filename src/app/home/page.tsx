'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/custom/Button';
import { Camera, Plus, TrendingUp, Utensils, Dumbbell, User, Target, Zap, Droplet, Image as ImageIcon, Loader2, Play, Square, MapPin } from 'lucide-react';
import { 
  supabase, 
  getUserProfile, 
  createUserProfile,
  getMealsByDate, 
  createMeal,
  getWaterIntakeByDate,
  addWaterIntake,
  getActivitiesByDate,
  createActivity,
  getTodayDate,
  type Meal as MealType,
  type Activity as ActivityType
} from '@/lib/supabase';

interface Meal {
  id?: string;
  name: string;
  calories: number;
  time: string;
  icon: string;
  meal_type?: string;
}

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function HomePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [caloriesGoal, setCaloriesGoal] = useState(2000);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [userName, setUserName] = useState('');
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para rastreamento de localização
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [trackingTime, setTrackingTime] = useState(0);
  const [route, setRoute] = useState<Location[]>([]);
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const watchIdRef = useRef<number | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar dados do usuário e dados do dia
  useEffect(() => {
    loadUserData();

    // Limpar rastreamento ao desmontar componente
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Verificar se existe perfil no localStorage
      const profile = localStorage.getItem('userProfile');
      if (!profile) {
        router.push('/');
        return;
      }

      const userData = JSON.parse(profile);
      setUserName(userData.name);

      // Criar ou buscar usuário no Supabase
      let supabaseUserId = localStorage.getItem('supabaseUserId');
      
      if (!supabaseUserId) {
        // Criar novo usuário no Supabase
        const newUser = await createUserProfile({
          name: userData.name,
          email: userData.email || `${userData.name.toLowerCase().replace(/\s/g, '')}@app.com`,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
          goal: userData.goal,
          activity_level: userData.activityLevel,
          calories_goal: userData.caloriesGoal || 2000,
          water_goal: userData.weight * 35,
        });
        
        supabaseUserId = newUser.id;
        localStorage.setItem('supabaseUserId', supabaseUserId);
      }

      setUserId(supabaseUserId);

      // Buscar dados do Supabase
      const userProfile = await getUserProfile(supabaseUserId);
      setCaloriesGoal(userProfile.calories_goal);
      setWaterGoal(userProfile.water_goal);

      // Carregar dados do dia
      await loadTodayData(supabaseUserId);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Se falhar, usar dados do localStorage como fallback
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        const data = JSON.parse(profile);
        setUserName(data.name);
        if (data.weight) {
          setWaterGoal(data.weight * 35);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayData = async (uid: string) => {
    const today = getTodayDate();

    try {
      // Carregar refeições
      const mealsData = await getMealsByDate(uid, today);
      const formattedMeals = mealsData.map(m => ({
        id: m.id,
        name: m.meal_type,
        calories: m.calories,
        time: m.time,
        icon: m.icon,
        meal_type: m.meal_type,
      }));
      setMeals(formattedMeals);

      // Calcular calorias consumidas
      const totalCalories = mealsData.reduce((sum, meal) => sum + meal.calories, 0);
      setCaloriesConsumed(totalCalories);

      // Carregar água
      const waterData = await getWaterIntakeByDate(uid, today);
      const totalWater = waterData.reduce((sum, intake) => sum + intake.amount, 0);
      setWaterConsumed(totalWater);

      // Carregar atividades
      const activitiesData = await getActivitiesByDate(uid, today);
      const totalBurned = activitiesData.reduce((sum, activity) => sum + activity.calories_burned, 0);
      setCaloriesBurned(totalBurned);

      // Carregar última atividade de caminhada
      const lastWalk = activitiesData.find(a => a.type === 'walk');
      if (lastWalk) {
        setDistance(lastWalk.distance);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dia:', error);
    }
  };

  const caloriesRemaining = caloriesGoal - caloriesConsumed + caloriesBurned;
  const percentage = (caloriesConsumed / caloriesGoal) * 100;
  const waterPercentage = (waterConsumed / waterGoal) * 100;
  
  const getProgressColor = () => {
    if (percentage < 70) return 'from-green-400 to-green-600';
    if (percentage < 90) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getWaterProgressColor = () => {
    if (waterPercentage < 70) return 'from-blue-400 to-blue-600';
    if (waterPercentage < 90) return 'from-cyan-400 to-cyan-600';
    return 'from-green-400 to-green-600';
  };

  // Calcular distância entre duas coordenadas (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setIsTracking(true);
    setRoute([]);
    setTrackingTime(0);
    setDistance(0);

    // Iniciar contador de tempo
    trackingIntervalRef.current = setInterval(() => {
      setTrackingTime(prev => prev + 1);
    }, 1000);

    // Iniciar rastreamento de localização
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };

        setRoute(prevRoute => {
          const updatedRoute = [...prevRoute, newLocation];
          
          // Calcular distância total
          if (updatedRoute.length > 1) {
            let totalDistance = 0;
            for (let i = 1; i < updatedRoute.length; i++) {
              const prev = updatedRoute[i - 1];
              const curr = updatedRoute[i];
              totalDistance += calculateDistance(
                prev.latitude,
                prev.longitude,
                curr.latitude,
                curr.longitude
              );
            }
            setDistance(totalDistance);
          }
          
          return updatedRoute;
        });
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('❌ Erro ao acessar sua localização. Verifique as permissões.');
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = async () => {
    setIsTracking(false);
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (route.length > 0 && userId) {
      const caloriesBurnedFromWalk = Math.round(distance * 50);
      
      try {
        // Salvar atividade no Supabase
        await createActivity({
          user_id: userId,
          type: 'walk',
          distance: distance,
          duration: trackingTime,
          calories_burned: caloriesBurnedFromWalk,
          route: route,
          date: getTodayDate(),
        });

        setCaloriesBurned(prev => prev + caloriesBurnedFromWalk);

        alert(`✅ Atividade salva com sucesso!\n\n📍 Distância: ${distance.toFixed(2)} km\n⏱️ Tempo: ${formatTime(trackingTime)}\n🔥 Calorias queimadas: ${caloriesBurnedFromWalk} kcal`);
      } catch (error) {
        console.error('Erro ao salvar atividade:', error);
        alert('❌ Erro ao salvar atividade. Tente novamente.');
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleAddMeal = () => {
    setShowMealDialog(true);
  };

  const handleMealTypeSelect = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowMealDialog(false);
    setShowImageOptions(true);
  };

  const handleAddWater = async (amount: number) => {
    const newTotal = Math.min(waterConsumed + amount, waterGoal);
    setWaterConsumed(newTotal);

    if (userId) {
      try {
        await addWaterIntake({
          user_id: userId,
          amount: amount,
          date: getTodayDate(),
        });
      } catch (error) {
        console.error('Erro ao salvar água:', error);
      }
    }
  };

  const handleNavigate = (page: string) => {
    if (page === 'perfil') {
      router.push('/perfil');
    } else if (page === 'home') {
      // Já está na home
    } else {
      alert(`🚧 Página "${page}" será implementada em breve!`);
    }
  };

  const handleOpenCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleOpenGallery = () => {
    fileInputRef.current?.click();
  };

  const analyzeImageWithAI = async (imageFile: File) => {
    setIsAnalyzing(true);
    setShowImageOptions(false);

    try {
      // Converter imagem para base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Chamar API de análise de calorias
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mealType: selectedMealType,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao analisar imagem');
      }

      const data = await response.json();
      
      // Adicionar refeição à lista
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const mealIcons: { [key: string]: string } = {
        'Café da Manhã': '🍳',
        'Almoço': '🍽️',
        'Jantar': '🍲',
        'Lanche': '🍎',
      };

      const newMeal: Meal = {
        name: selectedMealType || 'Refeição',
        calories: data.calories || 0,
        time: timeString,
        icon: mealIcons[selectedMealType || ''] || '🍽️',
        meal_type: selectedMealType || 'Refeição',
      };

      // Salvar no Supabase
      if (userId) {
        try {
          const savedMeal = await createMeal({
            user_id: userId,
            name: data.description || selectedMealType || 'Refeição',
            calories: data.calories || 0,
            time: timeString,
            icon: newMeal.icon,
            meal_type: selectedMealType || 'Refeição',
            description: data.description,
            date: getTodayDate(),
          });

          newMeal.id = savedMeal.id;
        } catch (error) {
          console.error('Erro ao salvar refeição:', error);
        }
      }

      setMeals(prev => [...prev, newMeal]);
      setCaloriesConsumed(prev => prev + newMeal.calories);

      alert(`✅ ${selectedMealType} adicionada!\n\n📊 Análise:\n${data.description}\n\n🔥 Calorias estimadas: ${data.calories} kcal`);
      
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      alert('❌ Erro ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
      setSelectedMealType(null);
    }
  };

  const handleImageSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeImageWithAI(file);
    }
    // Limpar input para permitir selecionar a mesma imagem novamente
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelected}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelected}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Olá, {userName || 'Usuário'}! 👋</h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button 
            onClick={() => handleNavigate('perfil')}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Calorias Card Principal */}
        <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-300 text-sm mb-1">Calorias Restantes</p>
              <p className="text-5xl font-bold">{caloriesRemaining}</p>
            </div>
            <div className="text-right">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Target className="w-8 h-8 mb-2" />
                <p className="text-xs text-gray-300">Meta Diária</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{caloriesConsumed}</p>
              <p className="text-gray-300 text-xs">Consumidas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{caloriesBurned}</p>
              <p className="text-gray-300 text-xs">Queimadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{caloriesGoal}</p>
              <p className="text-gray-300 text-xs">Meta</p>
            </div>
          </div>
        </div>

        {/* Refeições do Dia */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Refeições de Hoje</h2>
            <Utensils className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-3">
            {meals.length > 0 ? (
              meals.map((meal, index) => (
                <div key={meal.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{meal.icon}</span>
                    <div>
                      <p className="font-semibold">{meal.name}</p>
                      <p className="text-sm text-gray-600">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{meal.calories}</p>
                    <p className="text-xs text-gray-600">kcal</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma refeição registrada hoje</p>
              </div>
            )}

            <button 
              onClick={handleAddMeal}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-gray-600 font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar Refeição
            </button>
          </div>

          {/* Seção de Água */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Droplet className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-bold">Hidratação</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Meta: {(waterGoal / 1000).toFixed(1)}L</p>
              </div>
            </div>

            {/* Progress Bar de Água */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getWaterProgressColor()} transition-all duration-500`}
                  style={{ width: `${Math.min(waterPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-600">
                  {(waterConsumed / 1000).toFixed(1)}L de {(waterGoal / 1000).toFixed(1)}L
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {waterPercentage.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Botões de Adicionar Água */}
            <div className="grid grid-cols-4 gap-2">
              {[200, 300, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAddWater(amount)}
                  className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-xl p-3 hover:shadow-lg transition-all font-semibold text-sm"
                >
                  +{amount}ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Card de Caminhada com Rastreamento */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-8 h-8" />
              {isTracking && (
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold animate-pulse">
                  🔴 Gravando
                </div>
              )}
            </div>
            
            <p className="text-3xl font-bold mb-1">{distance.toFixed(2)}km</p>
            <p className="text-sm opacity-90 mb-3">
              {isTracking ? `Tempo: ${formatTime(trackingTime)}` : 'Caminhada hoje'}
            </p>

            {/* Botões de Controle */}
            <div className="flex gap-2">
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 font-semibold transition-all"
                >
                  <Play className="w-5 h-5" />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2 font-semibold transition-all"
                >
                  <Square className="w-5 h-5" />
                  Parar
                </button>
              )}
              
              {route.length > 0 && (
                <button
                  onClick={() => setShowRouteDialog(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center transition-all"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-2xl p-6 shadow-lg">
            <Droplet className="w-8 h-8 mb-3" />
            <p className="text-3xl font-bold mb-1">{(waterConsumed / 1000).toFixed(1)}L</p>
            <p className="text-sm opacity-90">Água consumida</p>
          </div>
        </div>
      </div>

      {/* Spacing for bottom nav */}
      <div className="h-24" />

      {/* Meal Type Dialog */}
      {showMealDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Adicionar Refeição</h3>
            <p className="text-gray-600 mb-6">Selecione o tipo de refeição:</p>
            
            <div className="space-y-3">
              {[
                { name: 'Café da Manhã', icon: '🍳' },
                { name: 'Almoço', icon: '🍽️' },
                { name: 'Jantar', icon: '🍲' },
                { name: 'Lanche', icon: '🍎' },
              ].map((meal, index) => (
                <button
                  key={index}
                  onClick={() => handleMealTypeSelect(meal.name)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <span className="text-3xl">{meal.icon}</span>
                  <span className="font-semibold text-lg">{meal.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMealDialog(false)}
              className="w-full mt-6 p-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Image Options Dialog */}
      {showImageOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Como deseja adicionar?</h3>
            <p className="text-gray-600 mb-6">Escolha uma opção para adicionar sua {selectedMealType}:</p>
            
            <div className="space-y-3">
              <button
                onClick={handleOpenCamera}
                className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl rounded-xl transition-all"
              >
                <Camera className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Tirar Foto</p>
                  <p className="text-sm opacity-90">Abrir câmera</p>
                </div>
              </button>

              <button
                onClick={handleOpenGallery}
                className="w-full flex items-center gap-4 p-5 bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:shadow-xl rounded-xl transition-all"
              >
                <ImageIcon className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Escolher da Galeria</p>
                  <p className="text-sm opacity-90">Selecionar foto existente</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowImageOptions(false);
                setSelectedMealType(null);
              }}
              className="w-full mt-6 p-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Route Dialog */}
      {showRouteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Percurso Registrado</h3>
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl p-4">
                <p className="text-sm opacity-90 mb-1">Distância Total</p>
                <p className="text-3xl font-bold">{distance.toFixed(2)} km</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Tempo</p>
                  <p className="text-xl font-bold">{formatTime(trackingTime)}</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Pontos</p>
                  <p className="text-xl font-bold">{route.length}</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Calorias Estimadas</p>
                <p className="text-xl font-bold text-orange-600">{Math.round(distance * 50)} kcal</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                Coordenadas do Percurso
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {route.map((location, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Ponto {index + 1}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(location.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      <p>Lat: {location.latitude.toFixed(6)}</p>
                      <p>Lon: {location.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowRouteDialog(false)}
              className="w-full p-4 bg-gradient-to-br from-orange-400 to-red-500 text-white hover:shadow-xl rounded-xl font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-purple-500" />
            <h3 className="text-2xl font-bold mb-2">Analisando...</h3>
            <p className="text-gray-600">
              Nossa IA está identificando os alimentos e calculando as calorias da sua refeição.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
