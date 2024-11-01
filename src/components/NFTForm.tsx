import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { NFTMetadata } from '../lib/nft';
import ImageGenerator from './ImageGenerator';

interface NFTFormProps {
  onSubmit: (metadata: NFTMetadata) => Promise<void>;
  isLoading: boolean;
}

const NFTForm: React.FC<NFTFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Omit<NFTMetadata, 'image'>>({
    name: '',
    symbol: '',
    description: '',
    attributes: [],
    royalties: 0,
  });
  const [image, setImage] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [trait, setTrait] = useState({ trait_type: '', value: '' });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setGeneratedImageUrl('');
    }
  };

  const handleGeneratedImage = async (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'generated-nft.png', { type: 'image/png' });
      setImage(file);
    } catch (error) {
      console.error('Error converting generated image to file:', error);
    }
  };

  const handleAddTrait = () => {
    if (trait.trait_type && trait.value) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, trait],
      }));
      setTrait({ trait_type: '', value: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    await onSubmit({
      ...formData,
      image,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <ImageGenerator onImageGenerated={handleGeneratedImage} />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or upload your own image</span>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />

        {generatedImageUrl && (
          <div className="mt-4">
            <img 
              src={generatedImageUrl} 
              alt="Generated NFT" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Symbol
        </label>
        <input
          type="text"
          required
          value={formData.symbol}
          onChange={e => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          required
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Royalties (%) - Max 100%
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          required
          value={formData.royalties}
          onChange={e => setFormData(prev => ({ 
            ...prev, 
            royalties: Math.min(parseFloat(e.target.value), 100)
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Attributes
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Trait Type"
            value={trait.trait_type}
            onChange={e => setTrait(prev => ({ ...prev, trait_type: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm
              focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            placeholder="Value"
            value={trait.value}
            onChange={e => setTrait(prev => ({ ...prev, value: e.target.value }))}
            className="block w-full rounded-md border-gray-300 shadow-sm
              focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddTrait}
            className="inline-flex justify-center rounded-md border border-transparent
              bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm
              hover:bg-indigo-700 focus:outline-none focus:ring-2
              focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        {formData.attributes.length > 0 && (
          <div className="mt-2 space-y-2">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">
                  {attr.trait_type}: {attr.value}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    attributes: prev.attributes.filter((_, i) => i !== index)
                  }))}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || !image}
          className="w-full flex justify-center py-2 px-4 border border-transparent
            rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600
            hover:bg-indigo-700 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
            disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Minting...
            </>
          ) : (
            'Mint NFT'
          )}
        </button>
      </div>
    </form>
  );
};

export default NFTForm;