import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, User, Plus, Upload, XCircle } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useDropzone } from 'react-dropzone';

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const { searchUsersForGroup, groupSearchResults, isSearchInGroup, clearGroupSearchResults } = useUserStore();
  const { createGroupChat, loading } = useChatStore();
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsersForGroup(searchTerm);
    } else {
      clearGroupSearchResults();
    }
  }, [searchTerm, searchUsersForGroup, clearGroupSearchResults]);

  const handleUserSelect = (user) => {
    if (!selectedUsers.some(selectedUser => selectedUser._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const onDrop = useCallback(acceptedFiles => {
    setGroupImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length >= 2) {
      try {
        console.log(groupName,selectedUsers)
        const formData = new FormData();
        formData.append('chatName', groupName);
        selectedUsers.forEach(user => formData.append('users[]', user._id));
        if (groupImage) {
          formData.append('image', groupImage);
        }
        // for (let [key, value] of formData.entries()) {
        //     console.log(key, value);
        //   }
        // console.log(formData)


        // let data = {
        //   chatName: groupName,
        //   users: selectedUsers.map(user => user._id),
          
        // }
        // if(groupImage){
        //   data.image = groupImage
        // }
        await createGroupChat(formData, userProfile);
        onClose();
        resetForm();
      } catch (error) {
        console.error('Error creating group chat:', error);
      }
    }
  };

  const resetForm = () => {
    setGroupName('');
    setSelectedUsers([]);
    setSearchTerm('');
    setGroupImage(null);
    clearGroupSearchResults();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Group Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 mb-4 text-center cursor-pointer">
          <input {...getInputProps()} />
          {groupImage ? (
            <div className="flex items-center justify-center">
              <img src={URL.createObjectURL(groupImage)} alt="Group" className="w-16 h-16 rounded-full object-cover" />
              <p className="ml-2">{groupImage.name}</p>
            </div>
          ) : isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <div>
              <p>Drag 'n' drop a group image here, or click to select one</p>
              <Upload className="mx-auto mt-2" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedUsers.map(user => (
            <div key={user._id} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
              <img src={user.avatar || "/avatar.png"} alt={user.name} className="w-6 h-6 rounded-full mr-2" />
              <span>{user.name}</span>
              <button onClick={() => handleUserRemove(user._id)} className="ml-2 text-gray-500 hover:text-gray-700">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search users to add"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        {isSearchInGroup ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="max-h-40 overflow-y-auto">
            {groupSearchResults.map(user => (
              user._id !== userProfile._id && !selectedUsers.some(selectedUser => selectedUser._id === user._id) && (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                >
                  <img src={user.avatar || "/avatar.png"} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
                  <span>{user.name}</span>
                  <Plus className="ml-auto w-5 h-5 text-gray-500" />
                </div>
              )
            ))}
          </div>
        )}
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedUsers.length < 2 || loading}
          className="w-full bg-blue-500 text-white p-2 rounded mt-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Group Chat'}
        </button>
      </div>
    </div>
  );
};

export default GroupChatModal;

