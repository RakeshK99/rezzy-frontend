'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './Button';

interface JobApplication {
  id: number;
  job_title: string;
  company: string;
  location?: string;
  application_status: string;
  application_date: string;
  job_description?: string;
}

interface InterviewPreparation {
  id: number;
  job_application_id: number;
  questions: string[];
  answers: string[];
  created_at: string;
}

export default function InterviewPrep() {
  const { user } = useUser();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [preparations, setPreparations] = useState<InterviewPreparation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showPreparation, setShowPreparation] = useState<InterviewPreparation | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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
    }
  }, [user]);

  const fetchPreparations = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interview-preparations/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPreparations(data.preparations || []);
      }
    } catch (error) {
      console.error('Error fetching preparations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchPreparations();
    }
  }, [user, fetchApplications, fetchPreparations]);

  const generateInterviewPrep = async (application: JobApplication) => {
    if (!user?.id) return;

    setGenerating(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          job_application_id: application.id.toString(),
          job_title: application.job_title,
          company: application.company,
          job_description: application.job_description || ''
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Interview preparation generated successfully!');
        setMessageType('success');
        setShowPreparation(data.preparation);
        fetchPreparations(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to generate interview preparation');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to generate interview preparation');
      setMessageType('error');
    } finally {
      setGenerating(false);
    }
  };

  const getExistingPreparation = (applicationId: number) => {
    return preparations.find(prep => prep.job_application_id === applicationId);
  };

  const getApplicationById = (applicationId: number) => {
    return applications.find(app => app.id === applicationId);
  };

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
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Interview Preparation</h1>
              <p className="text-gray-400">Generate personalized interview questions and answers for your applications</p>
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
          {/* Interview Preparation Modal */}
          {showPreparation && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-3xl p-8 max-w-4xl mx-4 border border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
                  <Button
                    onClick={() => setShowPreparation(null)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
                
                {(() => {
                  const application = getApplicationById(showPreparation.job_application_id);
                  return (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {application?.job_title} at {application?.company}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>Created: {new Date(showPreparation.created_at).toLocaleDateString()}</span>
                        <span>{showPreparation.questions.length} Questions</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-6">
                  {showPreparation.questions.map((question, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-2">Question {index + 1}</h4>
                          <p className="text-gray-300 text-sm leading-relaxed">{question}</p>
                        </div>
                      </div>
                      
                      {showPreparation.answers[index] && (
                        <div className="ml-11">
                          <h5 className="text-green-400 font-medium mb-2">Suggested Answer</h5>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-green-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {showPreparation.answers[index]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    onClick={() => setShowPreparation(null)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">
                You need to have job applications in your tracker to generate interview preparation.
              </p>
              <Button
                onClick={() => window.location.href = '/dashboard?tab=tracker'}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Go to Job Tracker
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Your Applications</h2>
              
              {applications.map((application) => {
                const existingPrep = getExistingPreparation(application.id);
                
                return (
                  <div
                    key={application.id}
                    className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{application.job_title}</h3>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                            {application.application_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <p className="text-gray-400">{application.company}</p>
                        {application.location && (
                          <p className="text-gray-500 text-sm">{application.location}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Applied: {new Date(application.application_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {existingPrep ? (
                          <div className="flex items-center space-x-2 text-green-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Interview prep ready</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">No interview prep yet</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {existingPrep ? (
                          <Button
                            onClick={() => setShowPreparation(existingPrep)}
                            className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                            size="sm"
                          >
                            View Prep
                          </Button>
                        ) : (
                          <Button
                            onClick={() => generateInterviewPrep(application)}
                            disabled={generating}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            size="sm"
                          >
                            {generating ? 'Generating...' : 'Generate Prep'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Preparations */}
          {preparations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-white">Recent Interview Preparations</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {preparations.slice(0, 6).map((prep) => {
                  const application = getApplicationById(prep.job_application_id);
                  
                  return (
                    <div
                      key={prep.id}
                      className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                    >
                      <div className="mb-3">
                        <h3 className="text-white font-medium">{application?.job_title}</h3>
                        <p className="text-gray-400 text-sm">{application?.company}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{prep.questions.length} Questions</span>
                        <span>{new Date(prep.created_at).toLocaleDateString()}</span>
                      </div>

                      <Button
                        onClick={() => setShowPreparation(prep)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        View Preparation
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 