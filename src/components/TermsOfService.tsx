import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F8F6] selection:bg-blue-200 selection:text-blue-900">
      <div className="max-w-3xl mx-auto px-6 py-24">
        {/* Navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-sans text-gray-500 hover:text-black transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm font-sans text-gray-500 italic">
            Last Updated: April 23, 2026
          </p>
        </header>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
              Acceptance of Terms
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                By using Rehbar AI ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, you may not access or use the Service. These terms 
                apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Description of Service
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                Rehbar AI is an AI-powered educational and career guidance tool designed to help students 
                and professionals navigate their career paths. We provide personalized roadmaps, 
                university recommendations, and skill development advice.
              </p>
              <p className="font-medium text-gray-900">
                Important Disclaimer: Rehbar AI is an educational guidance tool and is not a substitute 
                for certified legal, financial, or professional career counseling advice. Users should 
                exercise their own judgment and consult with professionals before making significant 
                life decisions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              User Responsibilities
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                To receive the most accurate and beneficial career advice, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information about your education and skills.</li>
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Use the Service for lawful purposes and in accordance with these Terms.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              AI Disclaimer
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                Rehbar AI utilizes artificial intelligence to generate recommendations and advice. 
                While we strive for accuracy, AI-generated content can occasionally be incorrect, 
                incomplete, or outdated.
              </p>
              <p>
                All roadmaps and advice provided by Rehbar AI are for guidance purposes only. 
                The company and its developers are not liable for any career outcomes, financial losses, 
                or other consequences resulting from the use of information provided by the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Modifications to Service
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                We reserve the right to modify or discontinue, temporarily or permanently, the Service 
                (or any part thereof) with or without notice. We may also update these Terms of Service 
                from time to time. Your continued use of the Service after any changes signifies your 
                acceptance of the new Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Governing Law
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction 
                in which the company is registered, without regard to its conflict of law provisions. 
                Any legal action or proceeding related to your access to, or use of, the Service shall 
                be instituted in the courts of that jurisdiction.
              </p>
            </div>
          </section>
        </div>

        {/* Footer spacing */}
        <div className="mt-24 border-t border-black/5 pt-12 text-center text-sm font-sans text-gray-400">
          © 2026 Rehbar AI. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
