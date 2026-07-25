import type { DocumentItem, Citation, ChatMessage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  getToken(): string | null {
    return localStorage.getItem('rag_token');
  },

  setToken(token: string) {
    localStorage.setItem('rag_token', token);
  },

  clearToken() {
    localStorage.removeItem('rag_token');
    localStorage.removeItem('rag_user');
  },

  getStoredUser(): UserProfile | null {
    const raw = localStorage.getItem('rag_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  },

  setStoredUser(user: UserProfile) {
    localStorage.setItem('rag_user', JSON.stringify(user));
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  async checkHealth(): Promise<{ status: string; version: string; default_user: string }> {
    const res = await fetch(`${API_BASE_URL}/`);
    if (!res.ok) throw new Error(`API health check failed with status ${res.status}`);
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }

    const data = await res.json();
    this.setToken(data.token);
    this.setStoredUser(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    this.setToken(data.token);
    this.setStoredUser(data.user);
    return data;
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...this.getAuthHeaders() },
    });

    if (!res.ok) throw new Error('Failed to fetch user profile');
    const data = await res.json();
    this.setStoredUser(data);
    return data;
  },

  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ status: string; document_id: string; filename: string; message: string; chunks_count?: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.detail || `Upload failed (${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },

  async sendQuery(
    question: string,
    userId?: string,
    topK: number = 3
  ): Promise<{ status: string; question: string; answer: string; citations: Citation[] }> {
    const user = this.getStoredUser();
    const activeUserId = userId || user?.user_id;

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({
        question,
        user_id: activeUserId,
        top_k: topK,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
      throw new Error(err.detail || 'Failed to generate response');
    }

    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE_URL}/documents`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.documents || [];
  },

  async deleteDocument(documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/documents/${encodeURIComponent(documentId)}`, {
      method: 'DELETE',
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async getHistory(): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE_URL}/history`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    const data = await res.json();

    const rawHistory = data.history || [];
    const messages: ChatMessage[] = [];

    for (const turn of rawHistory) {
      messages.push({
        id: `${turn.id}_q`,
        role: 'user',
        content: turn.question,
        timestamp: turn.timestamp,
      });
      messages.push({
        id: `${turn.id}_a`,
        role: 'assistant',
        content: turn.answer,
        citations: turn.citations || [],
        timestamp: turn.timestamp,
      });
    }
    return messages;
  },

  async clearHistory(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/history`, {
      method: 'DELETE',
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to clear history');
  },
};
