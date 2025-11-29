'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Trophy, Target, Flame, CheckCircle2, Clock, Zap, Pause, SkipForward, X, Volume2, VolumeX, LogOut } from 'lucide-react';
import { getDailyWorkout, type Exercise, type Workout } from '@/lib/workouts';
import { supabase, type WorkoutProgress } from '@/lib/supabase';
import { getCurrentUser, signOut } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica autenticação e carrega dados
  useEffect(() => {
    async function loadUserData() {
      const user = await getCurrentUser();
      
      if (!user) {
        router.push('/auth');
        return;
      }

      setUserId(user.id);

      // Carrega progresso do mês do Supabase
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: progressData } = await supabase
        .from('workout_progress')
        .select('workout_date')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('workout_date', startOfMonth.toISOString().split('T')[0]);

      if (progressData) {
        const dates = new Set(progressData.map(p => p.workout_date));
        setCompletedDays(dates);
      }

      // Carrega meta semanal do perfil
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('weekly_goal')
        .eq('id', user.id)
        .single();

      if (profileData?.weekly_goal) {
        setWeeklyGoal(profileData.weekly_goal);
      }

      // Carrega preferência de som do localStorage
      const savedSound = localStorage.getItem('soundEnabled');
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }

      // Carrega treino do dia
      setWorkout(getDailyWorkout());
      setLoading(false);
    }

    loadUserData();
  }, [router]);

  // Timer do exercício
  useEffect(() => {
    if (!isWorkoutActive || isPaused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleExerciseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWorkoutActive, isPaused, timeRemaining]);

  const handleExerciseComplete = () => {
    if (!workout) return;

    if (isResting) {
      // Acabou o descanso, próximo exercício
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setIsResting(false);
        setTimeRemaining(workout.exercises[currentExerciseIndex + 1].duration);
      } else {
        // Treino completo!
        completeWorkout();
      }
    } else {
      // Acabou o exercício, inicia descanso
      setIsResting(true);
      setTimeRemaining(workout.exercises[currentExerciseIndex].rest);
    }
  };

  const startWorkout = () => {
    if (!workout) return;
    setIsWorkoutActive(true);
    setIsPaused(false);
    setCurrentExerciseIndex(0);
    setIsResting(false);
    setTimeRemaining(workout.exercises[0].duration);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipExercise = () => {
    if (!workout) return;
    
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsResting(false);
      setTimeRemaining(workout.exercises[currentExerciseIndex + 1].duration);
    } else {
      completeWorkout();
    }
  };

  const stopWorkout = () => {
    setShowStopModal(true);
  };

  const confirmStop = () => {
    setIsWorkoutActive(false);
    setIsPaused(false);
    setCurrentExerciseIndex(0);
    setShowStopModal(false);
  };

  const completeWorkout = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (userId) {
      // Salva progresso no Supabase
      await supabase.from('workout_progress').insert({
        user_id: userId,
        workout_date: today,
        completed: true,
        exercises_completed: workout?.exercises.length || 0,
        total_exercises: workout?.exercises.length || 0,
        duration_seconds: workout?.totalDuration || 0,
      });

      // Atualiza estado local
      const newCompleted = new Set(completedDays);
      newCompleted.add(today);
      setCompletedDays(newCompleted);
    }
    
    setIsWorkoutActive(false);
    setIsPaused(false);
    setCurrentExerciseIndex(0);
  };

  const updateGoal = async (goal: number) => {
    setWeeklyGoal(goal);
    
    if (userId) {
      // Atualiza meta no Supabase
      await supabase
        .from('user_profiles')
        .upsert({ id: userId, weekly_goal: goal });
    }
    
    setShowGoalModal(false);
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue.toString());
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const getMonthProgress = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const completed = completedDays.size;
    const percentage = (completed / currentDay) * 100;
    
    return {
      completed,
      total: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
      percentage: Math.min(percentage, 100)
    };
  };

  const progress = getMonthProgress();
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = completedDays.has(today);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black flex items-center justify-center">
        <div className="animate-pulse">
          <Zap className="w-12 h-12 text-purple-500" />
        </div>
      </div>
    );
  }

  if (!workout) return null;

  // Tela de execução do treino
  if (isWorkoutActive) {
    const currentExercise = workout.exercises[currentExerciseIndex];
    const progressPercent = ((currentExerciseIndex + (isResting ? 1 : 0.5)) / workout.exercises.length) * 100;
    const totalExercises = workout.exercises.length;

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white flex flex-col">
        {/* Header com progresso e controles */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-900/40 flex items-center justify-center border border-purple-700/50">
                <span className="text-sm font-bold text-purple-300">
                  {currentExerciseIndex + 1}/{totalExercises}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold">Exercício {currentExerciseIndex + 1}</div>
                <div className="text-xs text-gray-500">de {totalExercises}</div>
              </div>
            </div>
            
            <button
              onClick={toggleSound}
              className="w-10 h-10 rounded-full bg-purple-900/40 flex items-center justify-center border border-purple-700/50 hover:bg-purple-800/40 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-purple-300" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transition-all duration-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
          {/* Timer circular grande */}
          <div className="relative mb-6">
            <svg className="w-56 h-56 -rotate-90" viewBox="0 0 200 200">
              {/* Círculo de fundo */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(88, 28, 135, 0.2)"
                strokeWidth="12"
              />
              {/* Círculo de progresso */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - timeRemaining / (isResting ? currentExercise.rest : currentExercise.duration))}`}
                className="transition-all duration-1000 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Timer no centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-bold tracking-tight">
                {timeRemaining}
              </div>
              <div className="text-sm text-gray-400 mt-1">segundos</div>
            </div>
          </div>

          {/* Status e informações do exercício */}
          {isResting ? (
            <div className="text-center mb-6 animate-pulse">
              <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-700/50 rounded-full px-6 py-2 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-lg font-bold text-blue-400">Descanso</span>
              </div>
              <div className="text-gray-400 text-sm">Prepare-se para o próximo exercício</div>
              {currentExerciseIndex < totalExercises - 1 && (
                <div className="mt-3 text-purple-300 text-sm">
                  Próximo: {workout.exercises[currentExerciseIndex + 1].name}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center max-w-md w-full mb-6">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                {currentExercise.name}
              </h2>
              
              {/* Imagem do exercício */}
              <div className="mb-4 relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent rounded-2xl z-10" />
                <img
                  src={currentExercise.image}
                  alt={currentExercise.name}
                  className="w-full h-56 object-cover rounded-2xl shadow-2xl border border-purple-800/30"
                />
                {currentExercise.reps && (
                  <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-purple-700/50">
                    <div className="text-2xl font-bold text-purple-300">
                      {currentExercise.reps} repetições
                    </div>
                  </div>
                )}
              </div>
              
              {/* Grupo muscular */}
              <div className="inline-flex items-center gap-2 bg-purple-950/40 border border-purple-800/50 rounded-full px-4 py-1.5 mb-4">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">{currentExercise.muscleGroup}</span>
              </div>

              {/* Instruções */}
              {!isPaused && (
                <div className="bg-gradient-to-br from-purple-950/50 to-purple-900/30 rounded-2xl p-4 border border-purple-800/40 backdrop-blur-sm">
                  <div className="text-xs font-semibold text-purple-400 mb-3 uppercase tracking-wide">
                    Como executar
                  </div>
                  <div className="space-y-2.5">
                    {currentExercise.instructions.map((instruction, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-purple-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-purple-300">{idx + 1}</span>
                        </div>
                        <span className="text-sm text-gray-300 leading-relaxed">{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensagem de pausa */}
          {isPaused && (
            <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-2xl px-6 py-4 mb-4 animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <Pause className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Treino Pausado</span>
              </div>
            </div>
          )}
        </div>

        {/* Controles fixos na parte inferior */}
        <div className="p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            {/* Botão Parar */}
            <button
              onClick={stopWorkout}
              className="flex-1 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95"
            >
              <X className="w-5 h-5" />
              Parar
            </button>

            {/* Botão Pausar/Continuar */}
            <button
              onClick={togglePause}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] active:scale-95"
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  Continuar
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  Pausar
                </>
              )}
            </button>

            {/* Botão Próximo */}
            <button
              onClick={skipExercise}
              className="flex-1 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/50 text-purple-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
            >
              <SkipForward className="w-5 h-5" />
              Próximo
            </button>
          </div>
        </div>

        {/* Modal de confirmação para parar */}
        {showStopModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-purple-950 to-black rounded-2xl p-6 max-w-sm w-full border border-purple-800/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800/50">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Parar Treino?</h3>
                <p className="text-gray-400 text-sm">
                  Você perderá o progresso deste treino. Tem certeza?
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStopModal(false)}
                  className="flex-1 py-3 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/50 text-purple-300 rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmStop}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Sim, Parar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tela principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white">
      <div className="max-w-md mx-auto p-6 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                PowerHit15
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/50 text-purple-300 transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm text-center">Transforme seu corpo em 15 minutos</p>
        </div>

        {/* Progresso do Mês */}
        <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 rounded-2xl p-6 mb-6 border border-purple-800/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-semibold">Progresso do Mês</span>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Target className="w-4 h-4" />
              Meta
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-bold">{progress.completed}</span>
            <span className="text-gray-400">dias treinados</span>
          </div>
          
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{Math.round(progress.percentage)}% do mês</span>
            <span>Meta: {weeklyGoal}x/semana</span>
          </div>
        </div>

        {/* Treino do Dia */}
        <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 rounded-2xl p-6 border border-purple-800/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">{workout.name}</h2>
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.ceil(workout.totalDuration / 60)} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>{workout.exercises.length} exercícios</span>
            </div>
          </div>

          {/* Lista de exercícios */}
          <div className="space-y-3 mb-6">
            {workout.exercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 bg-black/30 rounded-xl p-3 border border-purple-900/20"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{exercise.name}</div>
                  <div className="text-xs text-gray-400">
                    {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`} • {exercise.rest}s descanso
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de iniciar */}
          {isCompletedToday ? (
            <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-semibold">Treino Completo!</div>
              <div className="text-sm text-gray-400 mt-1">Volte amanhã para novo desafio</div>
            </div>
          ) : (
            <button
              onClick={startWorkout}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105"
            >
              <Play className="w-6 h-6" />
              Iniciar Treino
            </button>
          )}
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-950/30 rounded-xl p-4 text-center border border-purple-900/20">
            <div className="text-2xl font-bold text-purple-400">{progress.completed}</div>
            <div className="text-xs text-gray-400 mt-1">Dias</div>
          </div>
          <div className="bg-purple-950/30 rounded-xl p-4 text-center border border-purple-900/20">
            <div className="text-2xl font-bold text-purple-400">{progress.completed * 15}</div>
            <div className="text-xs text-gray-400 mt-1">Minutos</div>
          </div>
          <div className="bg-purple-950/30 rounded-xl p-4 text-center border border-purple-900/20">
            <div className="text-2xl font-bold text-purple-400">{Math.round(progress.percentage)}%</div>
            <div className="text-xs text-gray-400 mt-1">Progresso</div>
          </div>
        </div>
      </div>

      {/* Modal de Meta */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-950 to-black rounded-2xl p-6 max-w-sm w-full border border-purple-800/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <h3 className="text-2xl font-bold mb-4 text-center">Defina sua Meta</h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              Quantos dias por semana você quer treinar?
            </p>
            
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[3, 4, 5, 6].map(goal => (
                <button
                  key={goal}
                  onClick={() => updateGoal(goal)}
                  className={`py-4 rounded-xl font-bold transition-all ${
                    weeklyGoal === goal
                      ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]'
                      : 'bg-purple-950/30 text-gray-400 hover:bg-purple-900/40 border border-purple-900/20'
                  }`}
                >
                  {goal}x
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
