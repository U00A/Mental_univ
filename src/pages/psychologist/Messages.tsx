import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Send, 
  Paperclip,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

// Mock conversation data
const initialConversations: Conversation[] = [
  { id: '1', patientName: 'Sarah Connor', lastMessage: 'Thank you for the session today!', timestamp: '2m ago', unread: 2, isOnline: true },
  { id: '2', patientName: 'John Smith', lastMessage: 'See you next week', timestamp: '1h ago', unread: 0, isOnline: false },
  { id: '3', patientName: 'Emily Davis', lastMessage: 'Can we reschedule?', timestamp: '3h ago', unread: 1, isOnline: true },
  { id: '4', patientName: 'Michael Brown', lastMessage: 'I have a question about...', timestamp: '1d ago', unread: 0, isOnline: false },
];

export default function Messages() {
  const { user } = useAuth();
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessages([
      { id: '1', senderId: conv.id, content: 'Hello Dr., I wanted to ask about our last session.', timestamp: '10:30 AM', isOwn: false },
      { id: '2', senderId: user?.uid || '', content: 'Of course! What would you like to discuss?', timestamp: '10:32 AM', isOwn: true },
      { id: '3', senderId: conv.id, content: conv.lastMessage, timestamp: '10:35 AM', isOwn: false },
    ]);
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: user?.uid || '',
      content: newMessage,
      timestamp: 'Just now',
      isOwn: true
    }]);
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(c => 
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                selectedConversation?.id === conv.id ? 'bg-primary/5' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                  {conv.patientName.charAt(0)}
                </div>
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{conv.patientName}</h3>
                  <span className="text-xs text-gray-400">{conv.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                  {selectedConversation.patientName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.patientName}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.isOwn 
                      ? 'bg-primary text-white rounded-br-md' 
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button 
                  onClick={handleSend}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
