'use client';

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center h-[90vh] text-center px-6 bg-black text-white" id="home">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Perfect Your Resume with <span className="text-pink-500">Rezzy</span>
      </h1>
      <p className="text-lg md:text-xl max-w-2xl text-gray-400 mb-8">
        Instantly improve your resume using AI. Tailor it to jobs, pass ATS scans, and get interview-ready — in seconds.
      </p>
      <div className="flex gap-4">
        <button className="bg-white text-black font-semibold py-2 px-6 rounded hover:bg-gray-200 transition">
          Try Free
        </button>
        <button className="border border-white text-white font-semibold py-2 px-6 rounded hover:bg-white hover:text-black transition">
          Learn More
        </button>
      </div>
    </section>
  );
}
