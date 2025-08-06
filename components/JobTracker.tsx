'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './Button';

interface JobApplication {
  id: number;
  job_title: string;
  company: string;
  location?: string;
  job_url?: string;
  application_status: 'applied' | 'phone_screen' | 'onsite' | 'offer' | 'rejected';
  application_date: string;
  last_updated: string;
  notes?: string;
  match_score?: number;
}

const STATUS_COLORS = {
  applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  phone_screen: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  onsite: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  offer: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const STATUS_LABELS = {
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  onsite: 'Onsite',
  offer: 'Offer',
  rejected: 'Rejected'
};

export default function JobTracker() {
  const { user } = useUser();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form state
  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    location: '',
    job_url: '',
    notes: ''
  });

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      job_title: '',
      company: '',
      location: '',
      job_url: '',
      notes: ''
    });
    setEditingApplication(null);
  };

  const addApplication = async () => {
    if (!user?.id || !formData.job_title || !formData.company) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          job_title: formData.job_title,
          company: formData.company,
          location: formData.location,
          job_url: formData.job_url,
          notes: formData.notes
        }),
      });

      if (response.ok) {
        setMessage('Application added successfully!');
        setMessageType('success');
        setShowAddForm(false);
        resetForm();
        fetchApplications();
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to add application');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to add application');
      setMessageType('error');
    }
  };

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          status: newStatus
        }),
      });

      if (response.ok) {
        setMessage('Status updated successfully!');
        setMessageType('success');
        fetchApplications();
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to update status');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to update status');
      setMessageType('error');
    }
  };

  const deleteApplication = async (applicationId: number) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id
        }),
      });

      if (response.ok) {
        setMessage('Application deleted successfully!');
        setMessageType('success');
        fetchApplications();
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to delete application');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to delete application');
      setMessageType('error');
    }
  };

  const editApplication = (application: JobApplication) => {
    setEditingApplication(application);
    setFormData({
      job_title: application.job_title,
      company: application.company,
      location: application.location || '',
      job_url: application.job_url || '',
      notes: application.notes || ''
    });
    setShowAddForm(true);
  };

  const updateApplication = async () => {
    if (!user?.id || !editingApplication) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job-applications/${editingApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          job_title: formData.job_title,
          company: formData.company,
          location: formData.location,
          job_url: formData.job_url,
          notes: formData.notes
        }),
      });

      if (response.ok) {
        setMessage('Application updated successfully!');
        setMessageType('success');
        setShowAddForm(false);
        resetForm();
        fetchApplications();
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to update application');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to update application');
      setMessageType('error');
    }
  };

  const getStatusCounts = () => {
    const counts = {
      applied: 0,
      phone_screen: 0,
      onsite: 0,
      offer: 0,
      rejected: 0
    };
    
    applications.forEach(app => {
      counts[app.application_status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Job Application Tracker</h1>
              <p className="text-gray-400">Track your job applications and interview progress</p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Application
            </Button>
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
          {/* Status Summary */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-700">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
              </div>
            ))}
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">
                {editingApplication ? 'Edit Application' : 'Add New Application'}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Job URL
                  </label>
                  <input
                    type="url"
                    value={formData.job_url}
                    onChange={(e) => handleInputChange('job_url', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    rows={3}
                    placeholder="Add any notes about this application..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingApplication ? updateApplication : addApplication}
                  disabled={!formData.job_title || !formData.company}
                >
                  {editingApplication ? 'Update Application' : 'Add Application'}
                </Button>
              </div>
            </div>
          )}

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">
                Start tracking your job applications by adding your first one.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Add Your First Application
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{application.job_title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[application.application_status]}`}>
                          {STATUS_LABELS[application.application_status]}
                        </span>
                        {application.match_score && (
                          <span className="text-sm text-blue-400">
                            {application.match_score}% match
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400">{application.company}</p>
                      {application.location && (
                        <p className="text-gray-500 text-sm">{application.location}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={application.application_status}
                        onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => editApplication(application)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteApplication(application.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      Applied: {new Date(application.application_date).toLocaleDateString()}
                    </div>
                    {application.job_url && (
                      <a
                        href={application.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Job Posting →
                      </a>
                    )}
                  </div>
                  
                  {application.notes && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-xl">
                      <p className="text-gray-300 text-sm">{application.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 