"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function FailureContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const mihpayid = searchParams.get("mihpayid");

  console.log("Failure page params:", { status, mihpayid });

  const message =
  status === "cancel"
    ? `You have canceled the payment process. Transaction ID: ${mihpayid}`
    : status === "failure"
    ? `Payment failed due to an error. Transaction ID: ${mihpayid}`
    : `Unknown error occurred. Please try again. If this error presists, please contact support@aerocog.tech`;

  return (
    <div style={{ marginTop: '200px', marginBottom: '200px', textAlign: 'center' }}>
      <h1>Payment Failed</h1>
      <p >{message}</p>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={<div style={{ marginTop: '200px', marginBottom: '200px', textAlign: 'center' }}>Loading...</div>}>
      <FailureContent />
    </Suspense>
  );
}
