import { useState, useEffect } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { putStudent } from "../../../apis/student/queries";
import { ClientRouteKey } from "../../../constants/keys";
import useAnnouncementContext from "../../../contexts/AnnouncementContext";
import { getMajors } from "../../../apis/major/queries";
import { Major } from "../../../../types/major";
import { getCurriculaByMajorID } from "../../../apis/curricula/queries";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function PlanSettingPopup({
  mode,
  isFirstTime,
}: {
  mode: boolean;
  isFirstTime?: boolean;
}) {
  const [majors, setMajors] = useState<Major[]>([]);
  const [programs, setPrograms] = useState<
    { id: number; name_th: string; major_id: number }[]
  >([]);
  const [choices, setChoices] = useState<
    {
      id: number;
      name_en: string;
      choices: { id: number; name_en: string }[];
    }[]
  >([]);
  const [selectedMajor, setSelectedMajor] = useState<{
    id: number;
    name_en: string;
  } | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    id: number;
    name_th: string;
  } | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<{
    [key: number]: string;
  }>({});
  const { setComponent, setIsVisible } = useAnnouncementContext();

  const navigate = useNavigate(); // Get navigate function from useNavigate hook

  // Fetch majors and their IDs
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await getMajors();
        if (response) {
          setMajors(
            response.map((major: Major) => ({
              id: major.id,
              name_en: major.name_en,
              name_th: major.name_th,
              created_at: major.created_at,
              updated_at: major.updated_at,
            }))
          );
          setSelectedMajor(response[0]); // Set the default selection to the first major
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };

    fetchMajors();
  }, []);

  // Fetch curriculum based on selected major's ID
  useEffect(() => {
    if (selectedMajor) {
      const fetchCurriculum = async () => {
        try {
          const response = await getCurriculaByMajorID(selectedMajor.id);
          const data = response;
          if (data.success) {
            const fetchedPrograms = Array.isArray(data.result)
              ? data.result.map((program: any) => ({
                  id: program.id, // Program ID
                  name_th: program.name_th,
                  major_id: program.major_id,
                }))
              : [];
            const curriculumQuestions =
              Array.isArray(data.result) && data.result.length > 0
                ? data.result[0].curriculum_questions.map((question: any) => ({
                    id: question.id,
                    name_en: question.name_en,
                    choices: question.choices.map((choice: any) => ({
                      id: choice.id,
                      name_en: choice.name_en,
                    })),
                  }))
                : [];
            setPrograms(fetchedPrograms);
            setChoices(curriculumQuestions);

            // Initialize selected choices with first choice for each question
            const initialSelectedChoices: { [key: number]: string } = {};
            curriculumQuestions.forEach((question: any) => {
              initialSelectedChoices[question.id] = question.choices[0].name_en;
            });
            setSelectedChoices(initialSelectedChoices);
            setSelectedQuestion(fetchedPrograms[0]); // Set the first program as default
          }
        } catch (error) {
          console.error("Error fetching curriculum:", error);
          setPrograms([]);
          setChoices([]);
          setSelectedQuestion(null);
          setSelectedChoices({});
        }
      };

      fetchCurriculum();
    }
  }, [selectedMajor]);

  const handleSubmit = async () => {
    if (!selectedMajor || !selectedQuestion) {
      console.error("Major or program is not selected properly.");
      return;
    }

    try {
      await putStudent({
        major_id: selectedMajor.id,
        is_term_accepted: true,
      });
      setComponent(null);
      setIsVisible(false);

      toast.success("อัพเดทข้อมูลภาควิชาสำเร็จ");
      window.location.reload();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัพเดทข้อมูลภาควิชา");
    }

    // Construct the formData with selected IDs
    // const formData = {
    //   majorId: selectedMajor.id, // ID of the selected major
    //   programId: selectedProgram.id, // ID of the selected program
    //   choices: choices.map((question) => ({
    //     questionId: question.id, // Question ID
    //     choiceId: question.choices.find(
    //       (choice) => choice.name_en === selectedChoices[question.id]
    //     )?.id, // Find the choice ID based on selected choice
    //   })),
    // };
    // console.log("Form submitted with data:", formData);
    if (isFirstTime) {
      navigate(ClientRouteKey.Home);
    }

    if (mode) {
      setComponent(null);
      setIsVisible(false);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative">
        {/* Welcome SVG Image */}
        <div className="">
          <img
            src="/imgs/welcome.svg"
            alt="Welcome"
            className="w-full h-full"
          />
        </div>

        <p className="text-center text-md font-medium my-8">
          เลือกภาควิชาที่คุณกำลังศึกษา
        </p>

        <div className="space-y-4 px-12">
          {/* Major (Department) Dropdown */}
          <div>
            <label className="block text-sm font-medium">ภาควิชา</label>
            <Listbox value={selectedMajor} onChange={setSelectedMajor}>
              <div className="relative mt-1">
                <ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <span className="block truncate">
                    {selectedMajor ? selectedMajor.name_en : "Select a Major"}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-blue-shadeb5"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>
                <Transition
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[20px] bg-white py-1 text-base shadow-lg ring-1 ring-blue-shadeb5 ring-opacity-5 focus:outline-none">
                    {majors.map((major) => (
                      <ListboxOption
                        key={major.id}
                        className={({ active }) =>
                          classNames(
                            active
                              ? "text-white bg-blue-shadeb5"
                              : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-10 pr-4"
                          )
                        }
                        value={major}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? "font-medium" : "font-normal",
                                "block truncate"
                              )}
                            >
                              {major.name_en}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <CheckIcon
                                  className="h-5 w-5 text-blue-shadeb5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Program Dropdown */}
          <div>
            <label className="block text-sm font-medium">หลักสูตร</label>
            <Listbox value={selectedQuestion} onChange={setSelectedQuestion}>
              <div className="relative mt-1">
                <ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <span className="block truncate">
                    {selectedQuestion
                      ? selectedQuestion.name_th
                      : "Select a Program"}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-blue-shadeb5"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>
                <Transition
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[20px] bg-white py-1 text-base shadow-lg ring-1 ring-blue-shadeb5 ring-opacity-5 focus:outline-none">
                    {programs.map((program) => (
                      <ListboxOption
                        key={program.id}
                        className={({ active }) =>
                          classNames(
                            active
                              ? "text-white bg-blue-shadeb5"
                              : "text-gray-900",
                            "relative cursor-default select-none py-2 pl-10 pr-4"
                          )
                        }
                        value={program}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? "font-medium" : "font-normal",
                                "block truncate"
                              )}
                            >
                              {program.name_th}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <CheckIcon
                                  className="h-5 w-5 text-blue-shadeb5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Dynamic Choice Dropdowns */}
          {choices.map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-medium">
                {question.name_en}
              </label>
              <Listbox
                value={selectedChoices[question.id]}
                onChange={(choice: string) =>
                  setSelectedChoices((prevChoices) => ({
                    ...prevChoices,
                    [question.id]: choice,
                  }))
                }
              >
                <div className="relative mt-1">
                  <ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <span className="block truncate">
                      {selectedChoices[question.id]}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-blue-shadeb5"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <Transition
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[20px] bg-white py-1 text-base shadow-lg ring-1 ring-blue-shadeb5 ring-opacity-5 focus:outline-none">
                      {question.choices.map((choice) => (
                        <ListboxOption
                          key={choice.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "text-white bg-blue-shadeb5"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-10 pr-4"
                            )
                          }
                          value={choice.name_en}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? "font-medium" : "font-normal",
                                  "block truncate"
                                )}
                              >
                                {choice.name_en}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                  <CheckIcon
                                    className="h-5 w-5 text-blue-shadeb5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </div>
              </Listbox>
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <div className="my-6 text-center">
          <button
            className="bg-blue-shadeb5 hover:bg-blue-shadeb5 text-white py-2 px-6 rounded-lg text-lg"
            onClick={handleSubmit}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
