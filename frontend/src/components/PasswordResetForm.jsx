import React, { useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordResetForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { changePassword, isChangingPassword } = useUserStore();

  const validateInputs = () => {
    const newErrors = {};

    if (!oldPassword) {
      newErrors.oldPassword = 'Current password is required.';
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
    //   alert('Password changed successfully!');
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to change password.' });
    }
  };

  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);

    // Clear the error for this field dynamically as the user types
    setErrors((prevErrors) => ({ ...prevErrors, [fieldName]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <div className="space-y-2">
        <label htmlFor="oldPassword" className="block text-sm font-medium">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showOldPassword ? 'text' : 'password'}
            id="oldPassword"
            value={oldPassword}
            onChange={handleInputChange(setOldPassword, 'oldPassword')}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.oldPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.oldPassword && <p className="text-red-500 text-sm">{errors.oldPassword}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium">
          New Password
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            value={newPassword}
            onChange={handleInputChange(setNewPassword, 'newPassword')}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
      </div>

      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 rounded-md transition-all duration-300 ${
          isChangingPassword ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
        disabled={isChangingPassword}
      >
        {isChangingPassword ? (
          <span className="flex items-center justify-center">
            <Lock className="animate-spin mr-2" size={18} />
            Changing Password...
          </span>
        ) : (
          'Change Password'
        )}
      </button>

      {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
    </form>
  );
};

export default PasswordResetForm;
