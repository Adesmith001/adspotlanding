import React, { useState, useEffect, useRef } from 'react';
import { MdMessage, MdSend, MdSearch, MdPerson } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import EmptyState from '@/components/EmptyState';
import Card from '@/components/ui/Card';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import type { Conversation, Message } from '@/types/billboard.types';
import {
    subscribeToConversations,
    subscribeToMessages,
    sendMessage,
    markConversationAsRead
} from '@/services/message.service';
import toast from 'react-hot-toast';

interface MessagesProps {
    userRole: 'owner' | 'advertiser';
}

const Messages: React.FC<MessagesProps> = ({ userRole }) => {
    const user = useAppSelector(selectUser);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Subscribe to Conversations List
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToConversations(user.uid, (data) => {
            setConversations(data);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to Messages in Selected Conversation
    useEffect(() => {
        if (!selectedConversation) return;

        const unsubscribe = subscribeToMessages(selectedConversation, (data) => {
            setMessages(data);
            // Mark as read when messages load/update if active
            if (user) {
                markConversationAsRead(selectedConversation, user.uid);
            }
        });

        return () => unsubscribe();
    }, [selectedConversation, user]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const messageText = newMessage;
        setNewMessage(''); // Clear input immediately

        try {
            await sendMessage(selectedConversation, user.uid, messageText);
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
            setNewMessage(messageText); // Restore on error
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diff = now.getTime() - messageDate.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return messageDate.toLocaleDateString('en-NG', { weekday: 'long' });
        return messageDate.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
    };

    // Filter conversations
    const filteredConversations = conversations.filter(c => {
        if (!user) return true;
        const otherUserId = c.participants.find(id => id !== user.uid) || "";
        const otherUser = c.participantDetails[otherUserId];
        const name = otherUser?.name || "User";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getOtherParticipant = (conversation: Conversation) => {
        if (!user) return { name: "User", role: "unknown", photo: undefined };
        const otherUserId = conversation.participants.find(id => id !== user.uid) || "";
        return conversation.participantDetails[otherUserId] || { name: "User", role: "unknown", photo: undefined };
    };

    return (
        <DashboardLayout
            userRole={userRole}
            title="Messages"
            subtitle="Chat with advertisers and billboard owners"
        >
            {conversations.length === 0 ? (
                <EmptyState
                    icon={<MdMessage />}
                    title="No Messages Yet"
                    description={
                        userRole === 'owner'
                            ? "When advertisers inquire about your billboards, conversations will appear here."
                            : "Start a conversation by inquiring about a billboard you're interested in."
                    }
                    actionLabel={userRole === 'advertiser' ? 'Browse Billboards' : undefined}
                    actionHref={userRole === 'advertiser' ? '/listings' : undefined}
                />
            ) : (
                <div className="flex h-[calc(100vh-200px)] gap-6">
                    {/* Conversations List */}
                    <Card className="w-80 flex-shrink-0 overflow-hidden flex flex-col">
                        {/* Search */}
                        <div className="p-4 border-b border-neutral-100">
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    disabled={conversations.length === 0}
                                />
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.map((conversation) => {
                                const otherUser = getOtherParticipant(conversation);
                                const unread = user ? (conversation.unreadCount[user.uid] || 0) : 0;

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => setSelectedConversation(conversation.id)}
                                        className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${selectedConversation === conversation.id ? 'bg-primary-50 border-primary-100' : ''
                                            }`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {otherUser.photo ? (
                                                <img src={otherUser.photo} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <MdPerson size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={`font-medium truncate ${unread > 0 ? 'text-neutral-900 font-bold' : 'text-neutral-700'}`}>
                                                    {otherUser.name}
                                                </p>
                                                <span className="text-xs text-neutral-500">
                                                    {formatDate(conversation.lastMessageAt)}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${unread > 0 ? 'text-neutral-900 font-medium' : 'text-neutral-500'}`}>
                                                {conversation.lastMessageSenderId === user?.uid && "You: "}
                                                {conversation.lastMessage}
                                            </p>
                                        </div>
                                        {unread > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                                                {unread}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Chat Area */}
                    {selectedConversation ? (
                        <Card className="flex-1 flex flex-col overflow-hidden">
                            {/* Chat Header */}
                            {(() => {
                                const currentConv = conversations.find(c => c.id === selectedConversation);
                                const otherUser = currentConv ? getOtherParticipant(currentConv) : { name: "User", role: "", photo: undefined };

                                return (
                                    <div className="p-4 border-b border-neutral-100 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                                            {otherUser.photo ? (
                                                <img src={otherUser.photo} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <MdPerson size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">{otherUser.name}</p>
                                            <p className="text-xs text-neutral-500 capitalize">{otherUser.role}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${message.senderId === user?.uid
                                                ? 'bg-primary-600 text-white rounded-br-md'
                                                : 'bg-white text-neutral-900 rounded-bl-md border border-neutral-100'
                                                }`}
                                        >
                                            <p className="text-sm">{message.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${message.senderId === user?.uid ? 'text-white/70' : 'text-neutral-400'
                                                }`}>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-neutral-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1 px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors disabled:bg-neutral-200 disabled:cursor-not-allowed shadow-md shadow-primary-200 disabled:shadow-none"
                                    >
                                        <MdSend size={20} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="flex-1 flex items-center justify-center bg-neutral-50/50">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MdMessage size={40} className="text-neutral-300" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Your Messages</h3>
                                <p className="text-neutral-500 max-w-xs mx-auto">
                                    Select a conversation from the list to view your chat history or start a new message.
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default Messages;
