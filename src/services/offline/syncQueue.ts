import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@smartgesso:offline-sync-queue';

export interface PendingMutation {
  id: string;
  type: 'payment' | 'expense' | 'serviceOrder';
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH';
  body: any;
  createdAt: number;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

/**
 * Sistema de fila de sincronização offline.
 * 
 * Persiste mutações no AsyncStorage e as processa quando
 * o dispositivo volta a ficar online. Suporta retry com
 * backoff exponencial (max 3 tentativas).
 */

// Função para gerar ID único
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Adiciona uma mutação à fila.
 */
export async function addMutation(
  mutation: Omit<PendingMutation, 'id' | 'createdAt' | 'retries' | 'status'>
): Promise<PendingMutation> {
  const queue = await getQueue();
  
  const newMutation: PendingMutation = {
    ...mutation,
    id: generateId(),
    createdAt: Date.now(),
    retries: 0,
    status: 'pending',
  };

  queue.push(newMutation);
  await saveQueue(queue);
  
  return newMutation;
}

/**
 * Obtém todas as mutações pendentes.
 */
export async function getPendingMutations(): Promise<PendingMutation[]> {
  const queue = await getQueue();
  return queue.filter(m => m.status === 'pending' || m.status === 'failed');
}

/**
 * Obtém a contagem de mutações pendentes.
 */
export async function getPendingCount(): Promise<number> {
  const pending = await getPendingMutations();
  return pending.length;
}

/**
 * Marca uma mutação como processando.
 */
export async function markAsProcessing(id: string): Promise<void> {
  const queue = await getQueue();
  const mutation = queue.find(m => m.id === id);
  
  if (mutation) {
    mutation.status = 'processing';
    await saveQueue(queue);
  }
}

/**
 * Marca uma mutação como concluída e remove da fila.
 */
export async function markAsCompleted(id: string): Promise<void> {
  const queue = await getQueue();
  const filteredQueue = queue.filter(m => m.id !== id);
  await saveQueue(filteredQueue);
}

/**
 * Incrementa o contador de tentativas e marca como failed se exceder máximo.
 */
export async function markAsFailed(id: string, maxRetries: number = 3): Promise<boolean> {
  const queue = await getQueue();
  const mutation = queue.find(m => m.id === id);
  
  if (mutation) {
    mutation.retries += 1;
    
    if (mutation.retries >= maxRetries) {
      mutation.status = 'failed';
    } else {
      mutation.status = 'pending';
    }
    
    await saveQueue(queue);
    return mutation.status === 'pending';
  }
  
  return false;
}

/**
 * Remove uma mutação específica da fila.
 */
export async function removeMutation(id: string): Promise<void> {
  const queue = await getQueue();
  const filteredQueue = queue.filter(m => m.id !== id);
  await saveQueue(filteredQueue);
}

/**
 * Limpa todas as mutações da fila.
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Obtém a fila completa (para debug).
 */
export async function getQueue(): Promise<PendingMutation[]> {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[SyncQueue] Erro ao ler fila:', error);
    return [];
  }
}

/**
 * Salva a fila no AsyncStorage.
 */
async function saveQueue(queue: PendingMutation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[SyncQueue] Erro ao salvar fila:', error);
  }
}
