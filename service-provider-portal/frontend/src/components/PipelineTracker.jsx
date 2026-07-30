const baseStages = ["Registered", "Profile complete", "Documents submitted", "Under review"];

// Renders the applicant's journey as a filled track — the portal's signature element.
const PipelineTracker = ({ profileCompleted, documentsCount, status }) => {
  let activeIndex = 0;
  if (profileCompleted) activeIndex = 1;
  if (profileCompleted && documentsCount > 0) activeIndex = 2;
  if (status !== "pending" || (profileCompleted && documentsCount > 0)) activeIndex = 3;

  const stages = [...baseStages];
  let finalIndex = activeIndex;
  let finalLabel = null;

  if (status === "approved") {
    finalLabel = "Approved";
    finalIndex = 4;
  } else if (status === "rejected") {
    finalLabel = "Rejected";
    finalIndex = 4;
  }

  const allStages = finalLabel ? [...stages, finalLabel] : stages;

  return (
    <div className="w-full">
      <div className="flex items-center">
        {allStages.map((stage, i) => {
          const isDone = i < finalIndex || (i === finalIndex && (finalLabel || status !== "pending"));
          const isCurrent = i === finalIndex && !finalLabel;
          const isRejectedFinal = finalLabel === "Rejected" && i === finalIndex;
          const isApprovedFinal = finalLabel === "Approved" && i === finalIndex;

          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-[11px] font-semibold transition-colors ${
                    isRejectedFinal
                      ? "border-danger bg-danger text-white"
                      : isApprovedFinal
                      ? "border-ok bg-ok text-white"
                      : isDone
                      ? "border-ink-800 bg-ink-800 text-white"
                      : isCurrent
                      ? "border-amber-400 bg-amber-50 text-amber-600"
                      : "border-ink-200 bg-white text-ink-300"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`hidden max-w-[5.5rem] text-center text-[11px] font-medium leading-tight sm:block ${
                    isDone || isCurrent ? "text-ink-700" : "text-ink-300"
                  }`}
                >
                  {stage}
                </span>
              </div>
              {i < allStages.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 rounded transition-colors ${
                    i < finalIndex ? "bg-ink-800" : "bg-ink-100"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineTracker;
