import { useState, useEffect } from 'react';
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
import { getConversations, getUserData, subscribeToMessages, sendMessage } from '@/lib/firestore';

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

// Mock conversation data removed

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;
      try {
        const convs = await getConversations(user.uid);
        const enhancedConvs = await Promise.all(convs.map(async (c) => {
            const otherUserData = c.otherUserId ? await getUserData(c.otherUserId) : null;
            return {
                id: c.id,
                patientName: (otherUserData as unknown as { displayName: string })?.displayName || 'Unknown User',
                lastMessage: c.lastMessage?.content || 'No messages yet',
                timestamp: c.lastMessage?.timestamp ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: 0, // Todo: implement unread count
                isOnline: false // Todo: implement presence
            };
        }));
        setConversations(enhancedConvs);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, [user]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
        const formattedMsgs = msgs.map(m => ({
            id: m.id || '',
            senderId: m.senderId,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: m.senderId === user?.uid
        }));
        setMessages(formattedMsgs);
    });

    return () => unsubscribe();
  }, [selectedConversation, user]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    try {
        await sendMessage({
            conversationId: selectedConversation.id,
            senderId: user.uid,
            receiverId: selectedConversation.id.split('_').find(id => id !== user.uid) || '',
            content: newMessage,
            type: 'text'
        });
        setNewMessage('');
    } catch (error) {
        console.error('Error sending message:', error);
    }
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
          {loading ? (
             <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
          ) : (
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
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
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
