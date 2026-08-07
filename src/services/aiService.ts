export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isServiceUnavailable?: boolean;
  citations?: string[];
}

export async function askAssistant(
  _query: string,
  _contextMessages: AIMessage[] = []
): Promise<AIMessage> {
  // Simulating network latency for realistic UX transition
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    id: `assistant-${Date.now()}`,
    sender: 'assistant',
    content:
      'The AI retrieval service is not connected yet. In Phase 2, this interface will perform vector similarity search over catalog embeddings (via FastAPI + ChromaDB) to return grounded recommendations.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isServiceUnavailable: true,
    citations: ['ShopSmart RAG Architecture Spec v1.0', 'ChromaDB Vector Store (Pending Connection)'],
  };
}
