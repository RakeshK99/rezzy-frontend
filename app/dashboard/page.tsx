'use client';

import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/Button';

interface StructureAnalysis {
  word_count: number;
  sections: string[];
  format: string;
}

interface Keywords {
  technical_skills: string[];
  soft_skills: string[];
  industry_terms: string[];
}

interface ResumeAnalysis {
  resume_text: string;
  structure_analysis: StructureAnalysis;
  filename: string;
}

interface JobAnalysis {
  keywords: Keywords;
  total_requirements: number;
  difficulty_level: string;
  recommendations: string[];
}

interface AIEvaluation {
  match_score: number;
  overall_assessment: string;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  suggested_improvements: string[];
  improved_bullet_points: string[];
  ats_compatibility_score: number;
  ats_recommendations: string[];
}

interface KeywordGaps {
  missing_technical_skills: string[];
  missing_soft_skills: string[];
  total_missing: number;
  coverage_percentage: number;
}

interface UsageData {
  scans_used: number;
  month: string;
  cover_letters_generated?: number;
  interview_questions_generated?: number;
}

interface SavedAnalysis {
  id: number;
  resume_text: string;
  job_description: string;
  ai_evaluation: AIEvaluation;
  keyword_gaps: KeywordGaps;
  job_analysis: JobAnalysis;
  created_at: string;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [plan, setPlan] = useState<'free' | 'premium' | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCreated, setUserCreated] = useState(false);

  // Resume analysis state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<AIEvaluation | null>(null);
  const [keywordGaps, setKeywordGaps] = useState<KeywordGaps | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze' | 'results' | 'history'>('upload');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const createUserIfNeeded = async () => {
    try {
      console.log('Creating/getting user for:', user?.id);
      
      // Check if backend is available first
      try {
        const healthCheck = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        if (!healthCheck.ok) {
          throw new Error('Backend health check failed');
        }
      } catch (healthError) {
        console.warn('Backend not available, will retry later:', healthError);
        setError('Backend service is starting up. Please wait a moment and refresh the page.');
        return;
      }
      
      // Always try to create user first (the backend will handle duplicates)
      console.log('Creating user...');
      const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user?.id || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
          first_name: user?.firstName || '',
          last_name: user?.lastName || ''
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('Create user response:', createResponse.status);
      
      if (createResponse.ok) {
        console.log('User created/updated successfully');
        // Now get the user plan
        const planResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-plan?user_id=${user?.id}`, {
          signal: AbortSignal.timeout(5000)
        });
        if (planResponse.ok) {
          const planData = await planResponse.json();
          console.log('User plan data:', planData);
          setPlan(planData.plan);
          setUsage(planData.usage);
          setUserCreated(true);
          setError(''); // Clear any previous errors
        } else {
          console.error('Failed to get plan data');
          setError('Failed to load user plan data.');
        }
      } else {
        const errorData = await createResponse.json();
        console.error('Failed to create user:', errorData);
        setError('Failed to create user account. Please try refreshing the page.');
      }
    } catch (_error) {
      console.error('Error creating/getting user:', _error);
      if (_error.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to connect to backend service. Please ensure the backend is running.');
      }
    }
  };

  useEffect(() => {
    if (isLoaded && user?.id && !userCreated) {
      createUserIfNeeded();
    }
  }, [isLoaded, user, userCreated]);

  useEffect(() => {
    if (userCreated && user?.id) {
      loadSavedAnalyses();
    }
  }, [userCreated, user?.id]);

  const handleSignOut = () => {
    signOut();
  };

  const loadSavedAnalyses = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume-analyses?user_id=${user.id}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(data.analyses);
      }
    } catch (_error) {
      console.error('Error loading saved analyses:', _error);
    }
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const loadAnalysis = async (analysisId: number) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resume-analysis/${analysisId}?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const analysis = data.analysis;
        
        // Set the analysis data
        setResumeAnalysis({
          resume_text: analysis.resume_text,
          structure_analysis: { word_count: 0, sections: [], format: '' },
          filename: 'Previous Analysis'
        });
        setJobDescription(analysis.job_description);
        setJobAnalysis(analysis.job_analysis);
        setAiEvaluation(analysis.ai_evaluation);
        setKeywordGaps(analysis.keyword_gaps);
        setSelectedAnalysis(analysis);
        setActiveTab('results');
        showNotificationMessage('Analysis loaded successfully!');
      }
    } catch (_error) {
      console.error('Error loading analysis:', _error);
      showNotificationMessage('Failed to load analysis');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile || !user?.id) return;

    // Ensure user exists in database before upload
    if (!userCreated) {
      setError('Please wait while we set up your account...');
      return;
    }

    setLoading(true);
    setError(''); // Clear any previous errors
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('user_id', user.id);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResumeAnalysis(data);
        setActiveTab('analyze');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to upload resume');
      }
    } catch (_error) {
      setError('Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    setError(''); // Clear any previous errors
    const formData = new FormData();
    formData.append('job_description', jobDescription);

    try {
      console.log('Analyzing job description:', jobDescription.substring(0, 100) + '...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-job`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Job analysis response:', data);
        setJobAnalysis(data.analysis);
        console.log('Job analysis set:', data.analysis);
      } else {
        const errorData = await response.json();
        console.error('Job analysis failed:', errorData);
        setError(errorData.detail || 'Failed to analyze job description');
      }
    } catch (_error) {
      console.error('Job analysis error:', _error);
      setError('Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  const evaluateResume = async () => {
    if (!resumeAnalysis?.resume_text || !jobDescription.trim() || !user?.id) return;

    setLoading(true);
    setError(''); // Clear any previous errors
    const formData = new FormData();
    formData.append('resume_text', resumeAnalysis.resume_text);
    formData.append('job_description', jobDescription);
    formData.append('user_id', user.id);

    try {
      console.log('Evaluating resume for user:', user.id);
      console.log('Current usage:', usage);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evaluate-resume`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Resume evaluation successful:', data);
        setAiEvaluation(data.ai_evaluation);
        setKeywordGaps(data.keyword_gaps);
        setActiveTab('results');
        
        // Refresh usage data after successful evaluation
        const planResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-plan?user_id=${user.id}`);
        if (planResponse.ok) {
          const planData = await planResponse.json();
          setUsage(planData.usage);
        }
        
        // Reload saved analyses
        await loadSavedAnalyses();
        showNotificationMessage('Analysis completed and saved to history!');
      } else {
        const errorData = await response.json();
        console.error('Resume evaluation failed:', errorData);
        if (response.status === 403) {
          setShowPremiumModal(true);
        } else {
          setError(errorData.detail || 'Failed to evaluate resume');
        }
      }
    } catch (_error) {
      console.error('Resume evaluation error:', _error);
      setError('Failed to evaluate resume');
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!resumeAnalysis?.resume_text || !jobDescription.trim() || !user?.id) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume_text', resumeAnalysis.resume_text);
    formData.append('job_description', jobDescription);
    formData.append('user_id', user.id);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-cover-letter`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetter(data.cover_letter);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setShowPremiumModal(true);
        } else {
          setError(errorData.detail || 'Failed to generate cover letter');
        }
      }
    } catch (_error) {
      setError('Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const generateInterviewQuestions = async () => {
    if (!resumeAnalysis?.resume_text || !jobDescription.trim() || !user?.id) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume_text', resumeAnalysis.resume_text);
    formData.append('job_description', jobDescription);
    formData.append('user_id', user.id);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-interview-questions`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setInterviewQuestions(data.questions);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setShowPremiumModal(true);
        } else {
          setError(errorData.detail || 'Failed to generate interview questions');
        }
      }
    } catch (_error) {
      setError('Failed to generate interview questions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (selectedPlan: string) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          plan: selectedPlan,
          success_url: `${window.location.origin}/dashboard?upgrade=success`,
          cancel_url: `${window.location.origin}/dashboard`
        })
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `https://checkout.stripe.com/pay/${data.session_id}`;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (_error) {
      setError('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!userCreated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Setting up your account...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Connection Issue</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                setError('');
                setUserCreated(false);
                createUserIfNeeded();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Connection
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-white hover:text-pink-500 transition-colors">
                Rezzy
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user.firstName}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan === 'free' ? 'bg-blue-500/20 text-blue-400' :
                  plan === 'starter' ? 'bg-green-500/20 text-green-400' :
                  plan === 'premium' ? 'bg-pink-500/20 text-pink-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {plan} plan
                </span>
                <span className="text-gray-400 text-sm">
                  {usage?.scans_used || 0}/{plan === 'free' ? '5' : '∞'} scans used
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Resume Analysis
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Upload your resume and job description to get AI-powered insights and optimization suggestions.
          </p>
          
          {/* Usage Status */}
          {usage && (
            <div className="max-w-md mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Your Usage This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Resume Scans</span>
                    <span className="font-medium">
                      {usage.scans_used}/{plan === 'free' ? '5' : '∞'}
                    </span>
                  </div>
                  {plan === 'premium' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Cover Letters</span>
                        <span className="font-medium">
                          {usage.cover_letters_generated || 0}/∞
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Interview Questions</span>
                        <span className="font-medium">
                          {usage.interview_questions_generated || 0}/∞
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {plan === 'free' && usage.scans_used >= 5 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="text-center">
                      <p className="text-yellow-300 text-sm mb-3">
                        You've used all 5 free scans this month. Upgrade to Starter for unlimited scans!
                      </p>
                      <Button 
                        onClick={() => handleUpgrade('starter')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                        size="sm"
                      >
                        Upgrade to Starter
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'upload' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Upload Resume
            </button>
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'analyze' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
              disabled={!resumeAnalysis}
            >
              Analyze Job
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'results' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
              disabled={!aiEvaluation}
            >
              Results
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 rounded-xl transition-all ${
                activeTab === 'history' 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              History
              {savedAnalyses.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {savedAnalyses.length}
                </span>
              )}
            </button>
          </div>
        </div>



        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
              <h2 className="text-2xl font-semibold mb-6">Upload Your Resume</h2>
              
              <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center mb-6">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {resumeFile ? resumeFile.name : 'Choose a file or drag it here'}
                  </p>
                  <p className="text-gray-400">PDF, DOCX, or DOC files only</p>
                </label>
              </div>

              {resumeFile && (
                <div className="space-y-4">
                  {plan === 'free' && usage && usage.scans_used >= 5 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-yellow-400 font-medium">Free Plan Limit Reached</span>
                      </div>
                      <p className="text-yellow-300 text-sm mb-3">
                        You've used all 5 free scans this month. Upgrade to Starter for unlimited scans!
                      </p>
                      <Button 
                        onClick={() => handleUpgrade('starter')}
                        variant="outline"
                        size="sm"
                        className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
                      >
                        Upgrade to Starter
                      </Button>
                    </div>
                  )}
                  <Button 
                    onClick={uploadResume}
                    disabled={loading || (plan === 'free' && usage && usage.scans_used >= 5)}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && resumeAnalysis && (
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Resume Analysis */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h2 className="text-2xl font-semibold mb-6">Resume Analysis</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">File</p>
                    <p className="font-medium">{resumeAnalysis.filename}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Word Count</p>
                    <p className="font-medium">{resumeAnalysis.structure_analysis.word_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">ATS Compatibility</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${resumeAnalysis.structure_analysis.word_count > 200 ? 80 : 40}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{resumeAnalysis.structure_analysis.word_count > 200 ? 'Good' : 'Needs Work'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description Input */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h2 className="text-2xl font-semibold mb-6">Job Description</h2>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-pink-500"
                />
                <Button 
                  onClick={analyzeJob}
                  disabled={!jobDescription.trim() || loading}
                  className="w-full mt-4"
                >
                  {loading ? 'Analyzing...' : 'Analyze Job'}
                </Button>
              </div>
            </div>

            {jobAnalysis && (
              <div className="mt-8 bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h2 className="text-2xl font-semibold mb-6">Job Analysis</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-gray-400 text-sm">Difficulty Level</p>
                    <p className="text-xl font-semibold capitalize">{jobAnalysis.difficulty_level}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Technical Skills</p>
                    <p className="text-xl font-semibold">{jobAnalysis.keywords.technical_skills.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Soft Skills</p>
                    <p className="text-xl font-semibold">{jobAnalysis.keywords.soft_skills.length}</p>
                  </div>
                </div>
                
                {/* Show keywords */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Key Skills Required</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Technical Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {jobAnalysis.keywords.technical_skills.slice(0, 8).map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                        {jobAnalysis.keywords.technical_skills.length > 8 && (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                            +{jobAnalysis.keywords.technical_skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Soft Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {jobAnalysis.keywords.soft_skills.slice(0, 8).map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                        {jobAnalysis.keywords.soft_skills.length > 8 && (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                            +{jobAnalysis.keywords.soft_skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={evaluateResume}
                  disabled={loading}
                  className="w-full mt-6"
                  size="lg"
                >
                  {loading ? 'Evaluating...' : 'Evaluate Resume'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && aiEvaluation && (
          <div className="space-y-8">
            {/* Match Score */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800 text-center">
              <h2 className="text-2xl font-semibold mb-6">Match Score</h2>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(aiEvaluation.match_score / 100) * 251.2} 251.2`}
                    className="text-pink-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{aiEvaluation.match_score}%</span>
                </div>
              </div>
              <p className="text-xl text-gray-300">{aiEvaluation.overall_assessment}</p>
            </div>

            {/* Analysis Grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Strengths */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Strengths</h3>
                <ul className="space-y-2">
                  {aiEvaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {aiEvaluation.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keyword Gaps */}
            {keywordGaps && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-6">Keyword Analysis</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Coverage</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-pink-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${keywordGaps.coverage_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{keywordGaps.coverage_percentage}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Missing Keywords</p>
                    <p className="text-2xl font-semibold">{keywordGaps.total_missing}</p>
                  </div>
                </div>
                
                {keywordGaps.missing_technical_skills.length > 0 && (
                  <div className="mt-6">
                    <p className="text-gray-400 text-sm mb-2">Missing Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {keywordGaps.missing_technical_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Improved Bullet Points */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6">Suggested Improvements</h3>
              <div className="space-y-4">
                {aiEvaluation.improved_bullet_points.map((bullet, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-xl">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            {plan === 'free' && (
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                <h3 className="text-xl font-semibold mb-4">Unlock Premium Features</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button 
                    onClick={generateCoverLetter}
                    disabled={loading}
                    variant="outline"
                    className="justify-start"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Generate Cover Letter
                  </Button>
                  <Button 
                    onClick={generateInterviewQuestions}
                    disabled={loading}
                    variant="outline"
                    className="justify-start"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Interview Questions
                  </Button>
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => handleUpgrade('premium')}
                    variant="premium"
                    size="lg"
                    className="text-lg px-8 py-4"
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </div>
            )}

            {/* Premium Results */}
            {plan === 'premium' && (
              <>
                {coverLetter && (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                    <h3 className="text-xl font-semibold mb-4">Generated Cover Letter</h3>
                    <div className="bg-gray-800/50 rounded-xl p-6">
                      <p className="text-gray-300 whitespace-pre-wrap">{coverLetter}</p>
                    </div>
                  </div>
                )}

                {interviewQuestions.length > 0 && (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
                    <h3 className="text-xl font-semibold mb-4">Interview Questions</h3>
                    <div className="space-y-3">
                      {interviewQuestions.map((question, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-xl">
                          <span className="text-pink-500 font-medium">{index + 1}.</span>
                          <p className="text-gray-300">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Analysis History
                </h2>
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">
                    {savedAnalyses.length} analysis{savedAnalyses.length !== 1 ? 'es' : ''} saved
                  </span>
                </div>
              </div>

              {savedAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Analyses Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Your resume analyses will appear here once you complete your first evaluation.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Start Your First Analysis
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {savedAnalyses.map((analysis, index) => (
                    <div 
                      key={analysis.id}
                      className="group bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-xl"
                      onClick={() => loadAnalysis(analysis.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">#{analysis.id}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              Analysis #{analysis.id}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(analysis.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-400">Match Score</span>
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            {analysis.ai_evaluation?.match_score || 0}%
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Resume Preview</p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {analysis.resume_text.substring(0, 120)}...
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Job Description</p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {analysis.job_description.substring(0, 120)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Click to view full analysis</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-400 group-hover:text-blue-300 transition-colors">
                          <span className="text-sm font-medium">View Details</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2">
          <div className="bg-green-500/90 backdrop-blur-sm rounded-xl p-4 border border-green-400/30 shadow-xl">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-medium">{notificationMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold mb-4">Premium Feature</h3>
            <p className="text-gray-400 mb-6">
              This feature is only available for premium users. Upgrade your plan to access cover letter generation, interview questions, and unlimited resume scans.
            </p>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowPremiumModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowPremiumModal(false);
                  handleUpgrade('premium');
                }}
                className="flex-1"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
