import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const plans = [
  {
    id: 1,
    name: "CPE Study Plan 2563",
    major: "CPE",
    year: "2563",
    plan: "normal",
    default: true,
  },
  {
    id: 2,
    name: "CPE COOP Plan 2563",
    major: "CPE",
    year: "2563",
    plan: "COOP",
    default: false,
  },
];

type Plan = {
  id: number;
  name: string;
  major: string;
  year: string;
  plan: string;
  default: boolean;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PlanSelection({
  onPlanChange,
}: {
  onPlanChange: (plan: Plan) => void;
}) {
  const [selected, setSelected] = useState<Plan>(plans[0]);

  const handleChange = (plan: Plan) => {
    setSelected(plan);
    onPlanChange(plan);
  };

  return (
    <div className="w-screen plan-select">
      <div className="flex justify-between items-center mx-auto gap-6 pb-10 mt-12">
        <h1>แผนการเรียนหลักสูตร</h1>
        <div className="relative">
          <Listbox value={selected} onChange={handleChange}>
            {({ open }) => (
              <>
                <ListboxButton className="relative flex items-center h-12 w-auto pl-3 pr-12 text-left cursor-pointer rounded-3xl bg-white border-2 border-blue-shadeb5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <div className="flex items-center">
                    <span className="ml-3 font-bold text-blue-shadeb5 truncate">
                      {selected.name}
                    </span>
                    {selected.default && (
                      <span className="ml-4 px-2.5 py-0.5 bg-gray-100 text-xs text-gray-500 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronUpDownIcon
                      className="w-5 h-5 text-blue-shadeb3"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>

                <Transition
                  show={open}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full py-1 bg-white shadow-lg rounded-[20px] ring-1 ring-blue-shadeb5 ring-opacity-5 overflow-auto focus:outline-none md:text-md">
                    {plans.map((plan) => (
                      <ListboxOption
                        key={plan.id}
                        value={plan}
                        className={({ active }) =>
                          classNames(
                            active
                              ? "bg-gray-100 text-blue-shadeb4"
                              : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-3 pr-9"
                          )
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center">
                              <span
                                className={classNames(
                                  selected
                                    ? "font-bold text-blue-shadeb5"
                                    : "font-normal",
                                  "ml-3 block truncate"
                                )}
                              >
                                {plan.name}
                              </span>
                              {plan.default && (
                                <span className="ml-4 px-2.5 py-0.5 bg-gray-100 text-xs text-gray-500 rounded-full font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            {selected && (
                              <span
                                className={classNames(
                                  active
                                    ? "text-blue-shadeb5"
                                    : "text-blue-shadeb3",
                                  "absolute inset-y-0 right-0 flex items-center pr-4"
                                )}
                              >
                                <CheckIcon
                                  className="w-5 h-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </>
            )}
          </Listbox>
        </div>
      </div>
    </div>
  );
}
