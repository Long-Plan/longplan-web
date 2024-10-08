import { CheckCircleIcon } from "@heroicons/react/20/solid";

export const getColorForGroupName = (groupName: string): string => {
  switch (groupName) {
    case "Learner Person":
      return "text-collection-1-yellow-shade-y7";
    case "Innovative Co-creator":
      return "text-collection-1-co-creator-or1";
    case "Active Citizen":
      return "text-collection-1-active-citizen-r2";
    case "GE Elective":
      return "text-collection-1-electives-brown1";
    case "Core":
      return "text-collection-1-core-sk1";
    case "Major Required":
      return "text-blue-shadeb5";
    case "Major Elective":
      return "text-blue-shadeb5";
    case "Free Elective":
      return "text-collection-1-black-shade-bl4";
    default:
      return "collection-1-yellow-shade-y6"; // Default color
  }
};

// CreditListGroup.tsx
export const CreditListGroup = ({
  groups,
  borderColor,
  isGE,
}: {
  groups: Record<
    string,
    {
      groupName: string;
      earnedCredits: number;
      totalCredit: number;
    }
  >;
  borderColor: string;
  isGE?: boolean;
}) => {
  const geGroups = [
    "Learner Person",
    "Innovative Co-creator",
    "Active Citizen",
    "GE Elective",
  ];
  const filteredGroups = Object.values(groups).filter((group) =>
    isGE
      ? geGroups.includes(group.groupName)
      : !geGroups.includes(group.groupName)
  );

  return (
    <div
      className={`rounded-bl-2xl rounded-br-2xl bg-white px-4 py-1 border-t-0 border border-solid ${borderColor} mb-4 `}
    >
      <ul className="list-none">
        {filteredGroups.map((group) => (
          <li
            key={group.groupName}
            className={`my-3 text-[14px] flex items-center space-x-2`}
          >
            {/* CheckCircleIcon or bullet */}
            {group.earnedCredits >= group.totalCredit ? (
              <CheckCircleIcon
                className={`w-6 h-6 ${getColorForGroupName(group.groupName)}`}
                aria-label="Completed"
              />
            ) : (
              <span
                className={`w-6 h-6 text-center ${getColorForGroupName(
                  group.groupName
                )} font-bold`}
              >
                •
              </span>
            )}

            {/* Group Name and Credits */}
            <span
              className={`${getColorForGroupName(
                group.groupName
              )} flex-grow flex w-full font-semibold`}
            >
              {`${group.groupName}`}
            </span>
            <span
              className={`${getColorForGroupName(
                group.groupName
              )} text-right w-[100px] font-semibold`}
            >
              {`${group.earnedCredits} / ${group.totalCredit}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
