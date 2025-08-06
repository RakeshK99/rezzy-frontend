'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './Button';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  position_level?: string;
  job_category?: string;
  current_resume?: {
    id: number;
    filename: string;
    original_filename: string;
  };
}

const POSITION_LEVELS = [
  'intern',
  'entry_level',
  'junior',
  'mid_level',
  'senior',
  'staff',
  'principal',
  'lead',
  'manager',
  'director',
  'vp',
  'cto'
];

const JOB_CATEGORIES = [
  'software_engineer',
  'frontend_developer',
  'backend_developer',
  'full_stack_developer',
  'data_engineer',
  'data_scientist',
  'machine_learning_engineer',
  'devops_engineer',
  'site_reliability_engineer',
  'product_manager',
  'project_manager',
  'ui_ux_designer',
  'qa_engineer',
  'security_engineer',
  'mobile_developer',
  'game_developer',
  'embedded_engineer',
  'cloud_engineer',
  'blockchain_developer',
  'ai_researcher'
];

const JOB_CATEGORY_LABELS: { [key: string]: string } = {
  'software_engineer': 'Software Engineer',
  'frontend_developer': 'Frontend Developer',
  'backend_developer': 'Backend Developer',
  'full_stack_developer': 'Full Stack Developer',
  'data_engineer': 'Data Engineer',
  'data_scientist': 'Data Scientist',
  'machine_learning_engineer': 'Machine Learning Engineer',
  'devops_engineer': 'DevOps Engineer',
  'site_reliability_engineer': 'Site Reliability Engineer',
  'product_manager': 'Product Manager',
  'project_manager': 'Project Manager',
  'ui_ux_designer': 'UI/UX Designer',
  'qa_engineer': 'QA Engineer',
  'security_engineer': 'Security Engineer',
  'mobile_developer': 'Mobile Developer',
  'game_developer': 'Game Developer',
  'embedded_engineer': 'Embedded Engineer',
  'cloud_engineer': 'Cloud Engineer',
  'blockchain_developer': 'Blockchain Developer',
  'ai_researcher': 'AI Researcher'
};

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    position_level: '',
    job_category: ''
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          position_level: data.position_level || '',
          job_category: data.job_category || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile || !user?.id) return;

    setUploadingResume(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('user_id', user.id);
    formData.append('file_type', 'resume');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Resume uploaded successfully!');
        setMessageType('success');
        setResumeFile(null);
        fetchProfile(); // Refresh profile to get updated resume info
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to upload resume');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to upload resume');
      setMessageType('error');
    } finally {
      setUploadingResume(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          position_level: formData.position_level,
          job_category: formData.job_category
        }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
        fetchProfile(); // Refresh profile
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to update profile');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to update profile');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const downloadResume = async () => {
    if (!profile?.current_resume) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/download-resume/${profile.current_resume.id}?user_id=${user?.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = profile.current_resume.original_filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setMessage('Failed to download resume');
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {profile?.first_name} {profile?.middle_name} {profile?.last_name}
              </h1>
              <p className="text-gray-400">{profile?.email}</p>
              {profile?.position_level && profile?.job_category && (
                <p className="text-blue-400 text-sm mt-1">
                  {profile.position_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {JOB_CATEGORY_LABELS[profile.job_category]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 mx-8 mt-6 rounded-xl ${
            messageType === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="p-8">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">Personal Information</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => handleInputChange('middle_name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your middle name (optional)"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
          </div>

          {/* Job Preferences */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">Job Preferences</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Position Level *
                </label>
                <select
                  value={formData.position_level}
                  onChange={(e) => handleInputChange('position_level', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select position level</option>
                  {POSITION_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Job Category *
                </label>
                <select
                  value={formData.job_category}
                  onChange={(e) => handleInputChange('job_category', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select job category</option>
                  {Object.entries(JOB_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resume Management */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">Resume Management</h2>
            
            {profile?.current_resume ? (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profile.current_resume.original_filename}</h3>
                      <p className="text-gray-400 text-sm">Current resume</p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadResume}
                    variant="outline"
                    size="sm"
                    className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 text-center">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-4">No resume uploaded yet</p>
              </div>
            )}

            {/* Upload New Resume */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Upload New Resume</h3>
              <div className="border-2 border-dashed border-gray-700 rounded-2xl p-6">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">
                      {resumeFile ? resumeFile.name : 'Choose a file or drag it here'}
                    </p>
                    <p className="text-gray-400">PDF, DOCX, or DOC files only</p>
                  </div>
                </label>
              </div>
              
              {resumeFile && (
                <div className="mt-4">
                  <Button
                    onClick={uploadResume}
                    disabled={uploadingResume}
                    className="w-full"
                  >
                    {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveProfile}
              disabled={saving}
              className="px-8 py-3"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 