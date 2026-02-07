import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Search, Phone, Video, MoreVertical, Mic, Smile, X, ChevronLeft, Loader2, Image, File, Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CrisisInterventionModal from '@/components/tools/CrisisInterventionModal';
import PanicHelper from '@/components/tools/PanicHelper';
import { uploadAudio, uploadImage, uploadFile } from '@/lib/storage';
import { 
  subscribeToMessages, 
  sendMessage, 
  getConversations, 
  getUserData,
  markMessageAsRead,
  addReaction,
  removeReaction,
  deleteMessage,
  editMessage,
  setTypingStatus,
  subscribeToTypingStatus,
  updateUserPresence,
  subscribeToUserPresence,
  getUnreadMessageCount,
  searchMessages,
  type Message,
  type ReactionType,
  type UserPresence
} from '@/lib/firestore';
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import VoicePlayer from '@/components/chat/VoicePlayer';
import MessageReactions from '@/components/chat/MessageReactions';
import MessageStatus from '@/components/chat/MessageStatus';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ReplyPreview from '@/components/chat/ReplyPreview';
import MessageMenu from '@/components/chat/MessageMenu';
import EmojiPicker from '@/components/chat/EmojiPicker';
import OnlineStatus from '@/components/chat/OnlineStatus';
import ImageMessage from '@/components/chat/ImageMessage';
import FileMessage from '@/components/chat/FileMessage';

const stickerPack = [
  'https://cdn-icons-png.flaticon.com/512/742/742751.png', // Happy
  'https://cdn-icons-png.flaticon.com/512/742/742752.png', // Sad
  'https://cdn-icons-png.flaticon.com/512/742/742760.png', // Angry
  'https://cdn-icons-png.flaticon.com/512/742/742920.png', // Surprised
  'https://cdn-icons-png.flaticon.com/512/742/742750.png', // Love
  'https://cdn-icons-png.flaticon.com/512/742/742823.png', // Cool
  'https://cdn-icons-png.flaticon.com/512/742/742813.png', // Supportive Heart
  'https://cdn-icons-png.flaticon.com/512/742/742910.png', // Worried
  'https://cdn-icons-png.flaticon.com/512/742/742761.png', // Thinking
  'https://cdn-icons-png.flaticon.com/512/742/742753.png', // Winking
  'https://cdn-icons-png.flaticon.com/512/742/742921.png', // Crying
];

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself', 'self-harm',
  'cutting', 'overdose', 'hanging', 'jumping', 'no reason to live'
];

interface ChatConversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  otherUserId: string;
}

