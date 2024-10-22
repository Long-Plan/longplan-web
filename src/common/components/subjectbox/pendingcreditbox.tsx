import React from "react";

interface PendingCreditBoxProps {
  courseCredit: number;
}

const PendingCreditBox: React.FC<PendingCreditBoxProps> = ({
  courseCredit,
}) => {
  return (
    <div className="flex items-center justify-center w-auto h-6 px-4 bg-white rounded-2xl border-2 border-solid border-blue-shadeb3 text-blue-shadeb3">
      <span className="text-xs">{courseCredit}</span>
    </div>
  );
};

export default PendingCreditBox;
