import { useState } from 'react';
import { DollarSign, ArrowUpRight, Clock, Wallet, CreditCard, TrendingUp, Calendar, Download } from 'lucide-react';
import { Tab } from '@headlessui/react';

const EarningsPage = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [requestAmount, setRequestAmount] = useState('');

  // Sample data
  const walletBalance = 45250;
  const pendingPayout = 12500;
  const totalEarned = 178500;

  const dailyEarnings = [
    { date: '2023-06-15', amount: 12500, appointments: 5 },
    { date: '2023-06-14', amount: 9800, appointments: 4 },
    { date: '2023-06-13', amount: 11200, appointments: 6 },
    { date: '2023-06-12', amount: 8700, appointments: 3 },
    { date: '2023-06-11', amount: 14300, appointments: 7 },
  ];

  const payoutHistory = [
    { date: '2023-06-10', amount: 15000, status: 'completed', method: 'Bank Transfer' },
    { date: '2023-05-31', amount: 12000, status: 'completed', method: 'Bank Transfer' },
    { date: '2023-05-20', amount: 18000, status: 'completed', method: 'Bank Transfer' },
  ];

  const handlePayoutRequest = () => {
    if (requestAmount && Number(requestAmount) <= walletBalance) {
      console.log(`Requesting payout of ₹${requestAmount}`);
      // Add your payout request logic here
    }
  };

  return (
    <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500">Track your payments and earnings</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#582768] to-[#d6769f] text-white rounded-lg shadow-sm hover:shadow-md transition-all">
          <Download className="h-5 w-5" />
          <span>Download Statement</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Wallet Balance</p>
              <p className="text-2xl font-bold mt-1">₹{walletBalance.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Available for payout</span>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payout</p>
              <p className="text-2xl font-bold mt-1">₹{pendingPayout.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <span>Next payout: 2 days</span>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold mt-1">₹{totalEarned.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>12% increase from last month</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tab.Group selectedIndex={selectedTab === 'overview' ? 0 : 1} onChange={(index) => setSelectedTab(index === 0 ? 'overview' : 'payouts')}>
        <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 max-w-md mb-8">
          <Tab
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all outline-0 cursor-pointer ${
              selectedTab === 'overview'
                ? 'bg-[#d6779e] shadow text-white'
                : 'text-gray-500 hover:bg-white/[0.12]'
            }`}
          >
            Daily Earnings
          </Tab>
          <Tab
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all outline-0 cursor-pointer ${
              selectedTab === 'payouts'
                ? 'bg-[#d6779e] shadow text-white'
                : 'text-[#582768] hover:bg-white/[0.12]'
            }`}
          >
            Payouts
          </Tab>
        </Tab.List>
      </Tab.Group>

      {selectedTab === 'overview' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Daily Earnings</h2>
            <div className="space-y-4">
              {dailyEarnings.map((earning, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{earning.date}</p>
                      <p className="text-sm text-gray-500">{earning.appointments} appointments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{earning.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">+12% from average</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Payout History</h2>
              <div className="space-y-4">
                {payoutHistory.map((payout, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{payout.date}</p>
                        <p className="text-sm text-gray-500">{payout.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{payout.amount.toLocaleString()}</p>
                      <p className="text-sm text-green-600">{payout.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Request Payout</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder={`Max ₹${walletBalance.toLocaleString()}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#582768] focus:border-[#582768]"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-500 mb-2">Available: ₹{walletBalance.toLocaleString()}</p>
                  <button
                    onClick={handlePayoutRequest}
                    disabled={!requestAmount || Number(requestAmount) > walletBalance}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                      !requestAmount || Number(requestAmount) > walletBalance
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#582768] to-[#d6769f] hover:shadow-md"
                    }`}
                  >
                    Request Payout
                  </button>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Payout Methods</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span className="text-sm">Bank Transfer (****1234)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsPage;