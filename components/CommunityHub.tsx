import React, { useState } from 'react';
import { CommunityChannel, ChatMessage } from '../types';
import { ArrowLeft, Send, Users, MessageCircle, Hash, Search } from 'lucide-react';

const MOCK_CHANNELS: CommunityChannel[] = [
  {
    id: '1',
    name: 'SaaS Builders',
    description: 'For software founders and developers.',
    members: 1240,
    icon: '💻',
    messages: [
      { id: 'm1', user: 'AlexDev', text: 'Has anyone tried the new Stripe API for subscriptions?', timestamp: '2m ago', isMe: false },
      { id: 'm2', user: 'FounderJane', text: 'Yes! It made checkout flow much smoother.', timestamp: '1m ago', isMe: false }
    ]
  },
  {
    id: '2',
    name: 'Dropshipping Pros',
    description: 'Product research, suppliers, and ads.',
    members: 3500,
    icon: '📦',
    messages: [
      { id: 'm1', user: 'EcomKing', text: 'Q4 is coming! Are your ads ready?', timestamp: '10m ago', isMe: false },
      { id: 'm2', user: 'NewSeller', text: 'Still trying to find a winning product...', timestamp: '5m ago', isMe: false }
    ]
  },
  {
    id: '3',
    name: 'Content Creators',
    description: 'YouTube, TikTok, and blogging strategies.',
    members: 890,
    icon: '🎥',
    messages: [
      { id: 'm1', user: 'VlogStar', text: 'Shorts are getting crazy reach right now.', timestamp: '1h ago', isMe: false }
    ]
  },
  {
    id: '4',
    name: 'Investing 101',
    description: 'Stocks, crypto, and real estate discussion.',
    members: 5200,
    icon: '📈',
    messages: []
  }
];

interface CommunityHubProps {
  onShowToast: (msg: string) => void;
}

const CommunityHub: React.FC<CommunityHubProps> = ({ onShowToast }) => {
  const [selectedChannel, setSelectedChannel] = useState<CommunityChannel | null>(null);
  const [inputText, setInputText] = useState('');
  const [localChannels, setLocalChannels] = useState<CommunityChannel[]>(MOCK_CHANNELS);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChannel) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      text: inputText,
      timestamp: 'Just now',
      isMe: true
    };

    const updatedChannels = localChannels.map(ch => {
      if (ch.id === selectedChannel.id) {
        return { ...ch, messages: [...ch.messages, newMessage] };
      }
      return ch;
    });

    setLocalChannels(updatedChannels);
    // Update the selected channel view as well
    setSelectedChannel({ ...selectedChannel, messages: [...selectedChannel.messages, newMessage] });
    setInputText('');
  };

  if (selectedChannel) {
    return (
      <div className="flex flex-col h-full bg-white animate-in slide-in-from-right">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
          <button 
            onClick={() => setSelectedChannel(null)}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center">
              <span className="mr-2 text-xl">{selectedChannel.icon}</span>
              {selectedChannel.name}
            </h3>
            <p className="text-xs text-gray-500">{selectedChannel.members} members online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {selectedChannel.messages.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <MessageCircle size={48} className="mx-auto mb-2" />
              <p>Start the conversation!</p>
            </div>
          ) : (
            selectedChannel.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.isMe 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {!msg.isMe && <p className="text-[10px] font-bold text-gray-500 mb-0.5">{msg.user}</p>}
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t bg-white safe-area-pb">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${selectedChannel.name}`}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-brand-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 border-b sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Community Hub</h1>
        <p className="text-sm text-gray-500 mb-4">Join a tribe and accelerate your growth.</p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search communities..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">
        {localChannels.map(channel => (
          <div 
            key={channel.id}
            onClick={() => setSelectedChannel(channel)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-2xl">
              {channel.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{channel.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{channel.description}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="flex items-center text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                <Users size={12} className="mr-1" />
                {channel.members}
              </span>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl text-white text-center">
          <h4 className="font-bold mb-1">Start a new Tribe?</h4>
          <p className="text-xs text-brand-100 mb-3">Connect with others on a specific niche.</p>
          <button 
            onClick={() => onShowToast('Feature coming soon!')}
            className="bg-white text-brand-600 px-4 py-2 rounded-lg text-xs font-bold"
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;