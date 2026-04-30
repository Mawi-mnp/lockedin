'use client';

import Link from 'next/link';

interface Goal {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  creator_id: number;
  status: 'active' | 'completed' | 'failed';
}

interface GoalCardProps {
  goal: Goal;
  showCreator?: boolean;
  onContribute?: (goalId: number) => void;
}

export default function GoalCard({ goal, showCreator = false, onContribute }: GoalCardProps) {
  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };

  const isPastDeadline = new Date(goal.deadline) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[goal.status]}`}>
          {goal.status}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progress >= 100 ? 'bg-green-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>
          Deadline: {new Date(goal.deadline).toLocaleDateString()}
          {isPastDeadline && goal.status === 'active' && (
            <span className="text-red-500 ml-1">(Overdue)</span>
          )}
        </span>
        {showCreator && (
          <Link
            href={`/profile/${goal.creator_id}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            View Creator
          </Link>
        )}
      </div>

      {goal.status === 'active' && onContribute && (
        <button
          onClick={() => onContribute(goal.id)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          Contribute
        </button>
      )}

      {goal.status !== 'active' && (
        <Link
          href={`/goals/${goal.id}`}
          className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
        >
          View Details
        </Link>
      )}
    </div>
  );
}
