'use client';

import { useState, useEffect, useRef } from 'react';
import { suggestTags } from '@/lib/api';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

interface TagSuggestion {
  id: number;
  name: string;
}

export default function TagInput({ tags, setTags, maxTags = 5, placeholder = "Add tags..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length > 0) {
        try {
          const response = await suggestTags(inputValue);
          const filtered = response.data.filter(
            (s: TagSuggestion) => !tags.includes(s.name)
          );
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [inputValue, tags]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const cleanTag = tagName.toLowerCase().trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      setTags([...tags, cleanTag]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex].name);
      } else if (inputValue) {
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white min-h-[48px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition"
            >
              ×
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(suggestions.length > 0)}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => addTag(suggestion.name)}
              className={`w-full px-4 py-2 text-left hover:bg-indigo-50 transition ${
                index === selectedIndex ? 'bg-indigo-50' : ''
              }`}
            >
              <span className="text-indigo-600">#{suggestion.name}</span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-gray-500">
        {tags.length}/{maxTags} tags (press Enter to add)
      </p>
    </div>
  );
}
