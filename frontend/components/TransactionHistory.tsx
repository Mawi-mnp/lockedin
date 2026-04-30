'use client';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'penalty' | 'reward';
  description: string;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  limit?: number;
}

export default function TransactionHistory({ transactions, limit }: TransactionHistoryProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getTypeStyles = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'penalty':
        return 'bg-orange-100 text-orange-800';
      case 'reward':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'reward':
        return '+';
      case 'withdrawal':
      case 'penalty':
        return '-';
      default:
        return '';
    }
  };

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {displayTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeStyles(
                    transaction.type
                  )}`}
                >
                  {transaction.type}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    transaction.type === 'deposit' || transaction.type === 'reward'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {getAmountPrefix(transaction.type)}${Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {limit && transactions.length > limit && (
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            {transactions.length - limit} more transactions available
          </p>
        </div>
      )}
    </div>
  );
}
