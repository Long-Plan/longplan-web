import { ProgressBar } from "./ProgessBar";
import { CreditListGroup } from "./CreditListGroup";
import { CreditSummary } from "./CreditSummaryBox";
import { FreeSummary } from "./FreeSummary";

const SummaryBox = ({
  totalCredits,
  totalGeCredits,
  totalGeEarnedCredits,
  totalCoreAndMajorEarnedCredits,
  totalCoreAndMajorRequiredCredits,
  totalFreeElectiveCredits,
  totalFreeEarnedCredits,
}: {
  totalCredits: number;
  totalGeCredits: number;
  totalGeEarnedCredits: number;
  totalCoreAndMajorEarnedCredits: number;
  totalCoreAndMajorRequiredCredits: number;
  totalFreeElectiveCredits: number;
  totalFreeEarnedCredits: number;
}) => {
  return (
    <div className="static top-50 w-70 p-4 bg-white rounded-[20px] cursor-default">
      <div className="mt-4">
        <h3 className="text-center my-4">หน่วยกิตสะสม</h3>

        {/* General Education Summary */}
        <CreditSummary
          title="หมวดศึกษาทั่วไป"
          titleEng="General Education"
          totalCredits={totalGeCredits}
          earnedCredits={totalGeEarnedCredits}
          borderColor="border-amber-300"
          bgColor="bg-yellow-50"
          textColor="text-collection-1-yellow-shade-y7"
        />

        {/* General Education Groups */}
        <CreditListGroup
          groups={[
            {
              groupName: "Learner Person",
              requiredCredits: 9,
              earnedCredits: 9,
            },
            {
              groupName: "Co-Creator",
              requiredCredits: 6,
              earnedCredits: 6,
            },
            {
              groupName: "Active Citizen",
              requiredCredits: 6,
              earnedCredits: 6,
            },
            {
              groupName: "Elective",
              requiredCredits: 9,
              earnedCredits: 6,
            },
          ]}
          borderColor="border-amber-300"
        />

        {/* Major Requirements Summary */}
        <CreditSummary
          title="หมวดวิชาเฉพาะ"
          titleEng="Major Requirements"
          totalCredits={totalCoreAndMajorRequiredCredits}
          earnedCredits={totalCoreAndMajorEarnedCredits}
          borderColor="border-blue-shadeb4"
          bgColor="bg-collection-1-b-sl"
          textColor="text-blue-shadeb5"
        />

        {/* Major Requirement Groups */}
        <CreditListGroup
          groups={[
            {
              groupName: "Core",
              requiredCredits: 30,
              earnedCredits: 25,
            },
            {
              groupName: "Major Elective",
              requiredCredits: 15,
              earnedCredits: 10,
            },
            {
              groupName: "Major Required",
              requiredCredits: 6,
              earnedCredits: 6,
            },
          ]}
          borderColor="border-blue-shadeb4"
        />

        {/* Free Elective Summary */}
        <FreeSummary
          title="หมวดวิชาเลือกเสรี"
          titleEng="Free Elective"
          totalCredits={totalFreeElectiveCredits}
          earnedCredits={totalFreeEarnedCredits}
          borderColor="border-neutral-400"
          bgColor="bg-neutral-100"
          textColor="text-neutral-600"
        />
      </div>

      {/* Total Credits Progress Bar */}
      {totalCredits ===
        totalCoreAndMajorRequiredCredits +
          totalGeCredits +
          totalFreeElectiveCredits && (
        <div className="mt-5">
          <h3 className="text-center">หน่วยกิตรวม</h3>
          <p className="text-center text-collection-1-black-shade-bl2 m-2 text-sm">
            {`คุณเรียนไปแล้ว ${
              totalCoreAndMajorEarnedCredits +
              totalGeEarnedCredits +
              totalFreeEarnedCredits
            } จาก ${
              totalCoreAndMajorRequiredCredits +
              totalGeCredits +
              totalFreeElectiveCredits
            } หน่วยกิต`}
          </p>
          <ProgressBar
            earnedCredits={
              totalCoreAndMajorEarnedCredits +
              totalGeEarnedCredits +
              totalFreeEarnedCredits
            }
            maxCredits={
              totalCoreAndMajorRequiredCredits +
              totalGeCredits +
              totalFreeElectiveCredits
            }
          />
        </div>
      )}
    </div>
  );
};

export default SummaryBox;
