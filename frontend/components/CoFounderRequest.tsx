'use client';

import { useState } from 'react';

interface CoFounderRequestProps {
  userId: number;
  username: string;
  commitmentScore: number;
  onRequestSent?: () => void;
}

export default function CoFounderRequest({ 
  userId, 
  username, 
  commitmentScore,
  onRequestSent 
}: CoFounderRequestProps) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendRequest = async () => {
    setIsSending(true);
    try {
      // API call would go here
      // await api.sendCoFounderRequest(userId);
      setSent(true);
      onRequestSent?.();
    } catch (error) {
      console.error('Failed to send request:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm font-medium">
          ✓ Request sent to {username}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{username}</h4>
          <p className="text-sm text-gray-500">
            Commitment Score: {commitmentScore}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            commitmentScore >= 80 
              ? 'bg-green-100 text-green-800' 
              : commitmentScore >= 60 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {commitmentScore >= 80 ? 'High' : commitmentScore >= 60 ? 'Medium' : 'Low'} Commitment
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Send a co-founder request to partner on accountability goals
      </p>
      <button
        onClick={handleSendRequest}
        disabled={isSending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
      >
        {isSending ? 'Sending...' : 'Send Co-Founder Request'}
      </button>
    </div>
  );
}
