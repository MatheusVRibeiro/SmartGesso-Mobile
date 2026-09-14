import { addMutation, getPendingMutations, markAsProcessing, markAsCompleted, markAsFailed } from './syncQueue';
import NetInfo from '@react-native-community/netinfo';
import { config } from '../../constants/config';
import { SecureTokenStorage } from '../auth/SecureTokenStorage';

/**
 * Processador de fila de sincronização offline.
 * 
 * Processa mutações pendentes quando o dispositivo volta
 * a ficar online, com suporte a retry e backoff exponencial.
 */

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 segundo
const MAX_DELAY = 30000; // 30 segundos

/** Base URL da API — mesma fonte do client axios (EXPO_PUBLIC_API_URL / __DEV__). */
const API_BASE_URL = config.apiUrl;

/**
 * Calcula delay com backoff exponencial.
 */
function getExponentialBackoff(retries: number): number {
  const delay = Math.min(BASE_DELAY * Math.pow(2, retries), MAX_DELAY);
  // Adiciona jitter para evitar thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Processa uma mutação individual.
 */
async function processMutation(mutation: any): Promise<boolean> {
  try {
    console.log(`[Processor] Processando mutação: ${mutation.id}`);
    
    // Marca como processando
    await markAsProcessing(mutation.id);
    
    // V5 ETAPA 11 — nunca enviar requisição sem autenticação.
    const token = await SecureTokenStorage.getAccessToken();
    if (!token) {
      console.error(`[Processor] Sem token de acesso — mutação ${mutation.id} marcada como failed`);
      await markAsFailed(mutation.id, MAX_RETRIES);
      return false;
    }
    
    // Faz a requisição HTTP (base URL + Authorization)
    const response = await fetch(`${API_BASE_URL}${mutation.endpoint}`, {
      method: mutation.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mutation.body),
    });
    
    if (response.ok) {
      console.log(`[Processor] Mutação ${mutation.id} processada com sucesso`);
      await markAsCompleted(mutation.id);
      return true;
    } else {
      console.error(`[Processor] Erro HTTP ${response.status} para mutação ${mutation.id}`);
      await markAsFailed(mutation.id, MAX_RETRIES);
      return false;
    }
  } catch (error) {
    console.error(`[Processor] Erro ao processar mutação ${mutation.id}:`, error);
    await markAsFailed(mutation.id, MAX_RETRIES);
    return false;
  }
}

/**
 * Processa todas as mutações pendentes.
 */
export async function processPendingMutations(): Promise<void> {
  const pendingMutations = await getPendingMutations();
  
  if (pendingMutations.length === 0) {
    console.log('[Processor] Nenhuma mutação pendente');
    return;
  }
  
  console.log(`[Processor] Processando ${pendingMutations.length} mutações pendentes`);
  
  // Processa em ordem FIFO
  for (const mutation of pendingMutations) {
    // Verifica se ainda está online antes de processar
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('[Processor] Dispositivo offline, parando processamento');
      break;
    }
    
    // Se já está processando, pula
    if (mutation.status === 'processing') {
      continue;
    }
    
    const success = await processMutation(mutation);
    
    // Se falhou e tem retries disponíveis, espera antes de processar a próxima
    if (!success && mutation.status === 'pending') {
      const delay = getExponentialBackoff(mutation.retries);
      console.log(`[Processor] Aguardando ${delay}ms antes da próxima tentativa`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Inicia listener para processar fila quando voltar online.
 */
export function startSyncListener(): () => void {
  console.log('[Processor] Iniciando listener de sincronização');
  
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('[Processor] Dispositivo online, processando fila');
      // Processa mutações pendentes quando voltar online
      processPendingMutations().catch(console.error);
    }
  });
  
  // Processa mutações pendentes imediatamente ao iniciar
  processPendingMutations().catch(console.error);
  
  return unsubscribe;
}

/**
 * Adiciona mutação e tenta processar imediatamente se online.
 */
export async function addMutationWithSync(
  mutation: Omit<import('./syncQueue').PendingMutation, 'id' | 'createdAt' | 'retries' | 'status'>
): Promise<void> {
  const addedMutation = await addMutation(mutation);
  
  // Verifica se está online para processar imediatamente
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected && netInfo.isInternetReachable) {
    console.log('[Processor] Processando mutação imediatamente');
    await processMutation(addedMutation);
  }
}
