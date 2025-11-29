'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Save, X, Upload, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface Exercise {
  id: string;
  name: string;
  image_url: string;
  instructions: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    setUser(currentUser);
    await loadWorkouts();
    setLoading(false);
  };

  const loadWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          order_position,
          exercises (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading workouts:', error);
      return;
    }

    const formattedWorkouts = data?.map(workout => ({
      ...workout,
      exercises: workout.workout_exercises
        ?.sort((a: any, b: any) => a.order_position - b.order_position)
        .map((we: any) => we.exercises) || []
    })) || [];

    setWorkouts(formattedWorkouts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-purple-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/10 to-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-700/50 text-purple-300 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-gray-400">Gerencie treinos e exercícios do PowerHit15</p>
        </div>

        {/* Workouts Section */}
        <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 rounded-2xl p-6 border border-purple-800/30 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Treinos</h2>
            <button
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Plus className="w-5 h-5" />
              Novo Treino
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map(workout => (
              <div key={workout.id} className="bg-black/30 rounded-xl p-4 border border-purple-900/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{workout.name}</h3>
                    <p className="text-sm text-gray-400">{workout.exercises?.length || 0} exercícios</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-700/50 text-blue-300 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-700/50 text-red-300 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {workout.description && (
                  <p className="text-sm text-gray-300 mb-3">{workout.description}</p>
                )}
                <div className="text-xs text-gray-500">
                  Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}