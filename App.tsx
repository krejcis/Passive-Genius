import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, IncomeIdea, DetailedPlan, MainTab } from './types';
import { generatePassiveIncomeIdeas, generateBusinessPlan, generateRefinementQuestions } from './services/geminiService';
import IdeaCard from './components/IdeaCard';
import PlanDetail from './components/PlanDetail';
import FeedbackModal from './components/FeedbackModal';
import CommunityHub from './components/CommunityHub';
import { Sparkles, BrainCircuit, MessageSquare, Check, X, Info, ChevronRight, HelpCircle, Home, Heart, Users, User, Compass } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  
  // User Data
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pg_profile');
    return saved ? JSON.parse(saved) : {
      skills: '',
      budget: '',
      timeCommitment: '',
      interests: ''
    };
  });
  
  // Content State
  const [ideas, setIdeas] = useState<IncomeIdea[]>([]);
  const [favorites, setFavorites] = useState<IncomeIdea[]>(() => {
    const saved = localStorage.getItem('pg_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedIdea, setSelectedIdea] = useState<IncomeIdea | null>(null);
  const [currentPlan, setCurrentPlan] = useState<DetailedPlan | null>(null);
  
  // Refinement State
  const [refinementQuestions, setRefinementQuestions] = useState<string[]>([]);
  const [refinementAnswers, setRefinementAnswers] = useState<Record<string, string>>({});

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeTab, setActiveTab] = useState<MainTab>('discover');
  const [showFeedback, setShowFeedback] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    localStorage.setItem('pg_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('pg_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check if we have a valid profile on load to skip onboarding
  useEffect(() => {
    if (profile.skills && profile.budget && appState === AppState.ONBOARDING) {
       // Optional: Could auto-skip to main app if we wanted, 
       // but user might want to generate fresh ideas.
       // Let's just keep them on onboarding but pre-filled.
    }
  }, []);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const toggleFavorite = (e: React.MouseEvent, idea: IncomeIdea) => {
    e.stopPropagation();
    const exists = favorites.find(f => f.id === idea.id);
    if (exists) {
      setFavorites(prev => prev.filter(f => f.id !== idea.id));
      showToast('Removed from favorites', 'info');
    } else {
      setFavorites(prev => [...prev, idea]);
      showToast('Saved to favorites');
    }
  };

  const handleGenerateIdeas = async () => {
    if (!profile.skills || !profile.budget) return;
    setIsLoading(true);
    setLoadingMessage("Generating Income Ideas...");
    setAppState(AppState.GENERATING);
    
    try {
      const generatedIdeas = await generatePassiveIncomeIdeas(profile);
      setIdeas(generatedIdeas);
      setActiveTab('discover');
      setAppState(AppState.MAIN_APP);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ONBOARDING);
      showToast('Failed to generate ideas. Please try again.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIdea = async (idea: IncomeIdea) => {
    setSelectedIdea(idea);
    setIsLoading(true);
    setLoadingMessage("Analyzing idea details...");
    // Reset previous refinement state
    setRefinementAnswers({});
    
    try {
      // Step 1: Get specific questions for this idea
      const questions = await generateRefinementQuestions(idea);
      setRefinementQuestions(questions);
      setAppState(AppState.REFINING);
    } catch (error) {
      console.error(error);
      // Fallback: Skip refinement if it fails
      await generatePlanFinal(idea, {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinementSubmit = async () => {
    if (!selectedIdea) return;
    await generatePlanFinal(selectedIdea, refinementAnswers);
  };

  const generatePlanFinal = async (idea: IncomeIdea, answers: Record<string, string>) => {
    setIsLoading(true);
    setLoadingMessage("Building your custom strategy...");
    setAppState(AppState.PLANNING);

    try {
      // NOW PASSING PROFILE TO GENERATE PLAN
      const plan = await generateBusinessPlan(idea, profile, answers);
      setCurrentPlan(plan);
      setAppState(AppState.DETAIL);
    } catch (error) {
      console.error(error);
      setAppState(AppState.MAIN_APP);
      showToast('Could not generate plan details.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedIdea) return;
    const text = `Check out this business idea: ${selectedIdea.title}\n\n${selectedIdea.description}\n\nGenerated by PassiveGenius.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedIdea.title,
          text: text,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderToast = () => {
    if (!toast) return null;
    return (
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-2">
          {toast.type === 'success' ? <Check size={16} className="text-green-400" /> : <Info size={16} className="text-blue-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-brand-600 animate-pulse" />
        </div>
      </div>
      <h2 className="mt-6 text-xl font-semibold text-gray-900 animate-pulse">{loadingMessage}</h2>
      <p className="mt-2 text-gray-500 max-w-xs">Our AI is crunching the numbers for you...</p>
    </div>
  );

  const renderRefining = () => {
    if (!selectedIdea) return null;

    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col animate-in slide-in-from-right">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
          <div className="mb-6 pt-4">
             <button 
              onClick={() => setAppState(AppState.MAIN_APP)}
              className="mb-4 text-gray-500 hover:text-gray-800 flex items-center text-sm"
            >
              &larr; Cancel
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
                <HelpCircle size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Let's refine this.</h1>
            </div>
            <p className="text-gray-600">
              Answer a few quick questions to help AI tailor the launch plan for <span className="font-semibold text-gray-900">{selectedIdea.title}</span>.
            </p>
          </div>

          <div className="space-y-6 flex-1">
            {refinementQuestions.map((question, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  {idx + 1}. {question}
                </label>
                <input
                  type="text"
                  placeholder="Your answer..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  value={refinementAnswers[question] || ''}
                  onChange={(e) => setRefinementAnswers(prev => ({ ...prev, [question]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 pb-6">
             <button
              onClick={handleRefinementSubmit}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-200 transition-all active:scale-[0.98] flex items-center justify-center"
            >
              Build My Plan
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOnboarding = (isEditMode = false) => (
    <div className={`max-w-md mx-auto px-6 py-6 flex flex-col justify-center relative ${isEditMode ? 'pb-24' : 'min-h-screen py-10'}`}>
      {!isEditMode && (
        <button 
          onClick={() => setShowFeedback(true)}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {!isEditMode && (
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-600 shadow-sm">
            <BrainCircuit size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PassiveGenius</h1>
          <p className="text-gray-500">Tell us about yourself, and AI will build your customized passive income roadmap.</p>
        </div>
      )}

      <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Skills</label>
          <input
            type="text"
            placeholder="e.g., Coding, Writing, Graphic Design"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            value={profile.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Budget</label>
          <input
            type="text"
            placeholder="e.g., $500, $0, $5000"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            value={profile.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Time Commitment</label>
          <select
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white"
            value={profile.timeCommitment}
            onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
          >
            <option value="">Select time...</option>
            <option value="1-5 hours">1-5 hours / week</option>
            <option value="5-10 hours">5-10 hours / week</option>
            <option value="10-20 hours">10-20 hours / week</option>
            <option value="20+ hours">20+ hours / week</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interests (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Crypto, Fitness, Gardening"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            value={profile.interests}
            onChange={(e) => handleInputChange('interests', e.target.value)}
          />
        </div>

        <button
          onClick={handleGenerateIdeas}
          disabled={!profile.skills || !profile.budget || !profile.timeCommitment}
          className="w-full mt-2 bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-200 hover:shadow-brand-300 transition-all active:scale-[0.98] flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isEditMode ? 'Update & Regenerate' : 'Generate Ideas'}
        </button>

        {!isEditMode && favorites.length > 0 && (
          <button
            onClick={() => {
              setActiveTab('saved');
              setAppState(AppState.MAIN_APP);
            }}
            className="w-full py-3 text-sm text-gray-500 font-medium hover:text-brand-600 transition-colors"
          >
            View Saved Ideas ({favorites.length})
          </button>
        )}
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <div className="p-4 space-y-4 pb-24">
            <h1 className="text-xl font-bold text-gray-900 px-1 pt-2">Opportunities</h1>
            {ideas.length > 0 ? (
              ideas.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  isFavorite={favorites.some(f => f.id === idea.id)}
                  onSelect={handleSelectIdea} 
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="text-gray-400" size={24} />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">Ready to start?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Fill out your profile to generate tailored income ideas.
                </p>
                <button 
                  onClick={() => setAppState(AppState.ONBOARDING)}
                  className="text-brand-600 font-bold"
                >
                  Go to Onboarding
                </button>
              </div>
            )}
          </div>
        );
      case 'saved':
        return (
          <div className="p-4 space-y-4 pb-24">
            <h1 className="text-xl font-bold text-gray-900 px-1 pt-2">Saved Portfolio</h1>
            {favorites.length > 0 ? (
              favorites.map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  idea={idea} 
                  isFavorite={true}
                  onSelect={handleSelectIdea} 
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="text-gray-400" size={24} />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No saved ideas yet</h3>
                <p className="text-sm text-gray-500">
                  Tap the heart icon on any idea to save it here.
                </p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 text-brand-600 font-medium text-sm hover:underline"
                >
                  Browse Ideas
                </button>
              </div>
            )}
          </div>
        );
      case 'community':
        return <CommunityHub onShowToast={showToast} />;
      case 'profile':
        return (
          <div className="pb-24">
            <div className="px-4 py-6 border-b bg-white">
              <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-sm text-gray-500">Manage your preferences and settings.</p>
            </div>
            {renderOnboarding(true)}
          </div>
        );
      default:
        return null;
    }
  };

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
      <div className="flex justify-around items-center">
        <button 
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'discover' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Compass size={24} className={activeTab === 'discover' ? 'fill-brand-100' : ''} />
          <span className="text-[10px] font-medium">Discover</span>
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'saved' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Heart size={24} className={activeTab === 'saved' ? 'fill-brand-100' : ''} />
          <span className="text-[10px] font-medium">Saved</span>
        </button>
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'community' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Users size={24} className={activeTab === 'community' ? 'fill-brand-100' : ''} />
          <span className="text-[10px] font-medium">Community</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User size={24} className={activeTab === 'profile' ? 'fill-brand-100' : ''} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // MAIN RENDER SWITCH
  // ---------------------------------------------------------------------------

  if (appState === AppState.GENERATING || appState === AppState.PLANNING) return renderLoading();
  if (appState === AppState.REFINING) return renderRefining();
  
  if (appState === AppState.DETAIL && selectedIdea && currentPlan) {
    return (
      <PlanDetail 
        plan={currentPlan} 
        idea={selectedIdea} 
        isFavorite={favorites.some(f => f.id === selectedIdea.id)}
        onBack={() => setAppState(AppState.MAIN_APP)} 
        onShare={handleShare}
        onToggleFavorite={(e) => toggleFavorite(e, selectedIdea)}
        onShowToast={showToast}
      />
    );
  }
  
  // Logic for Onboarding vs Main App
  if (appState === AppState.ONBOARDING) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderOnboarding()}
        <FeedbackModal 
          isOpen={showFeedback} 
          onClose={() => setShowFeedback(false)} 
          onShowToast={showToast}
        />
        {renderToast()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {renderMainContent()}
      {renderBottomNav()}
      
      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
        onShowToast={showToast}
      />
      
      {renderToast()}
    </div>
  );
};

export default App;