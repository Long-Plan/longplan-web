// ProgressBar.tsx
export const ProgressBar = ({
  earnedCredits,
  maxCredits,
}: {
  earnedCredits: number;
  maxCredits: number;
}) => (
  <div className="relative pt-3">
    <div className="flex mb-2 items-center justify-between">
      <div>
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-shadeb3 bg-blue-shadeb05">
          หน่วยกิตสะสม
        </span>
      </div>
      <div className="text-right">
        <span className="text-xs font-semibold inline-block text-blue-shadeb3">
          {`${Math.min(earnedCredits, maxCredits)} / ${maxCredits}`}
        </span>
      </div>
    </div>
    <div className="h-4 relative w-full rounded-full overflow-hidden bg-blue-shadeb05 border border-solid border-1 border-blue-shadeb5">
      <div
        className="h-full rounded-full bg-blue-shadeb3"
        style={{
          width: `${Math.min((earnedCredits / maxCredits) * 100, 100)}%`,
        }}
      ></div>
    </div>
  </div>
);
