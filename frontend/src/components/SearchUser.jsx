import React, { useState, useEffect, useRef } from 'react';
import { Search, User } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useChatStore } from '../store/useChatStore';
import { useNavigate } from 'react-router-dom';

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef(null);
  const { searchUsers, searchResults, isSearching, clearSearchResults, accessChat } = useUserStore();
  const { selectChat } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        clearSearchResults();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSearchResults]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchUsers(searchTerm);
      } else {
        clearSearchResults();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchUsers, clearSearchResults]);

  const handleUserSelect = async (userId) => {
    try {
      const chat = await accessChat(userId);
      selectChat(chat._id);
      navigate(`/chat/${chat._id}`);
      setSearchTerm('');
      clearSearchResults();
    } catch (error) {
      console.error('Error accessing chat:', error);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      {isSearching && <div className="mt-2 text-center">Loading...</div>}
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleUserSelect(user._id)}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
              ) : (
                <User className="w-8 h-8 rounded-full mr-2 bg-gray-200 p-1" />
              )}
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;

