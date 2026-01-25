'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';

export default function ZendeskWidgetPage() {
  useEffect(() => {
    // Initialize Zendesk widget
    // TODO: Add your Zendesk widget script here
    const script = document.createElement('script');
    script.id = 'ze-snippet';
    script.src = 'https://static.zdassets.com/ekr/snippet.js?key=YOUR_ZENDESK_KEY';
    script.async = true;

    // Uncomment when you have the actual Zendesk key
    // document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.getElementById('ze-snippet');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Get help from our support team
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our support widget will appear here once configured.
            </p>
            <p className="text-sm text-gray-500">
              TODO: Add your Zendesk widget key in the script above
            </p>
          </div>

          {/* Alternative: Embedded help content */}
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Common Questions</h2>

            <details className="border rounded-lg p-4">
              <summary className="font-medium cursor-pointer">
                How do I earn cashback?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Browse our active campaigns and participate to earn cashback rewards.
              </p>
            </details>

            <details className="border rounded-lg p-4">
              <summary className="font-medium cursor-pointer">
                How do I redeem my rewards?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Visit the exchanges page to convert your rewards.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
