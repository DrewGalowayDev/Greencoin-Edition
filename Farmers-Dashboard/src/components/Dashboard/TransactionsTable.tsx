import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  transaction_date: string;
  description: string;
  category: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  currency: string;
}

const TransactionsTable = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        // First get user's farms
        const { data: farmsData } = await supabase
          .from('farms')
          .select('id')
          .eq('owner_id', user.id);

        if (farmsData && farmsData.length > 0) {
          const farmIds = farmsData.map(farm => farm.id);
          
          // Then get transactions for those farms
          const { data: transactionsData } = await supabase
            .from('financial_records')
            .select('*')
            .in('farm_id', farmIds)
            .order('transaction_date', { ascending: false })
            .limit(10);

          if (transactionsData) {
            setTransactions(transactionsData);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getStatusStyles = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-success/15 text-success';
      case 'expense':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-gray-500/15 text-gray-500';
    }
  };

  const getStatusText = (type: string) => {
    switch (type) {
      case 'income':
        return 'Income';
      case 'expense':
        return 'Expense';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-card backdrop-blur-xl border border-primary/20 rounded-2xl overflow-hidden col-span-2 relative">
        <div className="animate-pulse p-6">
          <div className="h-6 bg-muted rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card backdrop-blur-xl border border-primary/20 rounded-2xl overflow-hidden col-span-2 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10">
        <h3 className="text-primary font-semibold text-lg">Recent Transactions</h3>
        <button className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2">
          <span>+</span>
          New Transaction
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No transactions yet</p>
            <p className="text-sm">Add your first financial transaction to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary to-primary-light text-white">
              <tr>
                <th className="text-left py-4 px-6 font-semibold">Date</th>
                <th className="text-left py-4 px-6 font-semibold">Description</th>
                <th className="text-left py-4 px-6 font-semibold">Category</th>
                <th className="text-left py-4 px-6 font-semibold">Amount</th>
                <th className="text-left py-4 px-6 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-primary/15 hover:bg-white/5 transition-colors duration-200">
                  <td className="py-4 px-6 text-white">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-white">{transaction.description}</td>
                  <td className="py-4 px-6 text-white capitalize">{transaction.category}</td>
                  <td className="py-4 px-6 text-white">
                    <span className={transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      {transaction.currency}{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(transaction.transaction_type)}`}>
                      {getStatusText(transaction.transaction_type)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;