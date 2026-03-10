import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import DataTable from "../components/ui/DataTable";
import ModalForm from "../components/ui/ModalForm";
import PageTransition from "../components/ui/PageTransition";
import {
  fetchInsuranceCustomers,
  fetchInsurancePayments,
  fetchInsurancePolicies,
  removeInsuranceCustomerModule,
  saveInsuranceCustomer,
  saveInsurancePayment,
  saveInsurancePolicy
} from "../services/insuranceService";
import { dateOnly } from "../utils/formatters";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:!text-[#555555] placeholder:opacity-100 focus:border-electric/60 focus:outline-none";

const InsuranceCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const customerForm = useForm();
  const policyForm = useForm();
  const paymentForm = useForm();

  const loadCustomers = async (query = "") => {
    setLoadingCustomers(true);
    try {
      const data = await fetchInsuranceCustomers({ search: query || undefined });
      setCustomers(data);
    } catch (error) {
      toast.error(error.message || "Could not load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadPolicies = async () => {
    try {
      setPolicies(await fetchInsurancePolicies());
    } catch (error) {
      toast.error(error.message || "Could not load policies");
    }
  };

  const loadPayments = async () => {
    try {
      setPayments(await fetchInsurancePayments());
    } catch (error) {
      toast.error(error.message || "Could not load payments");
    }
  };

  useEffect(() => {
    loadCustomers();
    loadPolicies();
    loadPayments();
  }, []);

  const submitCustomer = customerForm.handleSubmit(async (values) => {
    try {
      await saveInsuranceCustomer(values);
      toast.success("Customer saved");
      customerForm.reset();
      setOpenCustomer(false);
      loadCustomers(search);
    } catch (error) {
      toast.error(error.message || "Failed to save customer");
    }
  });

  const submitPolicy = policyForm.handleSubmit(async (values) => {
    try {
      await saveInsurancePolicy(values);
      toast.success("Policy saved");
      policyForm.reset();
      setOpenPolicy(false);
      loadPolicies();
    } catch (error) {
      toast.error(error.message || "Failed to save policy");
    }
  });

  const submitPayment = paymentForm.handleSubmit(async (values) => {
    try {
      await saveInsurancePayment(values);
      toast.success("Payment saved");
      paymentForm.reset();
      setOpenPayment(false);
      loadPayments();
    } catch (error) {
      toast.error(error.message || "Failed to save payment");
    }
  });

  const removeModule = async (id) => {
    try {
      await removeInsuranceCustomerModule(id);
      toast.success("Insurance module removed");
      loadCustomers(search);
    } catch (error) {
      toast.error(error.message || "Failed to remove customer");
    }
  };

  const customerColumns = [
    { key: "fullName", label: "Full Name", render: (row) => row.name || "-" },
    { key: "customerId", label: "Customer ID", render: (row) => row.insuranceData?.customerId || "-" },
    { key: "phone", label: "Phone", render: (row) => row.phone || "-" },
    { key: "email", label: "Email", render: (row) => row.email || "-" },
    { key: "policyType", label: "Policy Type", render: (row) => row.insuranceData?.policyType || "-" },
    { key: "status", label: "Policy Status", render: (row) => row.insuranceData?.status || "-" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          className="rounded-lg border border-rose-400/25 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/10"
          onClick={() => removeModule(row._id)}
        >
          Remove
        </button>
      )
    }
  ];

  const policyColumns = [
    { key: "policyNumber", label: "Policy Number" },
    { key: "policyType", label: "Policy Type" },
    { key: "insuranceProvider", label: "Carrier" },
    { key: "premiumAmount", label: "Premium", render: (row) => Number(row.premiumAmount || 0).toFixed(2) },
    { key: "policyStatus", label: "Status" },
    { key: "policyStartDate", label: "Start Date", render: (row) => dateOnly(row.policyStartDate) }
  ];

  const paymentColumns = [
    { key: "paymentId", label: "Payment ID" },
    { key: "policyNumber", label: "Policy Number" },
    { key: "paymentAmount", label: "Amount", render: (row) => Number(row.paymentAmount || 0).toFixed(2) },
    { key: "paymentMethod", label: "Method" },
    { key: "paymentStatus", label: "Status" },
    { key: "outstandingBalance", label: "Outstanding", render: (row) => Number(row.outstandingBalance || 0).toFixed(2) }
  ];

  return (
    <PageTransition>
      <section className="space-y-6">
        <article className="space-y-4">
          <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, phone or email"
              className={`${inputClass} max-w-md`}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-blue-100 hover:border-electric/55"
                onClick={() => loadCustomers(search)}
              >
                Search
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm font-medium text-white"
                onClick={() => setOpenCustomer(true)}
              >
                <Plus size={16} />
                Add Customer
              </button>
            </div>
          </div>
          <DataTable columns={customerColumns} rows={customers} emptyMessage={loadingCustomers ? "Loading customers..." : "No customers found."} />
        </article>

        <article className="space-y-3">
          <div className="glass flex items-center justify-between gap-3 rounded-2xl p-4">
            <h3 className="font-display text-base font-semibold text-white">Policy Information</h3>
            <button
              type="button"
              onClick={() => setOpenPolicy(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Add Policy
            </button>
          </div>
          <DataTable columns={policyColumns} rows={policies} emptyMessage="No policy records found." />
        </article>

        <article className="space-y-3">
          <div className="glass flex items-center justify-between gap-3 rounded-2xl p-4">
            <h3 className="font-display text-base font-semibold text-white">Payment & Billing</h3>
            <button
              type="button"
              onClick={() => setOpenPayment(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Add Payment
            </button>
          </div>
          <DataTable columns={paymentColumns} rows={payments} emptyMessage="No payment records found." />
        </article>
      </section>

      <ModalForm open={openCustomer} onClose={() => setOpenCustomer(false)} title="Add Customer / Client Information">
        <form onSubmit={submitCustomer} className="grid gap-3 md:grid-cols-2">
          <input {...customerForm.register("fullName", { required: true })} placeholder="Full Name" className={inputClass} />
          <input {...customerForm.register("phone", { required: true })} placeholder="Phone Number" className={inputClass} />
          <input type="email" {...customerForm.register("email", { required: true })} placeholder="Email Address" className={inputClass} />
          <input {...customerForm.register("customerId", { required: true })} placeholder="Customer ID" className={inputClass} />
          <input {...customerForm.register("policyType", { required: true })} placeholder="Policy Type" className={inputClass} />
          <select {...customerForm.register("status", { required: true })} className={inputClass}>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white md:col-span-2">
            Save Customer
          </button>
        </form>
      </ModalForm>

      <ModalForm open={openPolicy} onClose={() => setOpenPolicy(false)} title="Add Policy Information">
        <form onSubmit={submitPolicy} className="grid gap-3 md:grid-cols-2">
          <input {...policyForm.register("policyNumber", { required: true })} placeholder="Policy Number" className={inputClass} />
          <input {...policyForm.register("policyType")} placeholder="Policy Type" className={inputClass} />
          <input {...policyForm.register("insuranceProvider")} placeholder="Insurance Provider / Carrier" className={inputClass} />
          <input {...policyForm.register("customerId")} placeholder="Customer ID" className={inputClass} />
          <input type="date" {...policyForm.register("policyStartDate")} className={inputClass} />
          <input type="date" {...policyForm.register("policyEndDate")} className={inputClass} />
          <input type="number" min="0" step="0.01" {...policyForm.register("coverageAmount")} placeholder="Coverage Amount" className={inputClass} />
          <input type="number" min="0" step="0.01" {...policyForm.register("deductibleAmount")} placeholder="Deductible Amount" className={inputClass} />
          <input type="number" min="0" step="0.01" {...policyForm.register("premiumAmount")} placeholder="Premium Amount" className={inputClass} />
          <select {...policyForm.register("paymentFrequency")} className={inputClass}>
            <option value="">Payment Frequency</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select {...policyForm.register("policyStatus")} className={inputClass}>
            <option value="">Policy Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white md:col-span-2">
            Save Policy
          </button>
        </form>
      </ModalForm>

      <ModalForm open={openPayment} onClose={() => setOpenPayment(false)} title="Add Payment & Billing Information">
        <form onSubmit={submitPayment} className="grid gap-3 md:grid-cols-2">
          <input {...paymentForm.register("paymentId", { required: true })} placeholder="Payment ID" className={inputClass} />
          <input {...paymentForm.register("policyNumber")} placeholder="Policy Number" className={inputClass} />
          <input type="number" min="0" step="0.01" {...paymentForm.register("paymentAmount")} placeholder="Payment Amount" className={inputClass} />
          <input type="date" {...paymentForm.register("paymentDate")} className={inputClass} />
          <select {...paymentForm.register("paymentMethod")} className={inputClass}>
            <option value="">Payment Method</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="check">Check</option>
          </select>
          <select {...paymentForm.register("paymentStatus")} className={inputClass}>
            <option value="">Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <input {...paymentForm.register("invoiceNumber")} placeholder="Invoice Number" className={inputClass} />
          <input type="number" min="0" step="0.01" {...paymentForm.register("outstandingBalance")} placeholder="Outstanding Balance" className={inputClass} />
          <input type="number" min="0" step="0.01" {...paymentForm.register("lateFees")} placeholder="Late Fees" className={inputClass} />
          <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-electric to-violet px-4 py-2 text-sm text-white md:col-span-2">
            Save Payment
          </button>
        </form>
      </ModalForm>
    </PageTransition>
  );
};

export default InsuranceCustomersPage;
