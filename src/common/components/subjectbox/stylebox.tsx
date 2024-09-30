import React from "react";

function truncate(str: string, n: number): string {
  return str.length > n ? `${str.substring(0, n - 1)}...` : str;
}

export interface BoxProps {
  course_no: string;
  course_title: string;
  course_credit: number;
  course_group: string;
  is_enrolled?: boolean;
}

interface StyledBoxProps extends BoxProps {
  borderColor: string;
  bgColor: string;
  textColor: string;
  badgeColor: string;
}

const StyledBox: React.FC<StyledBoxProps> = ({
  course_no,
  course_title,
  course_credit,
  borderColor,
  bgColor,
  textColor,
  badgeColor,
}) => (
  <div
    className={`inline-flex items-start justify-end gap-[10px] pl-0 pr-[5px] py-0 relative bg-white rounded-[10px] border border-solid ${borderColor} shadow-box-shadow cursor-pointer transition-all duration-300 transform group hover:scale-110`} // Added cursor-pointer for visual feedback
  >
    <div
      className={`relative w-[7px] h-[45px] ${bgColor} rounded-[10px_0px_0px_10px]`}
    />
    <div
      className={`relative w-[64px] font-h7 ${textColor} text-[16px] text-center tracking-[0] leading-[21px]`}
    >
      <>
        <span
          className={`font-h7 ${textColor} text-[13px] tracking-[0] leading-[21px] font-semibold`}
        >
          {course_no}
          <br />
        </span>
        <span className={`text-[11px] leading-[19.7px] ${badgeColor}`}>
          {truncate(course_title, 8)}
        </span>
      </>
    </div>
    <div className="inline-flex flex-col h-[19px] items-start justify-end gap-[10px] relative flex-[0_0_auto]">
      <div
        className={`font-h2 ${textColor} text-[10px]
          } text-center tracking-[0] leading-[15.8px] whitespace-nowrap font-semibold`}
      >
        {course_credit}
      </div>
    </div>
  </div>
);

export const CoCreElecBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    borderColor="border-collection-1-co-creator-or"
    bgColor="bg-collection-1-co-creator-or"
    textColor="text-collection-1-co-creator-or1"
    badgeColor="text-collection-1-co-creator-or1"
  />
);

export const GEElecBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    borderColor="border-collection-1-electives-brown"
    bgColor="bg-collection-1-electives-brown"
    textColor="text-collection-1-electives-brown"
    badgeColor="text-collection-1-electives-brown"
  />
);

export const LearnerElecBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    borderColor="border-collection-1-yellow-shade-y5"
    bgColor="bg-collection-1-yellow-shade-y5"
    textColor="text-collection-1-yellow-shade-y7"
    badgeColor="text-collection-1-yellow-shade-y7"
  />
);

export const MajorElecBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    borderColor="border-blue-shadeb5"
    bgColor="bg-blue-shadeb5"
    textColor="text-blue-shadeb5"
    badgeColor="text-blue-shadeb5"
  />
);

export const FreeBox: React.FC = () => (
  <StyledBox
    course_no="000000"
    course_title="Free Elective"
    course_credit={0}
    borderColor="border-collection-1-black-shade-bl4"
    bgColor="bg-collection-1-black-shade-bl4"
    textColor="text-collection-1-black-shade-bl4"
    badgeColor="text-collection-1-black-shade-bl4"
    course_group={"Free Elective"}
  />
);
