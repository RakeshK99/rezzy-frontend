'use client';
export default function Features() {
  return (
    <section className="bg-white dark:bg-black py-20 px-4" id="features">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10">Why Rezzy?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-semibold">Tailored to Every Job</h3>
            <p className="text-sm mt-2 text-gray-500">AI analyzes job descriptions and matches your resume automatically.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">ATS-Optimized</h3>
            <p className="text-sm mt-2 text-gray-500">Pass applicant tracking systems confidently with optimized formatting and keywords.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Instant Edits</h3>
            <p className="text-sm mt-2 text-gray-500">One-click improvements with detailed suggestions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
