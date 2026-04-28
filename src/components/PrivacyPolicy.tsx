import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-sm font-sans text-gray-500 italic">
            Last Updated: April 23, 2026
          </p>
        </header>

        {/* Content */}
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
              Introduction
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                Welcome to Rehbar AI. We value your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, and safeguard your information when you use 
                our AI-powered career counseling services.
              </p>
              <p>
                By accessing or using Rehbar AI, you agree to the practices described in this policy. If you do 
                not agree with these terms, please do not use our platform.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Information We Collect
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                To provide you with a personalized career roadmap, we collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and basic profile details provided during registration.</li>
                <li><strong>Academic Background:</strong> Your current education level, field of study, and grades or academic performance.</li>
                <li><strong>Preferences and Goals:</strong> Information about your career interests, skills, and professional aspirations.</li>
                <li><strong>Chat History:</strong> Transcripts of your interactions with our AI counselor to maintain context and improve advice.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              How We Use Your Information
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                We use the data we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generating personalized career roadmaps and educational guidance.</li>
                <li>Providing real-time AI-driven career counseling and advice.</li>
                <li>Analyzing global job market trends to keep your recommendations relevant.</li>
                <li>Improving our AI models and overall user experience.</li>
                <li>Communicating important updates about your account or our services.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Third-Party AI Services
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                Rehbar AI utilizes advanced Generative AI APIs, such as Google Gemini, to process your queries 
                and generate career advice.
              </p>
              <p>
                Your data is securely transmitted to these services for processing. We ensure that your 
                information is not used to train public AI models without your explicit consent. These 
                third-party providers are bound by strict data protection agreements to maintain your privacy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Data Security
            </h2>
            <div className="space-y-4 font-sans text-gray-700 leading-relaxed">
              <p>
                We implement industry-standard security measures to protect your data from unauthorized access, 
                alteration, or disclosure. This includes encryption, secure servers, and regular security audits. 
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee 
                absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mt-16 mb-6">
              Contact Us
            </h2>
            <div className="font-sans text-gray-700 leading-relaxed">
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, 
                please reach out to us at:
              </p>
              <p className="mt-4">
                <a href="mailto:help@rehbarai.tech" className="text-black font-medium border-b border-black/20 hover:border-black transition-colors">
                  help@rehbarai.tech
                </a>
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

export default PrivacyPolicy;
