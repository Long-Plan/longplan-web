import { useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import {
  CurriculumQuestion,
  CurriculumQuestionChoice,
} from "../../../types/curricula";
import { getCurriculaByMajorID } from "../../apis/curricula/queries";
import useAccountContext from "../../contexts/AccountContext";

interface PlanSelectionProps {
  onChoiceChange?: (questionId: number, choiceId: number) => void;
}

export default function PlanSelection(props: PlanSelectionProps) {
  const [questions, setQuestions] = useState<CurriculumQuestion[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<
    Record<number, CurriculumQuestionChoice>
  >({});
  const { accountData } = useAccountContext();

  useEffect(() => {
    const fetchCurricula = async () => {
      try {
        if (accountData?.studentData?.major_id !== undefined) {
          const curriculaData = await getCurriculaByMajorID(
            accountData.studentData.major_id
          );
          if (curriculaData.result !== undefined) {
            const curriculumQuestions =
              Array.isArray(curriculaData.result) &&
              curriculaData.result.length > 0
                ? curriculaData.result[0].curriculum_questions
                : [];
            setQuestions(curriculumQuestions);
            const initialSelectedChoices: Record<
              number,
              CurriculumQuestionChoice
            > = {};
            curriculumQuestions.forEach((question: any) => {
              initialSelectedChoices[question.id] = question.choices[0];
            });
            setSelectedChoices(initialSelectedChoices);
          } else {
            console.error("Curricula is undefined");
          }
        } else {
          console.error("Major ID is undefined");
        }
      } catch (error) {
        console.error("Error fetching curricula", error);
      }
    };

    fetchCurricula();
  }, []);

  const handleChoiceChange = (
    questionId: number,
    choice: CurriculumQuestionChoice
  ) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [questionId]: choice,
    }));

    // Send out questionId and choiceId for use in parent components
    if (props.onChoiceChange) {
      props.onChoiceChange(questionId, choice.id);
    }
  };

  return (
    <>
      <div>
        {/* Dynamic Question Dropdowns */}
        {questions.map((question) => (
          <div
            key={question.id}
            className="flex flex-row items-center justify-center gap-10 mb-4"
          >
            <h2 className="font-semibold">{question.name_en}</h2>
            <Listbox
              value={selectedChoices[question.id]}
              onChange={(choice) => handleChoiceChange(question.id, choice)}
            >
              {({ open }) => (
                <>
                  <ListboxButton className="relative flex items-center h-12 w-[300px] pl-3 pr-12 text-left cursor-pointer rounded-3xl bg-white border-2 border-blue-shadeb5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <div className="flex items-center">
                      <span className="ml-3 font-bold text-blue-shadeb5 truncate">
                        {selectedChoices[question.id]?.name_en ??
                          "Select an option"}
                      </span>
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
                    <ListboxOptions className="absolute z-10 mt-40 max-h-60 w-fit py-1 bg-white shadow-lg rounded-[20px] ring-1 ring-blue-shadeb5 ring-opacity-5 overflow-auto focus:outline-none md:text-md">
                      {question.choices.map((choice) => (
                        <ListboxOption
                          key={choice.id}
                          value={choice}
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
                                  {choice.name_en}
                                </span>
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
        ))}
      </div>
    </>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
