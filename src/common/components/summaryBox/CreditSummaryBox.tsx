import { CheckBadgeIcon } from "@heroicons/react/20/solid";

export const CreditSummary = ({
  title,
  titleEng,
  totalCredits,
  earnedCredits,
  borderColor,
  bgColor,
  textColor,
}: {
  title: string;
  titleEng: string;
  totalCredits: number;
  earnedCredits: number;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) => (
  <div
    className={`w-auto h-12 p-1 ${bgColor} rounded-tl-2xl rounded-tr-2xl border-b-0 border border-solid ${borderColor} flex items-center gap-8`}
  >
    <p className="flex flex-row justify-center items-center ml-4">
      <span className={`${textColor} text-sm flex flex-row items-start `}>
        {earnedCredits >= totalCredits && (
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