export default function Messages() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [otherUserPresence, setOtherUserPresence] = useState<UserPresence | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Audio / Sticker Logic
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Crisis Intervention State
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showPanicHelper, setShowPanicHelper] = useState(false);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // Edit State
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Conversations
  useEffect(() => {
    async function fetchInbox() {
      if (!user) return;
      try {
        const convs = await getConversations(user.uid);
        const inboxData = await Promise.all(convs.map(async (c) => {
          const userData = await getUserData(c.otherUserId!) as any;
          const unreadCount = await getUnreadMessageCount(user.uid, c.id);
          return {
            id: c.id,
            name: userData?.displayName || 'User',
            lastMessage: c.lastMessage.content,
            time: c.lastMessage.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
            unread: unreadCount,
            otherUserId: c.otherUserId!
          };
        }));
        setConversations(inboxData);
      } catch (err) {
        console.error('Error fetching inbox:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInbox();
  }, [user]);

  // Subscribe to Messages
  useEffect(() => {
    if (!conversationId || !user) return;
    
    // Get other user info for header
    const otherId = conversationId.split('_').find(uid => uid !== user.uid);
    if (otherId) {
      getUserData(otherId).then(setOtherUser);
    }

    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      // Mark messages as read
      msgs.forEach(msg => {
        if (msg.receiverId === user.uid && !msg.read) {
          markMessageAsRead(msg.id!);
        }
      });
    });
    return () => unsubscribe();
  }, [conversationId, user]);

  // Subscribe to typing status
  useEffect(() => {
    if (!conversationId || !user) return;
    
    const unsubscribe = subscribeToTypingStatus(conversationId, user.uid, (typing) => {
      setIsTyping(typing);
    });
    
    return () => unsubscribe();
  }, [conversationId, user]);

  // Subscribe to other user's presence
  useEffect(() => {
    if (!otherUser?.uid) return;
    
    const unsubscribe = subscribeToUserPresence(otherUser.uid, (presence) => {
      setOtherUserPresence(presence);
    });
    
    return () => unsubscribe();
  }, [otherUser?.uid]);

  // Update current user presence
  useEffect(() => {
    if (!user) return;
    
    const updatePresence = () => {
      updateUserPresence(user.uid, true, conversationId);
    };
    
    updatePresence();
    
    const interval = setInterval(updatePresence, 30000); // Update every 30 seconds
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserPresence(user.uid, false);
      } else {
        updatePresence();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateUserPresence(user.uid, false);
    };
  }, [user, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (conversationId && user) {
      setTypingStatus(conversationId, user.uid, true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(conversationId, user.uid, false);
      }, 3000);
    }
  };

  // Voice Recording Handlers
  const handleVoiceSend = async (blob: Blob, duration: string) => {
    if (!user || !conversationId) return;
    
    try {
      setIsUploading(true);
      const url = await uploadAudio(user.uid, blob);
      const otherId = conversationId.split('_').find(uid => uid !== user.uid)!;
      
      await sendMessage({
        conversationId,
        senderId: user.uid,
        receiverId: otherId,
        content: 'Voice Message',
        type: 'audio',
        audioUrl: url,
        duration: duration
      });
    } catch (err) {
      console.error('Error sending voice message:', err);
      alert('Failed to send voice message');
    } finally {
      setIsUploading(false);
      setIsRecording(false);
    }
  };

  const sendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;
    
    const otherId = conversationId.split('_').find(uid => uid !== user.uid)!;
    const text = newMessage;
    
    // Crisis Check
    const hasCrisisKeywords = CRISIS_KEYWORDS.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasCrisisKeywords) {
      setShowCrisisModal(true);
    }

    setNewMessage('');
    setReplyingTo(null);
    setEditingMessage(null);
    
    // Clear typing status
    setTypingStatus(conversationId, user.uid, false);
    
    try {
      if (editingMessage) {
        await editMessage(editingMessage.id!, text);
      } else {
        await sendMessage({
          conversationId,
          senderId: user.uid,
          receiverId: otherId,
          content: text,
          type: 'text',
          isCrisis: hasCrisisKeywords,
          replyTo: replyingTo ? {
            messageId: replyingTo.id!,
            content: replyingTo.content,
            senderName: otherUser?.displayName || 'User',
            type: replyingTo.type
          } : undefined
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(text);
    }
  };

  const sendSticker = async (url: string) => {
    if (!user || !conversationId) return;
    const otherId = conversationId.split('_').find(uid => uid !== user.uid)!;
    setShowStickers(false);

    try {
      await sendMessage({
        conversationId,
        senderId: user.uid,
        receiverId: otherId,
        content: 'Sticker',
        type: 'sticker',
        stickerUrl: url
      });
    } catch (err) {
      console.error('Error sending sticker:', err);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'file') => {
    if (!user || !conversationId) return;
    
    setIsUploading(true);
    const otherId = conversationId.split('_').find(uid => uid !== user.uid)!;
    
    try {
      let url: string;
      if (type === 'image') {
        url = await uploadImage(user.uid, file);
        await sendMessage({
          conversationId,
          senderId: user.uid,
          receiverId: otherId,
          content: 'Image',
          type: 'image',
          imageUrl: url
        });
      } else {
        url = await uploadFile(user.uid, file);
        await sendMessage({
          conversationId,
          senderId: user.uid,
          receiverId: otherId,
          content: file.name,
          type: 'file',
          fileUrl: url,
          fileName: file.name,
          fileSize: file.size
        });
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'image');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'file');
    }
  };

  const handleReaction = async (messageId: string, type: ReactionType) => {
    if (!user) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    const hasReaction = message.reactions?.some(r => r.userId === user.uid && r.type === type);
    
    if (hasReaction) {
      await removeReaction(messageId, user.uid);
    } else {
      await addReaction(messageId, user.uid, type);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleSearch = async () => {
    if (!chatSearchQuery.trim() || !conversationId) return;
    
    setIsSearching(true);
    try {
      const results = await searchMessages(conversationId, chatSearchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching messages:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden relative">
      
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 w-full">
        {/* Conversations List */}
        <div className={`w-full md:w-80 border-r border-border bg-white flex flex-col ${
          conversationId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-border bg-white sticky top-0 z-10">
            <h1 className="text-xl font-bold text-text mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="input pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-sm text-text-muted">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-border transition-colors ${
                    conversationId === conv.id ? 'bg-success/20 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {conv.name.charAt(0)}
                    </div>
                    {conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-text truncate">{conv.name}</h3>
                      <span className="text-xs text-text-muted shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-sm text-text-muted truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {conversationId ? (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => navigate('/messages')}
                  className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-text" />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                  {otherUser?.displayName?.charAt(0) || '...'}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-text truncate">{otherUser?.displayName || 'Loading...'}</h3>
                  <OnlineStatus presence={otherUserPresence} />
                </div>
              </div>
              
              {/* Search in chat */}
              <div className="hidden md:flex items-center gap-2 mr-4">
                <div className="relative">
                  <input
                    type="text"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search messages..."
                    className="input pl-3 pr-8 py-1.5 text-sm w-48"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2.5 rounded-xl hover:bg-gray-100 text-text-muted transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 text-text-muted transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-gray-100 text-text-muted transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-primary/5 border-b border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">{searchResults.length} results found</span>
                  <button 
                    onClick={() => setSearchResults([])}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.uid;
                const showAvatar = !isMe && (i === 0 || messages[i-1].senderId !== msg.senderId);
                const isHighlighted = searchResults.some(r => r.id === msg.id);
                
                if (msg.deleted) {
                  return (
                    <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm italic text-text-muted bg-gray-100`}>
                        <p>This message was deleted</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div 
                    key={msg.id || i} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 group ${
                      isHighlighted ? 'bg-yellow-100 -mx-4 px-4 py-2 rounded-lg' : ''
                    }`}
                  >
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-xs font-bold invisible md:visible">
                        {showAvatar ? otherUser?.displayName?.charAt(0) : ''}
                      </div>
                    )}
                    
                    <div className="flex flex-col max-w-[75%]">
                      {/* Reply Preview */}
                      {msg.replyTo && (
                        <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs ${
                          isMe ? 'bg-white/20 text-white/80' : 'bg-gray-100 text-text-muted'
                        }`}>
                          <p className="font-medium">{msg.replyTo.senderName}</p>
                          <p className="truncate">{msg.replyTo.content}</p>
                        </div>
                      )}
                      
                      <div className={`rounded-2xl px-4 py-2.5 shadow-sm relative ${
                        isMe 
                          ? 'bg-primary text-white rounded-br-none' 
                          : 'bg-white text-text border border-border rounded-bl-none'
                      }`}>
                        {/* Message Menu */}
                        <div className={`absolute top-0 ${isMe ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} px-2`}>
                          <MessageMenu
                            isMe={isMe}
                            onEdit={() => {
                              setEditingMessage(msg);
                              setNewMessage(msg.content);
                            }}
                            onDelete={() => handleDelete(msg.id!)}
                            onReply={() => setReplyingTo(msg)}
                            onCopy={() => handleCopy(msg.content)}
                            canEdit={!msg.deleted && msg.type === 'text'}
                          />
                        </div>
                        
                        {/* Message Content */}
                        {msg.type === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                        
                        {msg.type === 'sticker' && (
                          <img src={msg.stickerUrl} alt="Sticker" className="w-32 h-32 object-contain py-2" />
                        )}

                        {msg.type === 'audio' && (
                          <VoicePlayer 
                            url={msg.audioUrl!} 
                            duration={msg.duration!} 
                            isMe={isMe} 
                          />
                        )}
                        
                        {msg.type === 'image' && (
                          <ImageMessage 
                            url={msg.imageUrl!}
                            isMe={isMe}
                          />
                        )}
                        
                        {msg.type === 'file' && (
                          <FileMessage 
                            url={msg.fileUrl!}
                            fileName={msg.fileName!}
                            fileSize={msg.fileSize}
                            isMe={isMe}
                          />
                        )}
                        
                        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'justify-end text-white/70' : 'justify-start text-text-muted'}`}>
                          {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.edited && <span className="italic">(edited)</span>}
                          {isMe && <MessageStatus status={msg.status || 'sent'} isMe={isMe} />}
                        </div>
                      </div>
                      
                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <MessageReactions
                          reactions={msg.reactions}
                          currentUserId={user?.uid || ''}
                          onAddReaction={(type) => handleReaction(msg.id!, type)}
                          onRemoveReaction={() => handleReaction(msg.id!, msg.reactions?.find(r => r.userId === user?.uid)?.type || 'like')}
                          isMe={isMe}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {isTyping && <TypingIndicator userName={otherUser?.displayName} />}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Sticker Picker */}
            {showStickers && (
                <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-8 bg-white border border-border rounded-2xl shadow-xl p-4 z-20 w-auto md:w-80 animate-in fade-in zoom-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Select Sticker</span>
                        <button onClick={() => setShowStickers(false)} className="p-1 rounded-lg hover:bg-gray-100 text-text-muted"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                        {stickerPack.map((url, i) => (
                            <button key={i} onClick={() => sendSticker(url)} className="hover:bg-success/20 p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group">
                                <img src={url} alt="sticker" className="w-16 h-16 object-contain mx-auto group-hover:drop-shadow-md" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  setNewMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}

            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <div className="absolute bottom-24 left-4 right-4 md:left-auto md:right-8 bg-white border border-border rounded-2xl shadow-xl p-4 z-20 w-auto md:w-64 animate-in fade-in zoom-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Attach</span>
                    <button onClick={() => setShowAttachmentMenu(false)} className="p-1 rounded-lg hover:bg-gray-100 text-text-muted"><X className="w-4 h-4"/></button>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      imageInputRef.current?.click();
                      setShowAttachmentMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Image className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-text">Photo</p>
                      <p className="text-xs text-text-muted">Share an image</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachmentMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <File className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-text">Document</p>
                      <p className="text-xs text-text-muted">Share a file</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white shrink-0">
              {/* Reply Preview */}
              {replyingTo && (
                <ReplyPreview
                  content={replyingTo.content}
                  senderName={replyingTo.senderId === user?.uid ? 'You' : otherUser?.displayName || 'User'}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
              
              {/* Edit Preview */}
              {editingMessage && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-700">Editing message</span>
                    <button
                      onClick={() => {
                        setEditingMessage(null);
                        setNewMessage('');
                      }}
                      className="text-yellow-700 hover:text-yellow-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {isRecording ? (
                <VoiceRecorder 
                  onSend={handleVoiceSend}
                  onCancel={() => setIsRecording(false)}
                />
              ) : isUploading ? (
                <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">Uploading...</span>
                </div>
              ) : (
                <form 
                    onSubmit={sendText}
                    className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-2xl border border-border"
                >
                    <button 
                        type="button" 
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className={`p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all ${showAttachmentMenu ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowStickers(!showStickers)}
                        className={`p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all ${showStickers ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all ${showEmojiPicker ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setIsRecording(true)}
                        className="p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-text-muted"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder={editingMessage ? "Edit your message..." : "Write your message..."}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-text placeholder:text-text-muted py-2 px-1"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-primary text-white p-3 rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center max-w-sm px-6">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
                <MessageSquare className="w-10 h-10 text-primary/30" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">Your Conversations</h3>
              <p className="text-text-muted">Select a person from the left to start messaging. Your privacy is our priority.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tools & Modals */}
      <CrisisInterventionModal 
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        onOpenPanicHelper={() => setShowPanicHelper(true)}
      />
      <PanicHelper 
        isOpen={showPanicHelper}
        onClose={() => setShowPanicHelper(false)}
      />
    </div>
  );
}

// Add missing icon
import { MessageSquare } from 'lucide-react';
