'use client';

import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/Button';

interface ResumeAnalysis {
  resume_text: string;
  structure_analysis: any;
  filename: string;
}

interface JobAnalysis {
  keywords: any;
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

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [plan, setPlan] = useState<'free' | 'premium' | null>(null);
  const [usage, setUsage] = useState<any>(null);
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
  const [activeTab, setActiveTab] = useState<'upload' | 'analyze' | 'results'>('upload');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.id && !userCreated) {
      createUserIfNeeded();
    }
  }, [isLoaded, user, userCreated]);

  const createUserIfNeeded = async () => {
    try {
      // First try to get user plan to see if user exists
      const planResponse = await fetch(`http://127.0.0.1:8000/api/get-plan?user_id=${user?.id}`);
      
      if (planResponse.ok) {
        const planData = await planResponse.json();
        setPlan(planData.plan);
        setUsage(planData.usage);
        setUserCreated(true);
      } else {
        // User doesn't exist, create them
        const createResponse = await fetch('http://127.0.0.1:8000/api/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            user_id: user?.id || '',
            email: user?.emailAddresses[0]?.emailAddress || '',
            first_name: user?.firstName || '',
            last_name: user?.lastName || ''
          })
        });

        if (createResponse.ok) {
          // Now get the user plan
          const planResponse = await fetch(`http://127.0.0.1:8000/api/get-plan?user_id=${user?.id}`);
          if (planResponse.ok) {
            const planData = await planResponse.json();
            setPlan(planData.plan);
            setUsage(planData.usage);
          }
        }
        setUserCreated(true);
      }
    } catch (err) {
      console.error('Error creating/getting user:', err);
      setError('Failed to load user data.');
    }
  };

  const handleSignOut = () => {
    signOut(() => {
      window.location.href = '/';
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile || !user?.id) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('user_id', user.id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload-resume', {
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
    } catch (err) {
      setError('Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async () => {
    if (!jobDescription.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('job_description', jobDescription);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze-job', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setJobAnalysis(data.analysis);
      } else {
        setError('Failed to analyze job description');
      }
    } catch (err) {
      setError('Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  const evaluateResume = async () => {
    if (!resumeAnalysis?.resume_text || !jobDescription.trim() || !user?.id) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('resume_text', resumeAnalysis.resume_text);
    formData.append('job_description', jobDescription);
    formData.append('user_id', user.id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/evaluate-resume', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAiEvaluation(data.ai_evaluation);
        setKeywordGaps(data.keyword_gaps);
        setActiveTab('results');
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setShowPremiumModal(true);
        } else {
          setError(errorData.detail || 'Failed to evaluate resume');
        }
      }
    } catch (err) {
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
      const response = await fetch('http://127.0.0.1:8000/api/generate-cover-letter', {
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
    } catch (err) {
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
      const response = await fetch('http://127.0.0.1:8000/api/generate-interview-questions', {
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
    } catch (err) {
      setError('Failed to generate interview questions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (selectedPlan: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user_id: user.id,
          plan: selectedPlan,
          success_url: `${window.location.origin}/dashboard?upgrade=success`,
          cancel_url: `${window.location.origin}/upgrade`
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${data.session_id}`;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Failed to initiate upgrade');
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
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
              <span className="text-gray-400 text-sm">
                {plan} plan • {usage?.scans_used || 0}/3 scans used
              </span>
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
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Upload your resume and job description to get AI-powered insights and optimization suggestions.
          </p>
        </div>

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
                <Button 
                  onClick={uploadResume}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Uploading...' : 'Upload Resume'}
                </Button>
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
      </main>

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
