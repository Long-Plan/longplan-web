import React from "react";

const BlankBox: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-1.5">
      <div className="inline-flex items-start justify-end gap-[10px] pl-0 pr-[5px] py-0 relative bg-white rounded-[10px] border border-solid border-gray-300">
        <div className="relative w-[7px] h-[45px] bg-grey rounded-[10px_0px_0px_10px]" />
        <div className="relative w-[64px] font-h7 text-gray-shadegr6 text-[16px] text-center tracking-[0] leading-[21px]">
          <span className="font-h7 text-gray-shadegr6 text-[13px] tracking-[0] leading-[21px]">
            <br />
          </span>
          <span className="text-[11px] text-white leading-[19.7px]">.</span>
        </div>
        <div className="inline-flex flex-col h-[19px] items-start justify-end gap-[10px] relative flex-[0_0_auto]">
          <div className="font-h2 text-gray-shadegr6 text-[10px] text-center tracking-[0] leading-[15.8px] whitespace-nowrap"></div>
        </div>
      </div>
    </div>
  );
};

export default BlankBox;
