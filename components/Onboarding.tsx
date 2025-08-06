'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './Button';

interface OnboardingProps {
  onComplete: () => void;
}

const POSITION_LEVELS = [
  { value: 'intern', label: 'Intern' },
  { value: 'entry_level', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid_level', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'cto', label: 'CTO' }
];

const JOB_CATEGORIES = [
  { value: 'software_engineer', label: 'Software Engineer' },
  { value: 'frontend_developer', label: 'Frontend Developer' },
  { value: 'backend_developer', label: 'Backend Developer' },
  { value: 'full_stack_developer', label: 'Full Stack Developer' },
  { value: 'data_engineer', label: 'Data Engineer' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'machine_learning_engineer', label: 'Machine Learning Engineer' },
  { value: 'devops_engineer', label: 'DevOps Engineer' },
  { value: 'site_reliability_engineer', label: 'Site Reliability Engineer' },
  { value: 'product_manager', label: 'Product Manager' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'ui_ux_designer', label: 'UI/UX Designer' },
  { value: 'qa_engineer', label: 'QA Engineer' },
  { value: 'security_engineer', label: 'Security Engineer' },
  { value: 'mobile_developer', label: 'Mobile Developer' },
  { value: 'game_developer', label: 'Game Developer' },
  { value: 'embedded_engineer', label: 'Embedded Engineer' },
  { value: 'cloud_engineer', label: 'Cloud Engineer' },
  { value: 'blockchain_developer', label: 'Blockchain Developer' },
  { value: 'ai_researcher', label: 'AI Researcher' }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [positionLevel, setPositionLevel] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!positionLevel || !jobCategory) {
      setError('Please select both position level and job category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.id || '',
          first_name: user?.firstName || '',
          middle_name: '',
          last_name: user?.lastName || '',
          position_level: positionLevel,
          job_category: jobCategory
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/50 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Rezzy, {user?.firstName}!
            </h1>
            <p className="text-gray-400 text-lg">
              Let's personalize your experience by learning about your career goals
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {step} of 2</span>
              <span>{Math.round((step / 2) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Position Level */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  What position level are you targeting?
                </h2>
                <p className="text-gray-400 mb-6">
                  This helps us find the most relevant job opportunities for you
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {POSITION_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setPositionLevel(level.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      positionLevel === level.value
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Job Category */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  What type of role are you looking for?
                </h2>
                <p className="text-gray-400 mb-6">
                  Select the category that best matches your career interests
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {JOB_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setJobCategory(category.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      jobCategory === category.value
                        ? 'border-purple-500 bg-purple-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="font-medium">{category.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="px-6 py-3"
              >
                Back
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !positionLevel}
                  className="px-6 py-3"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={loading || !positionLevel || !jobCategory}
                  className="px-6 py-3"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 