"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function FailureContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status"); // "cancel" or "failure"
  const mihpayid = searchParams.get("mihpayid"); // PayU's transaction ID

  const message =
    status === "cancel"
      ? "You have canceled the payment process."
      : "Payment failed due to an error. Please try again.";

  console.log("Failure page params:", { status, mihpayid });

  return (
    <div>
      <h1>Payment Failed</h1>
      <p>{message}</p>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailureContent />
    </Suspense>
  );
}
