// Banco de dados de exercícios e treinos
export interface Exercise {
  id: string;
  name: string;
  duration: number; // segundos
  reps?: number;
  rest: number; // segundos de descanso após
  instructions: string[];
  image: string;
  muscleGroup: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Banco de exercícios
export const exerciseBank: Exercise[] = [
  {
    id: 'pushup',
    name: 'Flexão de Braço',
    duration: 45,
    reps: 15,
    rest: 15,
    instructions: [
      'Posicione as mãos na largura dos ombros',
      'Mantenha o corpo reto da cabeça aos pés',
      'Desça até o peito quase tocar o chão',
      'Empurre com força para subir'
    ],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    muscleGroup: 'Peito e Tríceps'
  },
  {
    id: 'squat',
    name: 'Agachamento',
    duration: 45,
    reps: 20,
    rest: 15,
    instructions: [
      'Pés na largura dos ombros',
      'Desça como se fosse sentar em uma cadeira',
      'Mantenha os joelhos alinhados com os pés',
      'Suba empurrando pelos calcanhares'
    ],
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
    muscleGroup: 'Pernas e Glúteos'
  },
  {
    id: 'burpee',
    name: 'Burpee',
    duration: 45,
    reps: 12,
    rest: 20,
    instructions: [
      'Comece em pé',
      'Agache e apoie as mãos no chão',
      'Jogue os pés para trás (prancha)',
      'Volte os pés e pule para cima'
    ],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    muscleGroup: 'Corpo Inteiro'
  },
  {
    id: 'plank',
    name: 'Prancha',
    duration: 60,
    rest: 15,
    instructions: [
      'Apoie os antebraços e pontas dos pés',
      'Mantenha o corpo reto como uma tábua',
      'Contraia o abdômen',
      'Não deixe o quadril cair'
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    muscleGroup: 'Core'
  },
  {
    id: 'jumpingjack',
    name: 'Polichinelo',
    duration: 45,
    reps: 30,
    rest: 15,
    instructions: [
      'Comece com pés juntos e braços ao lado',
      'Pule abrindo pernas e levantando braços',
      'Retorne à posição inicial',
      'Mantenha ritmo constante'
    ],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
    muscleGroup: 'Cardio'
  },
  {
    id: 'mountainclimber',
    name: 'Escalador',
    duration: 45,
    reps: 30,
    rest: 15,
    instructions: [
      'Posição de prancha alta',
      'Traga um joelho em direção ao peito',
      'Alterne as pernas rapidamente',
      'Mantenha o core contraído'
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    muscleGroup: 'Core e Cardio'
  },
  {
    id: 'lunge',
    name: 'Afundo',
    duration: 45,
    reps: 16,
    rest: 15,
    instructions: [
      'Dê um passo à frente',
      'Desça até formar 90° nos joelhos',
      'Joelho de trás quase toca o chão',
      'Alterne as pernas'
    ],
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop',
    muscleGroup: 'Pernas'
  },
  {
    id: 'crunches',
    name: 'Abdominal',
    duration: 45,
    reps: 25,
    rest: 15,
    instructions: [
      'Deite de costas, joelhos dobrados',
      'Mãos atrás da cabeça',
      'Levante os ombros do chão',
      'Contraia o abdômen'
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    muscleGroup: 'Abdômen'
  },
  {
    id: 'tricep-dips',
    name: 'Mergulho de Tríceps',
    duration: 45,
    reps: 15,
    rest: 15,
    instructions: [
      'Use uma cadeira ou banco',
      'Mãos na borda, dedos para frente',
      'Desça dobrando os cotovelos',
      'Empurre para subir'
    ],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    muscleGroup: 'Tríceps'
  },
  {
    id: 'high-knees',
    name: 'Corrida Parada',
    duration: 45,
    reps: 40,
    rest: 15,
    instructions: [
      'Corra no lugar',
      'Levante os joelhos até a altura do quadril',
      'Movimente os braços',
      'Mantenha ritmo acelerado'
    ],
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
    muscleGroup: 'Cardio'
  },
  {
    id: 'side-plank',
    name: 'Prancha Lateral',
    duration: 30,
    rest: 15,
    instructions: [
      'Deite de lado, apoie no antebraço',
      'Levante o quadril do chão',
      'Corpo em linha reta',
      'Faça dos dois lados'
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    muscleGroup: 'Core Lateral'
  },
  {
    id: 'bicycle-crunches',
    name: 'Abdominal Bicicleta',
    duration: 45,
    reps: 30,
    rest: 15,
    instructions: [
      'Deite de costas, mãos atrás da cabeça',
      'Leve cotovelo ao joelho oposto',
      'Alterne os lados em movimento de pedalar',
      'Mantenha core contraído'
    ],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    muscleGroup: 'Abdômen Oblíquo'
  }
];

// Gera treino do dia baseado na data
export function getDailyWorkout(date: Date = new Date()): Workout {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Shuffle baseado no dia do ano para variar
  const shuffled = [...exerciseBank].sort((a, b) => {
    const hashA = (dayOfYear * 31 + a.id.charCodeAt(0)) % 100;
    const hashB = (dayOfYear * 31 + b.id.charCodeAt(0)) % 100;
    return hashA - hashB;
  });
  
  // Seleciona 6 exercícios variados
  const selectedExercises = shuffled.slice(0, 6);
  
  const totalDuration = selectedExercises.reduce((sum, ex) => sum + ex.duration + ex.rest, 0);
  
  return {
    id: `workout-${dayOfYear}`,
    name: `Treino do Dia ${date.getDate()}/${date.getMonth() + 1}`,
    exercises: selectedExercises,
    totalDuration,
    difficulty: 'intermediate'
  };
}

// Calcula progresso do mês
export function getMonthProgress(completedDays: Set<string>): {
  completed: number;
  total: number;
  percentage: number;
} {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  
  const completed = completedDays.size;
  const percentage = (completed / currentDay) * 100;
  
  return {
    completed,
    total: daysInMonth,
    percentage: Math.min(percentage, 100)
  };
}
