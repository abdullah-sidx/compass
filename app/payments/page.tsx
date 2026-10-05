import React from "react";
import { getPayments, getStats } from "@/lib/data";
import PaymentsDashboard from "@/components/payments/PaymentsDashboard";

export default function PaymentsPage() {
  const payments = getPayments();
  const stats = getStats();

  return (
    <PaymentsDashboard
      initialPayments={payments}
      totalCompDueCr={stats.totalCompensationDueCr}
      totalCompPaidCr={stats.totalCompensationPaidCr}
    />
  );
}
