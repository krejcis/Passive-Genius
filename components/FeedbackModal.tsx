import React, { useState } from 'react';
import { X, Send, Smile, Frown, Meh } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to backend
    console.log({ mood, text });
    onShowToast('Feedback sent! Thank you.');
    setMood(null);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Send Feedback</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex justify-center gap-4 mb-6">
            {[
              { id: 'sad', icon: Frown, color: 'hover:text-red-500', active: 'text-red-500 bg-red-50' },
              { id: 'neutral', icon: Meh, color: 'hover:text-yellow-500', active: 'text-yellow-500 bg-yellow-50' },
              { id: 'happy', icon: Smile, color: 'hover:text-green-500', active: 'text-green-500 bg-green-50' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMood(item.id as any)}
                className={`p-3 rounded-full transition-all ${
                  mood === item.id 
                    ? item.active + ' scale-110 ring-2 ring-offset-2 ring-brand-100' 
                    : 'text-gray-300 ' + item.color
                }`}
              >
                <item.icon size={32} />
              </button>
            ))}
          </div>

          <div className="mb-4">
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us what you love or what we can improve..."
              className="w-full h-32 p-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none resize-none text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={!mood && !text}
            className="w-full bg-brand-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
          >
            <Send size={18} />
            Send Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;