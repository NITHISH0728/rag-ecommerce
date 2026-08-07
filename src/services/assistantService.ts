export interface ChatRequest {
  message: string;
  session_id?: string;
  conversation_id?: string;
  filters?: {
    category?: string | null;
    brand?: string | null;
    minimum_price?: number | null;
    maximum_price?: number | null;
    minimum_rating?: number | null;
    stock_status?: string | null;
    featured?: boolean | null;
  };
  stream?: boolean;
}

export interface ProductCitation {
  citation_id: string;
  product_id: string;
  product_name: string;
  slug: string;
  chunk_ids: string[];
  matched_sections: string[];
}

export interface RecommendedProduct {
  product_id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  rating: float;
  stock: number;
  stock_status: string;
  warranty: string;
  image: string;
  reason: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
  citations: ProductCitation[];
  products: RecommendedProduct[];
  applied_filters: Record<string, any>;
  retrieval_status: string;
  grounded: boolean;
  follow_up_suggestions: string[];
}

export interface ChatStreamEvent {
  event: string; // "retrieval_started", "filters_applied", "products_retrieved", "generation_started", "token", "citations", "products", "suggestions", "completed", "error"
  data: any;
}

export interface AssistantHealth {
  status: string;
  groq: {
    configured: boolean;
    reachable: boolean;
    model: string;
  };
  embedding: {
    provider: string;
    model: string;
    dimension: number;
  };
  vector_store: {
    reachable: boolean;
    collection: string;
    record_count: number;
  };
}

const BACKEND_URL = 'http://localhost:8000';

export async function askAssistantREST(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${BACKEND_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...request, stream: false }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Assistant REST query failed.');
  }

  return response.json();
}

export async function askAssistantStream(
  request: ChatRequest,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || 'Assistant streaming request failed.');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream reader is not available.');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    
    // Parse SSE lines
    // Lines are formatted as:
    // event: <event_name>\ndata: <json_payload>\n\n
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || ''; // Keep partial line in buffer

    for (const chunk of lines) {
      if (!chunk.trim()) continue;

      const eventMatch = chunk.match(/^event:\s*(.+)$/m);
      const dataMatch = chunk.match(/^data:\s*(.+)$/m);

      if (eventMatch && dataMatch) {
        try {
          const event = eventMatch[1].trim();
          const data = JSON.parse(dataMatch[1].trim());
          onEvent({ event, data });
        } catch (e) {
          console.error('Error parsing SSE event details:', e, chunk);
        }
      }
    }
  }
}

export async function getAssistantHealth(): Promise<AssistantHealth> {
  const response = await fetch(`${BACKEND_URL}/api/v1/assistant/health`);
  if (!response.ok) {
    throw new Error('Failed to fetch assistant health status.');
  }
  return response.json();
}

export async function clearConversation(conversationId: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/v1/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to clear conversation session.');
  }
}
