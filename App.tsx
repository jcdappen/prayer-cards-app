
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { initialPrayerCards } from './data';
import { CATEGORIES } from './constants';
import type { PrayerCardType, CategoryInfo, View } from './types';
import CategoryTile from './components/CategoryTile';
import PrayerCard from './components/PrayerCard';
import CreateCardForm from './components/CreateCardForm';
import ArrowLeftIcon from './components/icons/ArrowLeftIcon';
import ArrowRightIcon from './components/icons/ArrowRightIcon';
import HomeIcon from './components/icons/HomeIcon';
import ShuffleIcon from './components/icons/ShuffleIcon';
import StarIcon from './components/icons/StarIcon';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [cards, setCards] = useState<PrayerCardType[]>(() => {
    try {
      const storedUserCardsJSON = localStorage.getItem('my-prayer-cards');
      if (storedUserCardsJSON) {
        const storedUserCards = JSON.parse(storedUserCardsJSON);
        if (Array.isArray(storedUserCards)) {
          const validUserCards = storedUserCards.filter(c => c && c.id && c.category === 'MY CARDS');
          return [...initialPrayerCards, ...validUserCards];
        }
      }
    } catch (error) {
      console.error("Failed to load user cards from localStorage", error);
    }
    return initialPrayerCards;
  });
  
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [favoriteCardIds, setFavoriteCardIds] = useState<Set<string | number>>(() => {
    try {
        const storedFavorites = localStorage.getItem('favorite-card-ids');
        if (storedFavorites) {
            const ids = JSON.parse(storedFavorites);
            if (Array.isArray(ids)) {
                return new Set(ids);
            }
        }
    } catch (e) {
        console.error("Could not load favorites", e);
    }
    return new Set();
  });


  useEffect(() => {
    try {
      const userCards = cards.filter(card => card.category === 'MY CARDS');
      localStorage.setItem('my-prayer-cards', JSON.stringify(userCards));
    } catch (error) {
      console.error("Failed to save user cards to localStorage", error);
    }
  }, [cards]);

  useEffect(() => {
    try {
        const ids = Array.from(favoriteCardIds);
        localStorage.setItem('favorite-card-ids', JSON.stringify(ids));
    } catch (e) {
        console.error("Could not save favorites", e);
    }
  }, [favoriteCardIds]);


  const cardsByCategory = useMemo(() => {
    const grouped = cards.reduce((acc, card) => {
      (acc[card.category] = acc[card.category] || []).push(card);
      return acc;
    }, {} as { [key: string]: PrayerCardType[] });

    // Add favorites as a special category group
    grouped['FAVORITES'] = cards.filter(card => favoriteCardIds.has(card.id));
    
    return grouped;
  }, [cards, favoriteCardIds]);


  const dynamicCategories = useMemo(() => {
    const counts = cards.reduce((acc, card) => {
        acc[card.category] = (acc[card.category] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});
    
    counts['FAVORITES'] = favoriteCardIds.size;

    return Object.keys(CATEGORIES).reduce((acc, key) => {
        const catInfo = CATEGORIES[key];
        const count = counts[key] || 0;
        
        if (count > 0 || key === 'MY CARDS') {
          acc[key] = { ...catInfo, cardCount: count };
        }
        return acc;
    }, {} as {[key: string]: CategoryInfo});
  }, [cards, favoriteCardIds]);

  const currentCategoryCards = useMemo(() => {
    if (!selectedCategoryName) return [];
    return cardsByCategory[selectedCategoryName] || [];
  }, [selectedCategoryName, cardsByCategory]);

  const currentCard = useMemo(() => {
    return cards.find(c => c.id === selectedCardId) || null;
  }, [selectedCardId, cards]);
  
  const currentCardIndex = useMemo(() => {
    if (!currentCard || !selectedCategoryName) return -1;
    return currentCategoryCards.findIndex(c => c.id === currentCard.id);
  }, [currentCard, currentCategoryCards, selectedCategoryName]);

  const handleSelectCategory = (categoryKey: string) => {
    setSelectedCategoryName(categoryKey);
    setView('category');
  };
  
  const handleSelectCard = (cardId: number | string, categoryName: string) => {
    setSelectedCategoryName(categoryName);
    setSelectedCardId(cardId);
    setIsFlipped(false);
    setView('card');
  };
  
  const handleGoHome = () => {
    setView('home');
    setSelectedCategoryName(null);
    setSelectedCardId(null);
  };

  const handleBack = () => {
    if (view === 'card') {
      setView('category');
      setSelectedCardId(null);
    } else if (view === 'category' || view === 'create') {
      handleGoHome();
    }
  };
  
  const handleShuffle = () => {
    const allCards = Object.values(cards).flat();
    if (allCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allCards.length);
    const randomCard = allCards[randomIndex];
    handleSelectCard(randomCard.id, randomCard.category);
  };
  
  const handleToggleFavorite = useCallback((cardId: string | number) => {
    setFavoriteCardIds(prevIds => {
        const newIds = new Set(prevIds);
        if (newIds.has(cardId)) {
            newIds.delete(cardId);
        } else {
            newIds.add(cardId);
        }
        return newIds;
    });
  }, []);

  const handleCreateCard = (newCardData: { headline: string; front: string; back: string }) => {
    const newCard: PrayerCardType = {
        id: `user-${Date.now()}`,
        category: 'MY CARDS',
        frontHeadline: newCardData.headline,
        frontText: newCardData.front,
        backHeadline: newCardData.headline,
        backTask: '',
        backText: newCardData.back,
    };
    setCards(prevCards => [...prevCards, newCard]);
    setSelectedCategoryName('MY CARDS');
    setView('category');
  };
  
  const handleNextCard = useCallback(() => {
    if(currentCardIndex > -1 && currentCardIndex < currentCategoryCards.length - 1){
        const nextCard = currentCategoryCards[currentCardIndex + 1];
        handleSelectCard(nextCard.id, nextCard.category);
    }
  }, [currentCardIndex, currentCategoryCards]);
  
  const handlePrevCard = useCallback(() => {
    if(currentCardIndex > 0){
        const prevCard = currentCategoryCards[currentCardIndex - 1];
        handleSelectCard(prevCard.id, prevCard.category);
    }
  }, [currentCardIndex, currentCategoryCards]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (view === 'card' && currentCard) {
            if (event.key === 'ArrowRight') handleNextCard();
            if (event.key === 'ArrowLeft') handlePrevCard();
            if (event.key === ' ') {
                event.preventDefault(); // Prevent scrolling
                setIsFlipped(f => !f);
            }
            if (event.key === 'f') {
                handleToggleFavorite(currentCard.id)
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, handleNextCard, handlePrevCard, currentCard, handleToggleFavorite]);


  const renderHome = () => (
    <div className="p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-serif text-5xl font-bold text-sky-800">Lead With Prayer</h1>
        <p className="text-lg text-gray-600 mt-2">Digital Prayer Cards</p>
      </header>
      
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg mb-8">
        <h2 className="font-serif text-2xl font-bold mb-4">How to Use These Cards</h2>
        <div className="space-y-3 text-gray-700">
            <p><strong>1. Slower is better.</strong> Slow down to experience, not read.</p>
            <p><strong>2. Practice the Rule of Five.</strong> Read each verse and each line of each prayer five times. Let the words soak into your spirit.</p>
            <p><strong>3. Practice posture.</strong> Some prayers inspire raised hands or bent knees. Some might encourage you to pray loudly or in a whisper. Engage your heart, soul, mind, and body.</p>
        </div>
      </div>

       <div className="flex justify-center gap-4 my-8">
            <button
                onClick={handleShuffle}
                className="bg-white text-petitions border border-petitions font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 shadow-md hover:bg-petitions hover:text-white transition-colors"
            >
                <ShuffleIcon className="h-6 w-6" />
                Shuffle & Pray Random
            </button>
            <button
                onClick={() => setView('create')}
                className="bg-green-600 text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 shadow-md hover:bg-green-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your Own Card
            </button>
        </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {Object.entries(dynamicCategories)
          .sort(([keyA], [keyB]) => {
            if (keyA === 'FAVORITES') return -1;
            if (keyB === 'FAVORITES') return 1;
            if (keyA === 'MY CARDS') return 1;
            if (keyB === 'MY CARDS') return -1;
            return 0;
          })
          .map(([key, catInfo]) => (
            <CategoryTile key={catInfo.name} categoryInfo={catInfo} onClick={() => handleSelectCategory(key)} />
        ))}
      </div>
    </div>
  );

  const renderCategory = () => {
    const categoryInfo = dynamicCategories[selectedCategoryName || ''];
    return (
        <div className="p-4 md:p-8">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
                <ArrowLeftIcon className="h-5 w-5" /> Back to Home
            </button>
            <h1 className="font-serif text-4xl font-bold text-center mb-8">{categoryInfo?.name}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
                {currentCategoryCards.map(card => {
                    const cardCategoryInfo = CATEGORIES[card.category];
                    return (
                        <button
                            key={card.id}
                            onClick={() => handleSelectCard(card.id, card.category)}
                            className={`w-full h-28 p-3 text-white font-bold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center text-center leading-tight ${cardCategoryInfo?.color || 'bg-gray-400'}`}
                        >
                           {card.frontHeadline}
                        </button>
                    );
                })}
                 {currentCategoryCards.length === 0 && selectedCategoryName === 'MY CARDS' && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        <p>You haven't created any cards in this category yet.</p>
                        <button onClick={() => setView('create')} className="mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
                            Create a Card
                        </button>
                    </div>
                )}
                {currentCategoryCards.length === 0 && selectedCategoryName === 'FAVORITES' && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        <p>You haven't marked any cards as favorites yet.</p>
                        <p className="text-sm mt-1">Click the star icon on any card to add it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  const renderCard = () => {
    if (!currentCard) return <div>Card not found</div>;
    const isFirstCard = currentCardIndex === 0;
    const isLastCard = currentCardIndex === currentCategoryCards.length - 1;
    const isFavorite = favoriteCardIds.has(currentCard.id);

    return (
        <div className="min-h-screen flex flex-col p-4">
            <header className="flex justify-between items-center mb-4 w-full max-w-md mx-auto">
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-black">
                    <ArrowLeftIcon className="h-5 w-5" /> Back
                </button>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleToggleFavorite(currentCard.id)} 
                        className={`p-1 rounded-full transition-colors ${isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        title={isFavorite ? 'Remove from favorites (f)' : 'Add to favorites (f)'}
                        >
                        <StarIcon className="h-7 w-7" filled={isFavorite} />
                    </button>
                    <button onClick={handleGoHome} className="text-gray-600 hover:text-black" title="Go to Home screen">
                        <HomeIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-md flex items-center gap-2">
                    <button onClick={handlePrevCard} disabled={isFirstCard} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ArrowLeftIcon className="h-8 w-8 text-gray-700"/>
                    </button>
                    <div className="flex-grow">
                        <PrayerCard card={currentCard} isFlipped={isFlipped} onClick={() => setIsFlipped(!isFlipped)} />
                    </div>
                    <button onClick={handleNextCard} disabled={isLastCard} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ArrowRightIcon className="h-8 w-8 text-gray-700"/>
                    </button>
                </div>
            </div>
            <footer className="text-center text-gray-500 mt-4 text-sm">
                Click card to flip. Use arrow keys to navigate.
            </footer>
        </div>
    );
  };

  const renderCreate = () => (
      <CreateCardForm 
        onSave={handleCreateCard}
        onCancel={handleBack}
      />
  );
  
  switch (view) {
    case 'category':
      return renderCategory();
    case 'card':
      return renderCard();
    case 'create':
      return renderCreate();
    case 'home':
    default:
      return renderHome();
  }
};

export default App;
