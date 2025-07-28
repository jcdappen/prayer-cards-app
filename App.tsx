import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { initialPrayerCards } from './data';
import { CATEGORIES } from './constants';
import type { PrayerCardType, CategoryInfo, View } from './types';
import CategoryTile from './components/CategoryTile';
import PrayerCard from './components/PrayerCard';
import CreateCardForm from './components/CreateCardForm';
import Auth from './components/Auth';
import { auth } from './firebaseClient';
import type { User } from 'firebase/auth';

import ArrowLeftIcon from './components/icons/ArrowLeftIcon';
import ArrowRightIcon from './components/icons/ArrowRightIcon';
import HomeIcon from './components/icons/HomeIcon';
import ShuffleIcon from './components/icons/ShuffleIcon';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [cards, setCards] = useState<PrayerCardType[]>(initialPrayerCards);
  
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchUserCards = useCallback(async (user: User) => {
    setStatusMessage('Loading your cards...');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/.netlify/functions/get-cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch cards');
      const userCards = await response.json();
      setCards([...initialPrayerCards, ...userCards]);
    } catch (error) {
      console.error(error);
      setStatusMessage('Error loading cards.');
    } finally {
      setStatusMessage('');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserCards(user);
      } else {
        // When user logs out, reset cards to initial state
        setCards(initialPrayerCards);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserCards]);


  const dynamicCategories = useMemo(() => {
    const counts = cards.reduce((acc, card) => {
        acc[card.category] = (acc[card.category] || 0) + 1;
        return acc;
    }, {} as {[key: string]: number});

    return Object.entries(CATEGORIES).reduce((acc, [key, catInfo]) => {
        acc[key] = { ...catInfo, cardCount: counts[key] || 0 };
        return acc;
    }, {} as {[key: string]: CategoryInfo});
  }, [cards]);

  const cardsByCategory = useMemo(() => {
    return cards.reduce((acc, card) => {
      (acc[card.category] = acc[card.category] || []).push(card);
      return acc;
    }, {} as { [key: string]: PrayerCardType[] });
  }, [cards]);

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

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
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
    } else if (view === 'category' || view === 'create' || view === 'edit') {
      handleGoHome();
    }
  };
  
  const handleShuffle = () => {
    const allCards = cards.filter(c => c.category !== 'MY CARDS');
    if (allCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allCards.length);
    const randomCard = allCards[randomIndex];
    handleSelectCard(randomCard.id, randomCard.category);
  };

  const handleCreateCard = async (newCardData: { front: string; back: string }) => {
    if (!currentUser) return alert("Please log in to create a card.");
    setStatusMessage('Saving card...');
    try {
        const token = await currentUser.getIdToken();
        const response = await fetch('/.netlify/functions/create-card', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(newCardData),
        });
        if (!response.ok) throw new Error('Failed to create card');
        await fetchUserCards(currentUser);
        setView('category');
        setSelectedCategoryName('MY CARDS');
    } catch (error) {
        console.error(error);
        setStatusMessage('Error saving card.');
    }
  };

  const handleStartEdit = () => {
    if (currentCard) setView('edit');
  };

  const handleUpdateCard = async (updatedData: { front: string; back: string }) => {
    if (!selectedCardId || !currentUser) return;
    setStatusMessage('Updating card...');
    try {
        const token = await currentUser.getIdToken();
        const response = await fetch('/.netlify/functions/update-card', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cardId: selectedCardId, ...updatedData }),
        });
        if (!response.ok) throw new Error('Failed to update card');
        await fetchUserCards(currentUser);
        setView('card');
    } catch (error) {
        console.error(error);
        setStatusMessage('Error updating card.');
    }
  };

  const handleDeleteCard = async () => {
    if (!currentCard || typeof currentCard.id !== 'string' || !currentUser) return;
    if (window.confirm("Are you sure you want to delete this card?")) {
        setStatusMessage('Deleting card...');
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch('/.netlify/functions/delete-card', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ cardId: currentCard.id }),
            });
            if (!response.ok) throw new Error('Failed to delete card');
            await fetchUserCards(currentUser);
            handleBack();
        } catch(error) {
            console.error(error);
            setStatusMessage('Error deleting card.');
        }
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    handleGoHome();
  };
  
  const handleNextCard = useCallback(() => {
    if(currentCardIndex > -1 && currentCardIndex < currentCategoryCards.length - 1){
        const nextCard = currentCategoryCards[currentCardIndex + 1];
        handleSelectCard(nextCard.id, nextCard.category);
    }
  }, [currentCardIndex, currentCategoryCards, handleSelectCard]);
  
  const handlePrevCard = useCallback(() => {
    if(currentCardIndex > 0){
        const prevCard = currentCategoryCards[currentCardIndex - 1];
        handleSelectCard(prevCard.id, prevCard.category);
    }
  }, [currentCardIndex, currentCategoryCards, handleSelectCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (view === 'card') {
            if (event.key === 'ArrowRight') handleNextCard();
            if (event.key === 'ArrowLeft') handlePrevCard();
            if (event.key === ' ') setIsFlipped(f => !f);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, handleNextCard, handlePrevCard]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div>Loading...</div></div>;
  }

  if (!currentUser) {
    return <Auth />;
  }

  const renderHome = () => (
    <div className="p-4 md:p-8">
      <header className="text-center mb-8 relative">
        <div className="absolute top-0 right-0 text-right">
          <p className="text-sm text-gray-600">Signed in as</p>
          <p className="font-semibold text-gray-800">{currentUser.email}</p>
          <button onClick={handleSignOut} className="mt-1 text-sm bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600">Sign Out</button>
        </div>
        <h1 className="font-serif text-5xl font-bold text-sky-800">Lead With Prayer</h1>
        <p className="text-lg text-gray-600 mt-2">Digital Prayer Cards</p>
      </header>
      
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
        {Object.entries(dynamicCategories).filter(([,cat]) => cat.cardCount > 0).map(([key, catInfo]) => (
          <CategoryTile key={key} categoryInfo={catInfo} onClick={() => handleSelectCategory(key)} />
        ))}
      </div>
    </div>
  );

  const renderCategory = () => (
    <div className="p-4 md:p-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
            <ArrowLeftIcon className="h-5 w-5" /> Back to Home
        </button>
        <h1 className="font-serif text-4xl font-bold text-center mb-8">{selectedCategoryName}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {currentCategoryCards.map(card => {
                const categoryInfo = dynamicCategories[card.category];
                return (
                    <div key={card.id} onClick={() => handleSelectCard(card.id, card.category)} className="cursor-pointer aspect-[3/4.5] bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-transform flex flex-col justify-between p-2">
                       <div className={`p-1 text-white text-center font-bold uppercase text-xs tracking-wider ${categoryInfo.color}`}>
                          {card.category}
                        </div>
                        <p className="text-center font-serif text-sm flex-grow flex items-center justify-center p-2">{card.front.split('\n')[0]}</p>
                        <div className={`p-1 text-white text-center font-bold uppercase text-xs tracking-wider ${categoryInfo.color}`}>
                           {card.id}
                        </div>
                    </div>
                );
            })}
             {currentCategoryCards.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">
                    <p>You haven't created any cards in this category yet.</p>
                    <button onClick={() => setView('create')} className="mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">
                        Create a Card
                    </button>
                </div>
            )}
        </div>
    </div>
  );

  const renderCard = () => {
    if (!currentCard) return <div>Card not found</div>;
    const isFirstCard = currentCardIndex === 0;
    const isLastCard = currentCardIndex === currentCategoryCards.length - 1;

    return (
        <div className="min-h-screen flex flex-col p-4">
            <header className="flex justify-between items-center mb-2 w-full max-w-md mx-auto">
                <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-black p-2 rounded-md">
                    <ArrowLeftIcon className="h-5 w-5" /> Back
                </button>
                <button onClick={handleGoHome} className="text-gray-600 hover:text-black p-2 rounded-md">
                    <HomeIcon className="h-6 w-6" />
                </button>
            </header>
            
            {currentCard.category === 'MY CARDS' && (
                <div className="flex justify-center gap-4 mb-2 w-full max-w-md mx-auto">
                    <button onClick={handleStartEdit} className="text-sm text-blue-600 hover:text-blue-800 font-semibold py-1 px-3 rounded-md bg-blue-100 hover:bg-blue-200">
                        Edit
                    </button>
                    <button onClick={handleDeleteCard} className="text-sm text-red-600 hover:text-red-800 font-semibold py-1 px-3 rounded-md bg-red-100 hover:bg-red-200">
                        Delete
                    </button>
                </div>
            )}

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
        mode="create"
        onSave={handleCreateCard}
        onCancel={handleBack}
      />
  );

  const renderEdit = () => {
      const cardToEdit = cards.find(c => c.id === selectedCardId);
      if (!cardToEdit) {
          return <div>Card not found. <button onClick={handleBack}>Go back</button></div>;
      }
      return (
        <CreateCardForm
          mode="edit"
          initialData={{ front: cardToEdit.front, back: cardToEdit.back }}
          onSave={handleUpdateCard}
          onCancel={() => setView('card')}
        />
      );
  };
  
  if (statusMessage) {
    return <div className="flex justify-center items-center h-screen"><div>{statusMessage}</div></div>;
  }
  
  switch (view) {
    case 'category':
      return renderCategory();
    case 'card':
      return renderCard();
    case 'create':
      return renderCreate();
    case 'edit':
        return renderEdit();
    case 'home':
    default:
      return renderHome();
  }
};

export default App;