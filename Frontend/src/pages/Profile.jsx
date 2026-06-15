import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Loader2, Check } from 'lucide-react';

const Profile = () => {
  const {
    user,
    updateProfileDetails,
    changeUserPassword,
    uploadUserAvatar
  } = useContext(AuthContext);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Avatar Upload
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name || !email) {
      setProfileError('Name and email are required.');
      return;
    }

    setProfileLoading(true);
    const res = await updateProfileDetails(name, email);
    if (res.success) {
      setProfileSuccess('Profile details updated successfully.');
    } else {
      setProfileError(res.message);
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const res = await changeUserPassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordError(res.message);
    }
    setPasswordLoading(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Type validation
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (PNG/JPG/JPEG).');
      return;
    }

    // Size validation (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await uploadUserAvatar(formData);
    if (!res.success) {
      alert(res.message);
    }
    setAvatarLoading(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profile Settings</h1>
        <p className="text-slate-400 text-sm">Manage your profile credentials, passwords, and photo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Avatar Upload Box */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-4 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            {/* Avatar Frame */}
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center border border-slate-700/60 shadow-xl relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
              {avatarLoading && (
                <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Upload trigger camera overlay */}
            <label className="absolute bottom-0 right-0 p-2 bg-brand-500 hover:bg-brand-600 border border-slate-900 rounded-full cursor-pointer shadow-lg transition-colors flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </label>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-200 text-base">{user?.name}</h3>
            <p className="text-slate-500 text-xs">{user?.email}</p>
          </div>
        </div>

        {/* Profile details & password forms */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Details Form */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-slate-200">Account Credentials</h3>
            </div>

            {profileError && (
              <div className="px-4 py-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="px-4 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={profileLoading} className="btn-primary py-2 px-5">
                  {profileLoading ? 'Saving...' : 'Save details'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-slate-200">Security & Password</h3>
            </div>

            {passwordError && (
              <div className="px-4 py-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="px-4 py-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={passwordLoading} className="btn-primary py-2 px-5">
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
