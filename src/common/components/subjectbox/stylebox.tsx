import React from "react";

function truncate(str: string, n: number): string {
  return str.length > n ? `${str.substring(0, n - 1)}...` : str;
}

// "course_no": "001101",
// "title_long_th": "ภาษาอังกฤษพื้นฐาน 1",
// "title_long_en": "Fundamental English 1",
// "course_desc_th": "การสื่อสารภาษาอังกฤษเพื่อการปฏิสัมพันธ์ในชีวิตประจำวันตามมาตรฐาน CEFR ระดับ B1+ ในบริบททางสังคมและวัฒนธรรมที่หลากหลายเพื่อการเรียนรู้ตลอดชีวิต",
// "course_desc_en": "Communication in English for everyday interactions based on CEFR B1+ in various social and cultural contexts for life-long learning",
// "credit": 3,

export interface BoxProps {
  course_no: string;
  course_title_long_th: string;
  course_title_long_en: string;
  credit: number;
  course_category?: string;
  course_desc_th?: string;
  course_desc_en?: string;
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
  course_title_long_en,
  credit,
  is_enrolled,
  borderColor,
  bgColor,
  textColor,
  badgeColor,
}) => (
  <div
    className={`inline-flex items-start justify-end gap-[10px] pl-0 pr-[5px] py-0 relative ${
      is_enrolled ? bgColor : "bg-white"
    } rounded-[10px] border border-solid ${borderColor} shadow-box-shadow cursor-pointer transition-all duration-300 transform group hover:scale-110`} // Added cursor-pointer for visual feedback
  >
    <div
      className={`relative w-[7px] h-[45px] ${badgeColor} rounded-[10px_0px_0px_10px]`}
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
        <span className={`text-[11px] leading-[19.7px] ${textColor}`}>
          {truncate(course_title_long_en, 8)}
        </span>
      </>
    </div>
    <div className="inline-flex flex-col h-[19px] items-start justify-end gap-[10px] relative flex-[0_0_auto]">
      <div
        className={`font-h2 ${textColor} text-[10px]
          } text-center tracking-[0] leading-[15.8px] whitespace-nowrap font-semibold`}
      >
        {credit}
      </div>
    </div>
  </div>
);

export const CoCreBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    bgColor="bg-collection-1-co-creator-orbg"
    borderColor="border-collection-1-co-creator-or"
    textColor="text-collection-1-co-creator-or1"
    badgeColor="bg-collection-1-co-creator-or"
  />
);

export const CoreBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    bgColor="bg-collection-1-core-skybg"
    borderColor="border-collection-1-core-sk2"
    textColor="text-collection-1-core-sk2"
    badgeColor="bg-collection-1-core-sk2"
  />
);

export const GeBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    bgColor="bg-collection-1-electives-brown-sl"
    borderColor="border-collection-1-electives-brown"
    textColor="text-collection-1-electives-brown1"
    badgeColor="bg-collection-1-electives-brown"
  />
);

export const LearnerBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    bgColor="bg-collection-1-yellow-shade-ybg"
    borderColor="border-collection-1-yellow-shade-y5-5"
    textColor="text-collection-1-yellow-shade-y7"
    badgeColor="bg-collection-1-yellow-shade-y5-5"
  />
);

export const MajorBox: React.FC<BoxProps> = (props) => (
  <StyledBox
    {...props}
    bgColor="bg-collection-1-b-sl"
    borderColor="border-blue-shadeb5"
    textColor="text-blue-shadeb5"
    badgeColor="bg-blue-shadeb5"
  />
);

export const FreeBox: React.FC = () => (
  <StyledBox
    course_no="000000"
    course_title_long_en="Free Elective"
    credit={0}
    borderColor="border-collection-1-black-shade-bl4"
    bgColor="bg-collection-1-black-shade-bl4"
    textColor="text-collection-1-black-shade-bl4"
    badgeColor="text-collection-1-black-shade-bl4"
    course_title_long_th={""}
    course_desc_th={""}
    course_desc_en={""}
  />
);
