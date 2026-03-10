import { useEffect, useState } from "react";
import { Activity, AlertCircle, CircleDollarSign, DollarSign, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import PageTransition from "../components/ui/PageTransition";
import StatCard from "../components/ui/StatCard";
import {
  fetchInsuranceClaims,
  fetchInsuranceCustomers,
  fetchInsurancePayments,
  fetchInsurancePolicies
} from "../services/insuranceService";
import { currency } from "../utils/formatters";

const InsuranceOverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activePolicies: 0,
    pendingClaims: 0,
    collectedPayments: 0,
    outstandingBalance: 0,
    approvalRate: 0
  });

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const [customers, policies, claims, payments] = await Promise.all([
          fetchInsuranceCustomers(),
          fetchInsurancePolicies(),
          fetchInsuranceClaims(),
          fetchInsurancePayments()
        ]);

        if (!isMounted) return;

        const totalCustomers = customers.length;
        const activePolicies = policies.filter((policy) => String(policy.policyStatus || "").toLowerCase() === "active").length;
        const pendingClaims = claims.filter((claim) => String(claim.claimStatus || "").toLowerCase() === "pending").length;
        const collectedPayments = payments
          .filter((payment) => String(payment.paymentStatus || "").toLowerCase() === "paid")
          .reduce((sum, payment) => sum + Number(payment.paymentAmount || 0), 0);
        const outstandingBalance = payments.reduce((sum, payment) => sum + Number(payment.outstandingBalance || 0), 0);
        const approvedClaims = claims.filter((claim) => String(claim.claimStatus || "").toLowerCase() === "approved").length;
        const approvalRate = claims.length ? (approvedClaims / claims.length) * 100 : 0;

        setStats({
          totalCustomers,
          activePolicies,
          pendingClaims,
          collectedPayments,
          outstandingBalance,
          approvalRate
        });
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Failed to load insurance statistics");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageTransition>
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Clients" value={stats.totalCustomers} icon={UsersRound} />
          <StatCard label="Active Policies" value={stats.activePolicies} icon={ShieldCheck} />
          <StatCard label="Pending Claims" value={stats.pendingClaims} icon={AlertCircle} color="violet" />
          <StatCard label="Collected Payments" value={currency(stats.collectedPayments)} icon={CircleDollarSign} color="violet" />
          <StatCard label="Outstanding Balance" value={currency(stats.outstandingBalance)} icon={DollarSign} />
          <StatCard label="Claim Approval Rate" value={`${stats.approvalRate.toFixed(1)}%`} icon={Activity} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="glass neon-border rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-electric" />
              <h3 className="font-display text-lg font-semibold text-white">Insurance Operations</h3>
            </div>
            <p className="text-sm text-blue-100/70">
              Manage policy leads, appointments, and AI-powered call outcomes with unified customer profiles.
            </p>
            {loading ? <p className="mt-3 text-xs text-blue-100/70">Refreshing insurance statistics...</p> : null}
            {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
          </article>
          <article className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-violet" />
              <h3 className="font-display text-lg font-semibold text-white">Shared Profile Integrity</h3>
            </div>
            <p className="text-sm text-blue-100/70">
              Insurance and TikTok records are attached to a single profile, so cross-module transitions never reset data.
            </p>
          </article>
        </div>
      </section>
    </PageTransition>
  );
};

export default InsuranceOverviewPage;
