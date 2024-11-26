'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createChangelog } from '@/lib/services/changelog';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Feature {
  text: string;
  image?: string;
}

export default function ChangelogForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([{ text: '' }]);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFeature = () => {
    setFeatures([...features, { text: '' }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, text: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], text };
    setFeatures(newFeatures);
  };

  const handleFeatureImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);

    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newFeatures = [...features];
        newFeatures[index] = { ...newFeatures[index], image: reader.result as string };
        setFeatures(newFeatures);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFeatureImage = (index: number) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], image: undefined };
    setFeatures(newFeatures);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);

    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setImages([...images, reader.result as string]);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const changelog = {
      date: formData.get('date') as string,
      version: formData.get('version') as string,
      tag: formData.get('tag') as string,
      tagColor: formData.get('tagColor') as string,
      description: formData.get('description') as string,
      features: features.filter(f => f.text.trim() !== ''),
      images: images
    };

    try {
      await createChangelog(changelog);
      router.push('/changelog');
      router.refresh();
    } catch (error) {
      console.error('Failed to create changelog:', error);
      alert('Failed to create changelog entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-zinc-300">
          Date
        </label>
        <input
          type="text"
          name="date"
          id="date"
          placeholder="Nov 24, 2024"
          required
          className="mt-1 block w-full rounded-md bg-zinc-900 border-zinc-700 text-white px-4 py-2"
        />
      </div>

      <div>
        <label htmlFor="version" className="block text-sm font-medium text-zinc-300">
          Version
        </label>
        <input
          type="text"
          name="version"
          id="version"
          placeholder="0.43"
          required
          className="mt-1 block w-full rounded-md bg-zinc-900 border-zinc-700 text-white px-4 py-2"
        />
      </div>

      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-zinc-300">
          Tag
        </label>
        <input
          type="text"
          name="tag"
          id="tag"
          placeholder="Rolling Out"
          required
          className="mt-1 block w-full rounded-md bg-zinc-900 border-zinc-700 text-white px-4 py-2"
        />
      </div>

      <div>
        <label htmlFor="tagColor" className="block text-sm font-medium text-zinc-300">
          Tag Color
        </label>
        <input
          type="text"
          name="tagColor"
          id="tagColor"
          placeholder="bg-blue-500/20 text-blue-400"
          required
          className="mt-1 block w-full rounded-md bg-zinc-900 border-zinc-700 text-white px-4 py-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          required
          rows={3}
          className="mt-1 block w-full rounded-md bg-zinc-900 border-zinc-700 text-white px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Features
        </label>
        {features.map((feature, index) => (
          <div key={index} className="space-y-2 mb-4 p-4 bg-zinc-900/50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={feature.text}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 rounded-md bg-zinc-900 border-zinc-700 text-white px-4 py-2"
                placeholder="Feature description"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="px-3 py-2 bg-red-900/30 text-red-400 rounded-md hover:bg-red-900/50"
              >
                Remove
              </button>
            </div>
            
            {feature.image ? (
              <div className="relative group w-40 h-40">
                <img 
                  src={feature.image} 
                  alt={`Feature ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeFeatureImage(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFeatureImageUpload(index, e)}
                disabled={isUploading}
                className="block w-full text-sm text-zinc-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  disabled:opacity-50"
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addFeature}
          className="mt-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700"
        >
          Add Feature
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Images
        </label>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="block w-full text-sm text-zinc-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              disabled:opacity-50"
          />
          <div className="grid grid-cols-2 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Changelog'}
        </button>
      </div>
    </form>
  );
} 