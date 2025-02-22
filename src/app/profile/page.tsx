'use client';

import { useState, useEffect } from 'react';
import { PublicNavbar } from '@/components/PublicNavbar';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { UserProfile } from '@/types/user';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Fetching profile...');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setProfile(data);
        setEditedProfile(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        throw new Error(data.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    | { target: { name: string; value: string[] } }
  ) => {
    if (!editedProfile) return;
    
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (!editedProfile || !date) return;
    
    setEditedProfile(prev => ({
      ...prev!,
      dateOfBirth: date.toISOString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProfile) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-6 sm:px-8 flex justify-between items-center bg-gradient-to-r from-blue-700 to-blue-800">
              <div>
                <h3 className="text-xl leading-6 font-semibold text-white">
                  Profile Information
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-blue-100">
                  Personal details and account settings.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 text-sm font-medium text-blue-800 bg-white rounded-lg 
                  hover:bg-blue-50 transition-colors duration-200 shadow-sm"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {error && (
              <div className="px-6 py-4 bg-red-50 text-red-700 border-l-4 border-red-500">
                {error}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="border-t border-gray-200">
                <div className="px-4 py-5 space-y-6 sm:px-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editedProfile?.firstName || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 
                          focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editedProfile?.lastName || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 
                          focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <DatePicker
                        selected={editedProfile?.dateOfBirth ? new Date(editedProfile.dateOfBirth) : null}
                        onChange={handleDateChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5
                          focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                        dateFormat="yyyy-MM-dd"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={editedProfile?.gender || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5
                          focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>


                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editedProfile?.phone || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 
                          focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      />
                    </div>

                    <div className="col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={editedProfile?.address || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 
                          focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                      />
                    </div>

                  
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm 
                      text-sm font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600
                      transition-all duration-200 transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 hover:bg-blue-50 transition-colors duration-200">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile?.firstName} {profile?.lastName}
                    </dd>
                  </div>

                  <div className="bg-gray-50 px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 hover:bg-white transition-colors duration-200">
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </dd>
                  </div>

                  <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 hover:bg-blue-50 transition-colors duration-200">
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile?.gender || 'Not set'}
                    </dd>
                  </div>

                  <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 hover:bg-blue-50 transition-colors duration-200">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile?.phone || 'Not set'}
                    </dd>
                  </div>

                  <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 hover:bg-blue-50 transition-colors duration-200">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {profile?.address || 'Not set'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 