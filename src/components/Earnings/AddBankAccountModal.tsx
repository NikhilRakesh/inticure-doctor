import React, { useState } from "react";
import type { ChangeEvent } from "react";

// Define types
interface BankAccountForm {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: BankAccountForm) => void;
}

const AddBankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<BankAccountForm>({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    account_holder_name: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BankAccountForm, string>>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof BankAccountForm, string>> = {};

    if (!form.bank_name) newErrors.bank_name = "Bank name is required.";
    if (!form.account_number) newErrors.account_number = "Account number is required.";
    if (!form.ifsc_code) newErrors.ifsc_code = "IFSC code is required.";
    if (!form.account_holder_name) newErrors.account_holder_name = "Account holder name is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-[#6d2b8a]">
          Add Bank Account
        </h2>

        {/* Bank Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#6d2b8a] focus:border-[#6d2b8a]"
          />
          {errors.bank_name && (
            <p className="text-red-500 text-xs mt-1">{errors.bank_name}</p>
          )}
        </div>

        {/* Account Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#6d2b8a] focus:border-[#6d2b8a]"
          />
          {errors.account_number && (
            <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>
          )}
        </div>

        {/* IFSC Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          <input
            name="ifsc_code"
            value={form.ifsc_code}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#6d2b8a] focus:border-[#6d2b8a]"
          />
          {errors.ifsc_code && (
            <p className="text-red-500 text-xs mt-1">{errors.ifsc_code}</p>
          )}
        </div>

        {/* Account Holder Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          <input
            name="account_holder_name"
            value={form.account_holder_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#6d2b8a] focus:border-[#6d2b8a]"
          />
          {errors.account_holder_name && (
            <p className="text-red-500 text-xs mt-1">{errors.account_holder_name}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-[#6d2b8a] hover:bg-[#d6779e] rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBankAccountModal;
