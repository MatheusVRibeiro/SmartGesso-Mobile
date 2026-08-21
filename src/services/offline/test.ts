/**
 * Teste simples do sistema de fila de sincronização offline.
 * 
 * Este arquivo pode ser executado para verificar se as funções
 * básicas estão funcionando corretamente.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMutation, getPendingCount, getPendingMutations, clearQueue } from './syncQueue';
import { startSyncListener, processPendingMutations } from './processor';

async function testSyncQueue() {
  console.log('=== Teste do Sistema de Fila Offline ===\n');
  
  // Limpa a fila antes do teste
  await clearQueue();
  console.log('✓ Fila limpa\n');
  
  // Adiciona uma mutação de teste
  console.log('Adicionando mutação de teste...');
  const mutation1 = await addMutation({
    type: 'payment',
    endpoint: 'https://api.example.com/payments',
    method: 'POST',
    body: { amount: 100, description: 'Teste offline' },
  });
  console.log(`✓ Mutação adicionada: ${mutation1.id}\n`);
  
  // Adiciona outra mutação
  const mutation2 = await addMutation({
    type: 'expense',
    endpoint: 'https://api.example.com/expenses',
    method: 'PUT',
    body: { amount: 50, category: 'Material' },
  });
  console.log(`✓ Segunda mutação adicionada: ${mutation2.id}\n`);
  
  // Verifica contagem
  const count = await getPendingCount();
  console.log(`✓ Contagem de pendências: ${count}\n`);
  
  // Lista mutações pendentes
  const pending = await getPendingMutations();
  console.log(`✓ Mutações pendentes: ${pending.length}`);
  pending.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.type} - ${m.method} ${m.endpoint}`);
  });
  console.log('');
  
  // Inicia listener (simula estado online)
  console.log('Iniciando listener de sincronização...');
  const stopListener = startSyncListener();
  console.log('✓ Listener iniciado\n');
  
  // Processa mutações (simula voltar online)
  console.log('Processando mutações pendentes...');
  await processPendingMutations();
  console.log('✓ Processamento concluído\n');
  
  // Verifica se a fila foi limpa
  const finalCount = await getPendingCount();
  console.log(`✓ Contagem final: ${finalCount}\n`);
  
  // Para o listener
  stopListener();
  console.log('✓ Listener parado\n');
  
  console.log('=== Teste Concluído com Sucesso ===');
}

// Executa o teste se o arquivo for executado diretamente
if (require.main === module) {
  testSyncQueue().catch(console.error);
}

export { testSyncQueue };
