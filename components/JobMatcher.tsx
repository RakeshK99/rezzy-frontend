'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './Button';

interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range?: string;
  job_type: string;
  experience_level: string;
  source: string;
  source_url?: string;
  created_at: string;
  match_score?: number;
}

interface OptimizedResume {
  id: number;
  job_title: string;
  company: string;
  optimized_content: string;
  optimization_notes?: string;
  match_score: number;
  created_at: string;
}

const TIME_FILTERS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '1w', label: 'Last Week' },
  { value: '1m', label: 'Last Month' },
  { value: 'all', label: 'All Time' }
];

interface JobMatcherProps {
  onSwitchTab?: (tab: 'overview' | 'profile' | 'jobs' | 'tracker' | 'interview' | 'subscription') => void;
}

export default function JobMatcher({ onSwitchTab }: JobMatcherProps) {
  const { user } = useUser();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [optimizedResumes, setOptimizedResumes] = useState<OptimizedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('1w');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showOptimizedResume, setShowOptimizedResume] = useState<OptimizedResume | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const fetchOptimizedResumes = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/optimized-resumes/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setOptimizedResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Error fetching optimized resumes:', error);
    }
  }, [user]);

  const searchJobs = useCallback(async () => {
    if (!user) return;

    setSearching(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/match-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          time_filter: timeFilter
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        if (data.jobs?.length === 0) {
          setMessage('No jobs found for your criteria. Try adjusting the time filter.');
          setMessageType('error');
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Failed to search jobs';
        
        // Check if it's a resume upload error and provide better guidance
        if (errorMessage.includes('No resume uploaded')) {
          setMessage('No resume uploaded. Please upload your resume in the Profile section first.');
        } else {
          setMessage(errorMessage);
        }
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to search jobs');
      setMessageType('error');
    } finally {
      setSearching(false);
    }
  }, [user, timeFilter]);

  useEffect(() => {
    if (user) {
      fetchOptimizedResumes();
      searchJobs();
    }
  }, [user, fetchOptimizedResumes, searchJobs]);

  const optimizeResumeForJob = async (job: JobPosting) => {
    if (!user?.id) return;

    setOptimizing(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/optimize-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          job_title: job.title,
          company: job.company,
          job_description: job.description,
          job_requirements: job.requirements
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Resume optimized successfully!');
        setMessageType('success');
        setShowOptimizedResume(data.optimized_resume);
        fetchOptimizedResumes(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to optimize resume');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to optimize resume');
      setMessageType('error');
    } finally {
      setOptimizing(false);
    }
  };

  const downloadOptimizedResume = async (resume: OptimizedResume) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/download-optimized-resume/${resume.id}?user_id=${user?.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.job_title}_${resume.company}_optimized.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setMessage('Failed to download optimized resume');
      setMessageType('error');
    }
  };

  const addToTracker = async (job: JobPosting) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/job-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          job_title: job.title,
          company: job.company,
          location: job.location,
          job_url: job.source_url || '',
          notes: `Found via job matcher - ${job.source}`
        }),
      });

      if (response.ok) {
        setMessage('Job added to tracker successfully!');
        setMessageType('success');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || 'Failed to add job to tracker');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to add job to tracker');
      setMessageType('error');
    }
  };

  const getExistingOptimizedResume = (job: JobPosting) => {
    return optimizedResumes.find(resume => 
      resume.job_title.toLowerCase() === job.title.toLowerCase() && 
      resume.company.toLowerCase() === job.company.toLowerCase()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Job Matcher</h1>
              <p className="text-gray-400">Find relevant jobs and get optimized resumes for each position</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {TIME_FILTERS.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={searchJobs}
                disabled={searching}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {searching ? 'Searching...' : 'Refresh Jobs'}
              </Button>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm">{message}</p>
              {message.includes('No resume uploaded') && onSwitchTab && (
                <Button
                  onClick={() => onSwitchTab('profile')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Go to Profile
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Optimized Resume Modal */}
          {showOptimizedResume && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-3xl p-8 max-w-4xl mx-4 border border-gray-800 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Optimized Resume</h2>
                  <Button
                    onClick={() => setShowOptimizedResume(null)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {showOptimizedResume.job_title} at {showOptimizedResume.company}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Match Score: {showOptimizedResume.match_score}%</span>
                    <span>Created: {new Date(showOptimizedResume.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {showOptimizedResume.optimization_notes && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                    <h4 className="text-blue-400 font-medium mb-2">Optimization Notes</h4>
                    <p className="text-blue-300 text-sm">{showOptimizedResume.optimization_notes}</p>
                  </div>
                )}

                <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                  <h4 className="text-white font-medium mb-4">Optimized Content</h4>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {showOptimizedResume.optimized_content}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    onClick={() => downloadOptimizedResume(showOptimizedResume)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Jobs Found</h3>
              <p className="text-gray-500 mb-6">
                No relevant jobs found for your profile. Try adjusting the time filter or updating your profile.
              </p>
              <Button
                onClick={searchJobs}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Search Again
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const existingResume = getExistingOptimizedResume(job);
                
                return (
                  <div
                    key={job.id}
                    className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-400 font-medium">{job.company}</p>
                        <p className="text-gray-500 text-sm">{job.location}</p>
                      </div>
                      {job.match_score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-400">{job.match_score}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-gray-700 rounded-lg">{job.job_type}</span>
                        <span className="px-2 py-1 bg-gray-700 rounded-lg">{job.experience_level}</span>
                      </div>
                      {job.salary_range && (
                        <p className="text-sm text-green-400">{job.salary_range}</p>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {job.description.substring(0, 150)}...
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      <span>via {job.source}</span>
                    </div>

                    <div className="space-y-2">
                      {existingResume ? (
                        <Button
                          onClick={() => setShowOptimizedResume(existingResume)}
                          className="w-full bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                          size="sm"
                        >
                          View Optimized Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={() => optimizeResumeForJob(job)}
                          disabled={optimizing}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          size="sm"
                        >
                          {optimizing ? 'Optimizing...' : 'Optimize Resume'}
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => addToTracker(job)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Add to Tracker
                      </Button>
                      
                      {job.source_url && (
                        <a
                          href={job.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          View Original Posting →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Optimized Resumes */}
          {optimizedResumes.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6 text-white">Recent Optimized Resumes</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {optimizedResumes.slice(0, 6).map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{resume.job_title}</h3>
                        <p className="text-gray-400 text-sm">{resume.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">{resume.match_score}%</div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => setShowOptimizedResume(resume)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        View Resume
                      </Button>
                      <Button
                        onClick={() => downloadOptimizedResume(resume)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 