"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { toast } from "react-hot-toast";
function FailureContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const mihpayid = searchParams.get("mihpayid");

  console.log("Failure page params:", { status, mihpayid });
  toast.error(
    "It seems that you've cancelled the payment process. Please try again.",
  );
  const message =
    status === "cancel"
      ? `You have canceled the payment process. Transaction ID: ${mihpayid}`
      : status === "failure"
        ? `Payment failed due to an error. Transaction ID: ${mihpayid}`
        : `Unknown error occurred. Please try again. If this error presists,
        please contact support@aerocog.tech with the transaction ID: ${mihpayid}`;

  return (
    <div
      style={{ marginTop: "200px", marginBottom: "200px", textAlign: "center" }}
    >
      <h1 className="text-red-500">Payment Failed</h1>
      <p>{message}</p>
      <br />
      <a className=" mx-auto underline decoration-red-500 underline-offset-2"
       href="mailto:support@aerocog.tech">Support</a>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            marginTop: "200px",
            marginBottom: "200px",
            textAlign: "center",
          }}
        >
          Loading...
        </div>
      }
    >
      <FailureContent />
    </Suspense>
  );
}
