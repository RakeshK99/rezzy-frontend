'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './Button';

interface JobRecommendation {
  id: string;
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

interface JobRecommendationsProps {
  userProfile: {
    position_level?: string;
    job_category?: string;
  };
}

const TIME_FILTERS = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '1w', label: 'Last Week' },
  { value: '1m', label: 'Last Month' }
];

export default function JobRecommendations({ userProfile }: JobRecommendationsProps) {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1w');
  const [generatingResume, setGeneratingResume] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchRecommendations = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grateful-transformation-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/job-recommendations/${user.id}?time_filter=${selectedTimeFilter}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        setError('Failed to load job recommendations');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedTimeFilter]);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedTimeFilter, user?.id, fetchRecommendations]);

  const generateOptimizedResume = async (job: JobRecommendation) => {
    if (!user?.id) return;

    setGeneratingResume(job.id);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://grateful-transformation-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/generate-optimized-resume`, {
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
        // Show success message or redirect to download
        alert(`Optimized resume generated successfully! File: ${data.filename}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate optimized resume');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setGeneratingResume(null);
    }
  };

  const openJobApplication = (job: JobRecommendation) => {
    if (job.source_url) {
      window.open(job.source_url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Job Recommendations
          </h2>
          <p className="text-gray-400">
            Based on your profile as a {userProfile?.position_level} {userProfile?.job_category}
          </p>
        </div>
        
        {/* Time Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Show jobs from:</span>
          <select
            value={selectedTimeFilter}
            onChange={(e) => setSelectedTimeFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Finding the best jobs for you...</p>
        </div>
      )}

      {/* Job Listings */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
          <p className="text-gray-400">Try adjusting your time filter or check back later for new opportunities.</p>
        </div>
      )}

      {/* Job Cards */}
      <div className="grid gap-6">
        {recommendations.map((job) => (
          <div
            key={job.id}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Job Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.job_type}
                    </span>
                  </div>
                </div>

                {/* Job Description Preview */}
                <div>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {job.description.substring(0, 200)}...
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    {job.experience_level}
                  </span>
                  {job.salary_range && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      {job.salary_range}
                    </span>
                  )}
                  {job.match_score && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                      {job.match_score}% match
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 lg:min-w-[200px]">
                <Button
                  onClick={() => generateOptimizedResume(job)}
                  disabled={generatingResume === job.id}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {generatingResume === job.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Optimize Resume</span>
                    </div>
                  )}
                </Button>

                {job.source_url && (
                  <Button
                    onClick={() => openJobApplication(job)}
                    variant="outline"
                    className="w-full"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span>Apply Now</span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      {!loading && (
        <div className="text-center pt-6">
          <Button
            onClick={fetchRecommendations}
            variant="outline"
            className="px-6 py-3"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Recommendations</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
} 