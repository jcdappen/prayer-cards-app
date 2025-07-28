
import React, { useState } from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface CreateCardFormProps {
  onSave: (cardData: { front: string; back: string }) => void;
  onCancel: () => void;
}

const CreateCardForm: React.FC<CreateCardFormProps> = ({ onSave, onCancel }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onSave({ front, back });
    } else {
      alert('Please fill out both front and back of the card.');
    }
  };

  const commonTextareaStyles = "w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow";

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
       <button onClick={onCancel} className="flex items-center gap-2 text-gray-600 hover:text-black mb-6">
            <ArrowLeftIcon className="h-5 w-5" /> Back to Home
        </button>
      <div className="bg-white p-6 md:p-8 shadow-xl">
        <h1 className="font-serif text-4xl font-bold text-center mb-8">Create a New Prayer Card</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="front-content" className="block text-lg font-semibold text-gray-700 mb-2">
              Front Content
            </label>
            <textarea
              id="front-content"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={8}
              className={commonTextareaStyles}
              placeholder="Enter the prayer, scripture, or title for the front of the card..."
            />
          </div>
          <div>
            <label htmlFor="back-content" className="block text-lg font-semibold text-gray-700 mb-2">
              Back Content
            </label>
            <textarea
              id="back-content"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={8}
              className={commonTextareaStyles}
              placeholder="Enter reflection points, attributes, or related prayers for the back..."
            />
            <p className="text-sm text-gray-500 mt-2">All new cards will be saved to the "My Cards" category.</p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-sky-700 rounded-md hover:bg-sky-800 transition-colors"
            >
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardForm;
