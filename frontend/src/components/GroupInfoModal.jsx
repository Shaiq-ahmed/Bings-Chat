import React, { useState, useCallback, useEffect } from "react";
import { X, User, Plus, Trash2, Upload } from 'lucide-react';
import { useUserStore } from "../store/useUserStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useDropzone } from "react-dropzone";

const GroupInfoModal = ({ isOpen, onClose, chatDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroupName, setNewGroupName] = useState(chatDetails.chatName);
  const [newGroupImage, setNewGroupImage] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const {
    searchUsersForGroup,
    groupSearchResults,
    isSearchInGroup,
    clearGroupSearchResults,
  } = useUserStore();
  const {
    renameGroup,
    addToGroup,
    removeFromGroup,
    leaveChat,
    updateGroupImage,
    selectedChat,
  } = useChatStore();
  const { userProfile } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setNewGroupName(chatDetails.chatName);
      setNewGroupImage(null);
      setSelectedUsers([]);
      console.log(chatDetails)
    }
  }, [isOpen, chatDetails]);

  useEffect(() => {
    const handleSearch = (term) => {
      if (term.length >= 2) {
        searchUsersForGroup(term);
      } else {
        clearGroupSearchResults();
      }
    };

    handleSearch(searchTerm);
  }, [searchTerm, searchUsersForGroup, clearGroupSearchResults]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRenameGroup = async () => {
    if (newGroupName.trim() && newGroupName !== chatDetails.chatName) {
      try {
        await renameGroup(chatDetails._id, newGroupName, userProfile);
        onClose();
      } catch (error) {
        console.error("Error renaming group:", error);
      }
    }
  };

  const handleAddUser = async (user) => {
    if (!selectedUsers.some(selectedUser => selectedUser._id === user._id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setSearchTerm("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };

  const handleRemoveUserFromGroup = async (userId, name) => {
    try {
      await removeFromGroup(chatDetails._id, userId, name , userProfile);
    } catch (error) {
      console.error("Error removing user from group:", error);
    }
  };

  const handleAddSelectedUsers = async () => {
    try {
      const selectedUserIds = selectedUsers.map(user => user._id);
      console.log(selectedUserIds);
      await addToGroup(chatDetails._id, selectedUserIds, userProfile);
      setSelectedUsers([]);
      clearGroupSearchResults();
    } catch (error) {
      console.error("Error adding users to group:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveChat(chatDetails._id, userProfile._id, userProfile.name);
      onClose();
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    setNewGroupImage(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const handleUpdateGroupImage = async () => {
    if (newGroupImage) {
      try {
        const formData = new FormData();
        formData.append("image", newGroupImage);
        await updateGroupImage(chatDetails._id, formData, userProfile);
        setNewGroupImage(null);
        onClose();
      } catch (error) {
        console.error("Error updating group image:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Group Info</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
          <img src={chatDetails.img || "/avatar.png"} alt={chatDetails.chatName} className="w-20 h-20 rounded-full mx-auto mb-2" />
          {selectedChat?.groupAdmin === userProfile._id && (
            <div {...getRootProps()} className="border-2 border-dashed rounded-md p-2 text-center cursor-pointer">
              <input {...getInputProps()} />
              {newGroupImage ? (
                <p>New image selected: {newGroupImage.name}</p>
              ) : isDragActive ? (
                <p>Drop the image here ...</p>
              ) : (
                <p>Click to change group image</p>
              )}
              <Upload className="mx-auto mt-1" size={16} />
            </div>
          )} 
          {newGroupImage && ( // This should be outside the previous div
            <button onClick={handleUpdateGroupImage} className="w-full bg-blue-500 text-white p-2 rounded mt-2">
              Update Group Image
            </button>
          )}
        </div>
        <input
          type="text"
          value={newGroupName}
          disabled={selectedChat?.groupAdmin !== userProfile._id}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
         {selectedChat?.groupAdmin === userProfile._id &&  (
        <button
          onClick={handleRenameGroup}
          className="w-full bg-blue-500 text-white p-2 rounded mb-4"
        >
          Rename Group
        </button>
)}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Group Members</h3>
          {selectedChat?.users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-2 hover:bg-gray-100"
            >
              <div className="flex items-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <User className="w-8 h-8 rounded-full mr-2 bg-gray-200 p-1" />
                )}
                <span>{user.name}</span>
              </div>
              <div className="flex items-center">
                {user._id === selectedChat?.groupAdmin && (
                  <span className="text-sm p-1 rounded-lg text-green-600 border border-green-500 mr-2">
                    Admin
                  </span>
                )}
                {selectedChat?.groupAdmin === userProfile._id && user._id !== userProfile._id && (
                  <button
                    onClick={() => handleRemoveUserFromGroup(user._id, user.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {selectedChat?.groupAdmin === userProfile._id && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Add Members</h3>
            <input
              type="text"
              placeholder="Search users to add"
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="w-full p-2 border rounded mb-2"
            />
            {isSearchInGroup ? (
              <div className="text-center">Loading...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                 {groupSearchResults.map(user => (
                    user._id !== userProfile._id && !selectedUsers.some(selectedUser => selectedUser._id === user._id && chatDetails.users.some(existingUser => existingUser._id === user._id)) && (
                
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAddUser(user)}
                      >
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <User className="w-8 h-8 rounded-full mr-2 bg-gray-200 p-1" />
                          )}
                          <span>{user.name}</span>
                        </div>
                        <Plus className="w-5 h-5 text-green-500" />
                      </div>
                    )
                ))}
              </div>
            )}
          </div>
        )}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Selected Users to Add</h3>
            <div className="flex flex-wrap">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center bg-blue-100 rounded-full px-2 py-1 mr-2 mb-2"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => handleRemoveUser(user._id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddSelectedUsers}
              className="w-full bg-green-500 text-white p-2 rounded mt-2"
            >
              Add Selected Users
            </button>
          </div>
        )}
        <button
          onClick={handleLeaveGroup}
          className="w-full bg-red-500 text-white p-2 rounded mt-4"
        >
          Leave Group
        </button>
      </div>
    </div>
  );
};

export default GroupInfoModal;

