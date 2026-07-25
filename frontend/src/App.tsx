import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, type NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KnowledgeLibraryView } from './components/KnowledgeLibraryView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { SourceDrawer } from './components/SourceDrawer';
import { FileUploadModal } from './components/FileUploadModal';
import { AuthModal } from './components/AuthModal';
import { apiClient, type UserProfile } from './api/client';
import type { DocumentItem, ChatMessage, Citation, SystemMetrics, SystemConfig } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(apiClient.getStoredUser());
  const [selectedCitations, setSelectedCitations] = useState<Citation[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Default system metrics
  const [metrics] = useState<SystemMetrics>({
    chromaLatencyMs: 12.4,
    embeddingModelLatencyMs: 48.2,
    throughputReqMin: 842,
    totalTokens: 1428204,
    cloudSyncTime: '3 mins ago',
    cacheHitRatioPercent: 92.4,
  });

  // Default System Configuration
  const [config, setConfig] = useState<SystemConfig>({
    vectorDbPath: './chroma_db',
    embeddingModelName: 'BAAI/bge-small-en-v1.5',
    chunkSize: 1000,
    chunkOverlap: 200,
    topK: 3,
    userId: currentUser?.user_id || '101',
  });

  // Load user profile & per-user data from FastAPI backend
  const loadInitialData = useCallback(async () => {
    try {
      await apiClient.checkHealth();
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }

    // Try fetching active user profile if token exists
    if (apiClient.getToken()) {
      try {
        const user = await apiClient.getMe();
        setCurrentUser(user);
      } catch {
        // invalid token
        apiClient.clearToken();
        setCurrentUser(null);
      }
    }

    try {
      setIsLoadingDocs(true);
      const docs = await apiClient.getDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load user documents', e);
    } finally {
      setIsLoadingDocs(false);
    }

    try {
      const history = await apiClient.getHistory();
      setMessages(history);
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(async () => {
      try {
        await apiClient.checkHealth();
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [loadInitialData]);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setConfig((prev) => ({ ...prev, userId: user.user_id }));
    loadInitialData();
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setCurrentUser(null);
    setDocuments([]);
    setMessages([]);
  };

  const handleSendMessage = async (query: string) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const res = await apiClient.sendQuery(query, currentUser?.user_id, config.topK);

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        citations: res.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error**: ${err.message || 'Unable to query user vector database.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await apiClient.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    } catch (e) {
      console.error('Failed to delete document', e);
    }
  };

  const handleClearChat = async () => {
    try {
      await apiClient.clearHistory();
      setMessages([]);
      setSelectedCitations(null);
    } catch (e) {
      console.error('Failed to clear history', e);
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b1326] text-[#dae2fd] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Layout Container (Stretches across 100% of remaining screen width) */}
      <div className="flex-1 ml-[260px] flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Sticky Top Navbar with Auth User status */}
        <Navbar
          isOnline={isOnline}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
          <div className="w-full max-w-[1600px] mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                documents={documents}
                metrics={metrics}
                onOpenUpload={() => setIsUploadOpen(true)}
                onDeleteDocument={handleDeleteDocument}
                onGoToChat={() => setActiveTab('chat')}
                onGoToLibrary={() => setActiveTab('library')}
              />
            )}

            {activeTab === 'library' && (
              <KnowledgeLibraryView
                documents={documents}
                onOpenUpload={() => setIsUploadOpen(true)}
                onDeleteDocument={handleDeleteDocument}
                onRefreshDocs={loadInitialData}
                onGoToChat={() => setActiveTab('chat')}
                isLoading={isLoadingDocs}
              />
            )}

            {activeTab === 'chat' && (
              <ChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                onClearChat={handleClearChat}
                onSelectCitation={(cits) => setSelectedCitations(cits)}
                documentCount={documents.length}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                config={config}
                onSaveConfig={(newCfg) => setConfig(newCfg)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Slide-over Source Chunks Drawer */}
      <SourceDrawer
        citations={selectedCitations}
        onClose={() => setSelectedCitations(null)}
      />

      {/* Upload PDF Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={loadInitialData}
      />

      {/* Login / Register Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
