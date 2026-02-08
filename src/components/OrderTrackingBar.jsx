import { motion } from "framer-motion";
import { Check, Package, Truck, Home, XCircle } from "lucide-react";

const statusOrder = ["pending", "paid", "processing", "shipped", "delivered"];

function getProgress(status) {
  if (status === "cancelled") return -1;
  const idx = statusOrder.indexOf(status);
  // pending/paid/processing = step 1 active
  // shipped = step 3 active (steps 1&2 completed)
  // delivered = all completed
  if (idx === -1) return 1;
  if (idx <= 2) return 1; // pending/paid/processing -> step 1
  if (idx === 3) return 3; // shipped -> step 3
  return 4; // delivered -> all done (step 3 completed)
}

function getSteps(status) {
  const isDelivered = status === "delivered";
  return [
    { key: "processing", label: "Préparation de votre commande", icon: Package },
    { key: "shipped", label: "Expédition", icon: Truck },
    {
      key: "delivery",
      label: isDelivered ? "Commande livrée" : "En cours de livraison",
      icon: Home
    },
  ];
}

export default function OrderTrackingBar({ status }) {
  if (status === "cancelled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
      >
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-red-700">Commande annulée</p>
          <p className="text-sm text-red-500">
            Cette commande a été annulée.
          </p>
        </div>
      </motion.div>
    );
  }

  const progress = getProgress(status);
  const steps = getSteps(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2"
    >
      <div className="flex items-start justify-between relative">
        {/* Connecting lines */}
        <div className="absolute top-5 left-0 right-0 flex px-[40px]">
          {[0, 1].map((i) => {
            const stepNum = i + 1;
            // Line connects from step to step+1
            // Show violet if we've reached the next step
            const isCompleted = progress > stepNum;
            return (
              <div key={i} className="flex-1 h-0.5 mx-1">
                <div
                  className={`h-full rounded-full transition-colors duration-500 ${
                    isCompleted ? "bg-violet-500" : "bg-zinc-200"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Steps */}
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = progress > stepNum;
          const isActive = progress === stepNum;
          const isPending = progress < stepNum;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center text-center relative z-10 flex-1"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-violet-100 text-violet-600 ring-2 ring-violet-500 ring-offset-2"
                    : "bg-zinc-100 text-zinc-400"
                } ${isActive ? "animate-pulse" : ""}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <p
                className={`mt-2 text-xs font-medium leading-tight max-w-[100px] ${
                  isCompleted
                    ? "text-emerald-600"
                    : isActive
                    ? "text-violet-600"
                    : "text-zinc-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
