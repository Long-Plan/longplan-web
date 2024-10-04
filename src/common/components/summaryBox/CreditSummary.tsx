import { CheckBadgeIcon, CheckCircleIcon } from "@heroicons/react/20/solid";

// CreditSummary.tsx
const CreditSummary = ({
  title,
  titleEng,
  totalCredits,
  earnedCredits,
  maxCredits,
  borderColor,
  bgColor,
  textColor,
}: {
  title: string;
  titleEng: string;
  totalCredits: number;
  earnedCredits: number;
  maxCredits: number;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) => (
  <div
    className={`w-auto h-12 p-1 ${bgColor} rounded-tl-2xl rounded-tr-2xl border-b-0 border border-solid ${borderColor} flex items-center gap-8`}
  >
    <p className="flex flex-row justify-center items-center ml-4">
      <span className={`${textColor} text-sm flex flex-row items-start `}>
        {earnedCredits >= maxCredits && (
          <CheckBadgeIcon className={`${borderColor} w-8 h-8`} />
        )}

        <div className="grid grid-rows-auto flex-grow">
          {title}
          <span
            className={`${textColor} text-xs font-medium text-center`}
          >{`(${titleEng})`}</span>
        </div>
      </span>
    </p>
    <div
      className={`ml-auto px-2 mr-2 bg-white rounded-[10px] border border-solid ${borderColor} justify-center items-center  inline-flex`}
    >
      <div className={`text-center text-sm font-bold ${textColor} `}>
        {`${earnedCredits} / ${totalCredits}`}
      </div>
    </div>
  </div>
);

const FreeSummary = ({
  title,
  titleEng,
  totalCredits,
  earnedCredits,
  maxCredits,
  borderColor,
  bgColor,
  textColor,
}: {
  title: string;
  titleEng: string;
  totalCredits: number;
  earnedCredits: number;
  maxCredits: number;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) => (
  <div
    className={`w-auto h-12 p-1 ${bgColor} rounded-tl-2xl rounded-2xl border border-solid ${borderColor} flex items-center gap-8`}
  >
    <p className="flex flex-row justify-center items-center ml-4">
      <span className={`${textColor} text-sm flex flex-row items-start `}>
        {earnedCredits >= maxCredits && (
          <CheckBadgeIcon className={`${borderColor} w-8 h-8`} />
        )}

        <div className="grid grid-rows-auto">
          {title}
          <span
            className={`${textColor} text-xs font-medium text-center`}
          >{`(${titleEng})`}</span>
        </div>
      </span>
    </p>
    <div
      className={`ml-auto px-2 mr-2 bg-white rounded-[10px] border border-solid ${borderColor} justify-center items-center gap-2.5 inline-flex`}
    >
      <div className={`text-center text-sm font-bold text-${textColor}`}>
        {`${earnedCredits} / ${totalCredits}`}
      </div>
    </div>
  </div>
);

const getColorForGroupName = (groupName: string): string => {
  switch (groupName) {
    case "Learner Person":
      return "collection-1-yellow-shade-y7";
    case "Co-Creator":
      return "collection-1-co-creator-or1";
    case "Active Citizen":
      return "collection-1-active-citizen-r2";
    case "Elective":
      return "collection-1-electives-brown1";
    case "Core":
      return "collection-1-core-sk1";
    case "Major Required":
      return "blue-shadeb5";
    case "Major Elective":
      return "blue-shadeb5";
    case "Free Elective":
      return "collection-1-black-shade-bl4";
    default:
      return "collection-1-yellow-shade-y6"; // Default color
  }
};

// CreditListGroup.tsx
const CreditListGroup = ({
  groups,
  groupCredits,
  borderColor,
}: {
  groups: { groupName: string; requiredCredits: number }[];
  groupCredits: { [key: string]: number };
  borderColor: string;
}) => (
  <div
    className={`rounded-bl-2xl rounded-br-2xl bg-white px-4 py-1 border-t-0 border border-solid ${borderColor} mb-4`}
  >
    <ul className="list-none">
      {groups.map((group) => (
        <li
          key={group.groupName}
          className={`my-3 text-[14px] flex items-center space-x-2`}
        >
          {/* CheckCircleIcon or bullet */}
          {groupCredits[group.groupName] === group.requiredCredits ? (
            <CheckCircleIcon
              className={`w-6 h-6 text-${getColorForGroupName(
                group.groupName
              )}`}
              aria-label="Completed"
            />
          ) : (
            <span
              className={`w-6 h-6 text-center text-${getColorForGroupName(
                group.groupName
              )} font-bold`}
            >
              •
            </span>
          )}

          {/* Group Name and Credits */}
          <span
            className={`text-${getColorForGroupName(
              group.groupName
            )} flex-grow flex w-full font-semibold`}
          >
            {`${group.groupName}`}
          </span>
          <span
            className={`text-${getColorForGroupName(
              group.groupName
            )} text-right w-[100px] font-semibold`}
          >
            {`${groupCredits[group.groupName]} / ${group.requiredCredits}`}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

// ProgressBar.tsx
const ProgressBar = ({
  totalCredits,
  maxCredits,
}: {
  totalCredits: number;
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
          {`${Math.min(totalCredits, maxCredits)} / ${maxCredits}`}
        </span>
      </div>
    </div>
    <div className="h-4 relative w-full rounded-full overflow-hidden bg-blue-shadeb05 border border-solid border-1 border-blue-shadeb5">
      <div
        className="h-full rounded-full bg-blue-shadeb3"
        style={{
          width: `${Math.min((totalCredits / maxCredits) * 100, 100)}%`,
        }}
      ></div>
    </div>
  </div>
);

// MainComponent.tsx
const SummaryBox = ({
  groupCredits,
  totalCredits,
  totalGeCredits,
  totalCoreAndMajorEarnedCredits,
  totalCoreAndMajorRequiredCredits,
  curriculumData,
}: {
  groupCredits: { [key: string]: number };
  totalCredits: number;
  totalGeCredits: number;
  totalCoreAndMajorEarnedCredits: number;
  totalCoreAndMajorRequiredCredits: number;
  curriculumData: any; // You can define proper types if needed
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
          earnedCredits={
            groupCredits["Learner Person"] +
            groupCredits["Co-Creator"] +
            groupCredits["Active Citizen"] +
            groupCredits["Elective"]
          }
          maxCredits={totalGeCredits}
          borderColor="border-amber-300"
          bgColor="bg-yellow-50"
          textColor="text-collection-1-yellow-shade-y7"
        />

        {/* General Education Groups */}
        <CreditListGroup
          groups={curriculumData.geGroups}
          groupCredits={groupCredits}
          borderColor="border-amber-300"
        />

        {/* Major Requirements Summary */}
        <CreditSummary
          title="หมวดวิชาเฉพาะ"
          titleEng="Major Requirements"
          totalCredits={totalCoreAndMajorRequiredCredits}
          earnedCredits={totalCoreAndMajorEarnedCredits}
          maxCredits={totalCoreAndMajorRequiredCredits}
          borderColor="border-blue-shadeb4"
          bgColor="bg-collection-1-b-sl"
          textColor="text-blue-shadeb5"
        />

        {/* Major Requirement Groups */}
        <CreditListGroup
          groups={curriculumData.coreAndMajorGroups}
          groupCredits={groupCredits}
          borderColor="border-blue-shadeb4"
        />

        {/* Free Elective Summary */}
        <FreeSummary
          title="หมวดวิชาเลือกเสรี"
          titleEng="Free Elective"
          totalCredits={curriculumData.freeElectiveCredits}
          earnedCredits={groupCredits["Free Elective"]}
          maxCredits={curriculumData.freeElectiveCredits}
          borderColor="border-neutral-400"
          bgColor="bg-neutral-100"
          textColor="text-neutral-600"
        />
      </div>

      {/* Total Credits Progress Bar */}
      <div className="mt-5">
        <h3 className="text-center">หน่วยกิตรวม</h3>
        <p className="text-center text-collection-1-black-shade-bl2 m-2 text-sm">
          {`คุณเรียนไปแล้ว ${totalCredits} จาก ${
            curriculumData.requiredCredits || " "
          } หน่วยกิต`}
        </p>
        <ProgressBar
          totalCredits={totalCredits}
          maxCredits={curriculumData.requiredCredits}
        />
      </div>
    </div>
  );
};

export default SummaryBox;
