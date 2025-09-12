import { useState } from "react";
import {
  DollarSign,
  Clock,
  Wallet,
  CreditCard,
  Calendar,
} from "lucide-react";
import { Tab } from "@headlessui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { token_api } from "../lib/api";
import { useAuthStore } from "../features/Auth/authSlice";
import { useToast } from "../context/ToastProvider";
import axios from "axios";
import AddBankAccountModal from "../components/Earnings/AddBankAccountModal";

interface EarningsData {
  total_earnings: number;
  total_earnings_this_month: number;
  earnings_growth_this_month_compared_to_last_month: number;
  average_earning_per_day: number;
  this_weeks_earnings_per_day: {
    date: string;
    day: string;
    earnings: number;
    progress_compared_to_average: number;
  }[];
  total_earnings_last_month: number;
  total_payouts: number;
  wallet_balance: number;
  doctor_id: number;
  next_payout_amount: number;
  next_payout_date: string | null;
  bank_account_exists: boolean;
  account_number: string;
  account_holder_name: string;
}

interface Payout {
  id: number;
  amount: string;
  initiated_at: string;
  completed_date: string | null;
  status: string;
  doctor: number;
}

interface BankAccountForm {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

const EarningsPage = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [requestAmount, setRequestAmount] = useState("");
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<EarningsData>({
    queryKey: ["doctor-earnings"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`doctor/earnings/`)
        .then((res) => {
          return res.data;
        });
    },
  });

  const { data: payoutHistory } = useQuery<Payout[]>({
    queryKey: ["doctor-payouts"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`doctor/payouts/`)
        .then((res) => {
          return res.data;
        });
    },
  });

  const request_payout = useMutation({
    mutationKey: ["request_payout"],
    mutationFn: (amount: string) =>
      token_api(accessToken)
        .post("doctor/request_payout/", {
          amount: amount,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Payout request submitted successfully.", "success");
      setRequestAmount("");
    },
    onError: (error) => {
      setRequestAmount("");
      if (axios.isAxiosError(error)) {
        showToast(`${error.response?.data || "Something went wrong"}`, "error");
      } else {
        showToast(
          "Failed to submit payout request. Please try again.",
          "error"
        );
      }
    },
  });

  const bank_account = useMutation({
    mutationKey: ["bank_account"],
    mutationFn: (bankData: BankAccountForm) =>
      token_api(accessToken)
        .post("doctor/bank_account/", {
          doctor: data?.doctor_id,
          bank_name: bankData.bank_name,
          account_number: bankData.account_number,
          ifsc_code: bankData.ifsc_code,
          account_holder_name: bankData.account_holder_name,
        })
        .then((res) => res.data),
    onSuccess: () => {
      refetch();
      showToast("Bank account added successfully.", "success");
    },
    onError: (error) => {
      setRequestAmount("");
      if (axios.isAxiosError(error)) {
        showToast(`${error.response?.data || "Something went wrong"}`, "error");
      } else {
        showToast("Failed to add bank account. Please try again.", "error");
      }
    },
  });

  const handlePayoutRequest = () => {
    if (requestAmount && data && Number(requestAmount) <= data.wallet_balance) {
      request_payout.mutate(requestAmount);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === "string" ? Number(amount) : amount;

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleAddAccount = (data: BankAccountForm) => {
    bank_account.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Earnings
            </h2>
            <p className="text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500">Track your payments and earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Wallet Balance
              </p>
              <p className="text-2xl font-bold mt-1">
                {data ? formatCurrency(data.wallet_balance) : "₹0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payout</p>
              <p className="text-2xl font-bold mt-1">
                {data ? formatCurrency(data.next_payout_amount) : "₹0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
         
        </div>

        {/* Total Earned */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold mt-1">
                {data ? formatCurrency(data.total_earnings) : "₹0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* This Month's Earnings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                This Month's Earnings
              </p>
              <p className="text-2xl font-bold mt-1">
                {data ? formatCurrency(data.total_earnings_this_month) : "₹0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Average per day:{" "}
              {data ? formatCurrency(data.average_earning_per_day) : "₹0"}
            </p>
          </div>
        </div>

        {/* Last Month's Earnings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Last Month's Earnings
              </p>
              <p className="text-2xl font-bold mt-1">
                {data ? formatCurrency(data.total_earnings_last_month) : "₹0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Total payouts: {data ? formatCurrency(data.total_payouts) : "₹0"}
            </p>
          </div>
        </div>
      </div>

      <Tab.Group
        selectedIndex={selectedTab === "overview" ? 0 : 1}
        onChange={(index) =>
          setSelectedTab(index === 0 ? "overview" : "payouts")
        }
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 max-w-md mb-8">
          <Tab
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all outline-0 cursor-pointer ${
              selectedTab === "overview"
                ? "bg-[#d6779e] shadow text-white"
                : "text-gray-500 hover:bg-white/[0.12]"
            }`}
          >
            Weekly Earnings
          </Tab>
          <Tab
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all outline-0 cursor-pointer ${
              selectedTab === "payouts"
                ? "bg-[#d6779e] shadow text-white"
                : "text-[#582768] hover:bg-white/[0.12]"
            }`}
          >
            Payouts
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            {data?.this_weeks_earnings_per_day &&
            data.this_weeks_earnings_per_day.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">
                    This Week's Earnings
                  </h2>
                  <div className="space-y-4">
                    {data.this_weeks_earnings_per_day.map((earning, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {formatDate(earning.date)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {earning.day}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(earning.earnings)}
                          </p>
                          <p
                            className={`text-sm ${
                              earning.progress_compared_to_average >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {earning.progress_compared_to_average >= 0
                              ? "+"
                              : ""}
                            {earning.progress_compared_to_average.toFixed(1)}%
                            from average
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4">Weekly Earnings</h2>
                <p className="text-gray-500">
                  No earnings data available for this week.
                </p>
              </div>
            )}
          </Tab.Panel>

          <Tab.Panel>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Payout History</h2>
                  {payoutHistory && payoutHistory?.length > 0 ? (
                    <div className="space-y-4">
                      {payoutHistory?.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {formatDate(payout.initiated_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatCurrency(payout.amount)}
                            </p>
                            <p className="text-sm text-green-600 capitalize">
                              {payout.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No payout history available.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Request Payout</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        placeholder={
                          data
                            ? `Max ${formatCurrency(data.wallet_balance)}`
                            : "₹0"
                        }
                        className="w-full px-4 py-2 no-arrows border outline-0 border-gray-300 rounded-lg focus:ring-[#582768] focus:border-[#582768]"
                        max={data?.wallet_balance}
                      />
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Available:{" "}
                        {data ? formatCurrency(data.wallet_balance) : "₹0"}
                      </p>
                      <button
                        onClick={handlePayoutRequest}
                        disabled={
                          !requestAmount ||
                          !data ||
                          Number(requestAmount) > data.wallet_balance ||
                          Number(requestAmount) <= 0
                        }
                        className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                          !requestAmount ||
                          !data ||
                          Number(requestAmount) > data.wallet_balance ||
                          Number(requestAmount) <= 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#582768] to-[#d6769f] hover:shadow-md"
                        }`}
                      >
                        Request Payout
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Payout Methods
                      </h3>

                      {data?.bank_account_exists ? (
                        <div className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <span className="text-sm">Bank Transfer</span>
                          </div>
                          <div className="ml-8 text-sm text-gray-600">
                            <p>{data?.account_number}</p>
                            <p>{data?.account_holder_name}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="mt-2 inline-flex cursor-pointer items-center w-full text-white px-4 py-2 text-center bg-[#6d2b8a] text-sm font-medium rounded-md"
                          onClick={() => setIsModalOpen(true)}
                        >
                          Add Bank Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <AddBankAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAccount}
      />
    </div>
  );
};

export default EarningsPage;
