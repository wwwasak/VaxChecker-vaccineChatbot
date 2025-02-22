/**
 * @description home page component
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PublicNavbar } from '@/components/PublicNavbar';
import { ChatBubbleBottomCenterTextIcon, NewspaperIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';


export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Vaccine Information</span>
              <span className="block text-blue-600">Assistant Platform</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Get accurate, up-to-date information about vaccines and personalized recommendations from our AI assistant.
            </p>
            <div className="mt-5 max-w-xl mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href={isAuthenticated ? "/chat" : "/register"}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-3 md:text-base md:px-8"
                >
                  Chat Now!
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/news"
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-3 md:text-base md:px-8 whitespace-nowrap"
                >
                  Latest Vaccine News
                </Link>
              </div>
            </div>
          </div>

        {/* Features Section */}
        <div className="relative bg-white py-12 sm:py-16 mt-20 sm:mt-32">
          <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Key Features
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
              Everything you need to stay informed about vaccines
            </p>
            <div className="mt-10">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* AI Assistant Feature */}
                <div className="relative group h-full">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out p-6 h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex-1 flex flex-col">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg w-12 h-12">
                        <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-gray-900">
                        AI-Powered Assistant
                      </h3>
                      <p className="mt-4 text-base text-gray-500 flex-1">
                        Get instant answers to your vaccine-related questions from our intelligent chatbot.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Latest News Feature */}
                <div className="relative group h-full">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out p-6 h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex-1 flex flex-col">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg w-12 h-12">
                        <NewspaperIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-gray-900">
                        Latest News
                      </h3>
                      <p className="mt-4 text-base text-gray-500 flex-1">
                        Stay updated with the latest vaccine news and developments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Q&A Feature */}
                <div className="relative group h-full">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out p-6 h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex-1 flex flex-col">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg w-12 h-12">
                        <QuestionMarkCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-gray-900">
                        Interactive Q&A
                      </h3>
                      <p className="mt-4 text-base text-gray-500 flex-1">
                        Engage in real-time interactions to address your current questions of interest.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Myth Busting Feature */}
                <div className="relative group h-full">
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out p-6 h-full flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex-1 flex flex-col">
                      <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg w-12 h-12">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="h-6 w-6 text-white"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                          />
                        </svg>
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-gray-900">
                        Myth Busting
                      </h3>
                      <p className="mt-4 text-base text-gray-500 flex-1">
                        Get accurate verification of vaccine-related information and help distinguish facts from myths.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About Column */}
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  About Us
                </h3>
                <p className="mt-4 text-base text-gray-500">
                  We are committed to providing accurate and reliable vaccine information through advanced AI technology and verified content.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                  Contact
                </h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-500">
                    Email: support@vaxchecker.com
                  </li>
                  <li className="text-base text-gray-500">
                    Available: 24/7
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="text-base text-gray-400 text-center">
                © {new Date().getFullYear()} Vaccine Information Assistant. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        </div>
      </main>
    </div>
  );
} 