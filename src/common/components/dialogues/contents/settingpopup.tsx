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
import { putStudentMajorUpdate } from "../../../apis/student/queries";
import { ClientRouteKey } from "../../../constants/keys";
import useAnnouncementContext from "../../../contexts/AnnouncementContext";
import { getMajors } from "../../../apis/major/queries";
import { Major } from "../../../../types/major";
import { getCurriculaByMajorID } from "../../../apis/curricula/queries";
import { Curriculum } from "../../../../types/curricula";
import {
	StudentCurriculum,
	StudentCurriculumQuestionAnswer,
} from "../../../../types/student_curricula";
import { postStudentCurriculum } from "../../../apis/student_curriculum/queries";
import useAccountContext from "../../../contexts/AccountContext";

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
	const [programs, setPrograms] = useState<Curriculum[]>([]);
	const [selectedMajor, setSelectedMajor] = useState<Major | undefined>(
		undefined
	);
	const [selectedProgram, setSelectedProgram] = useState<
		Curriculum | undefined
	>(undefined);
	const [answers, setAnswers] = useState<StudentCurriculumQuestionAnswer[]>([]);
	const { setComponent, setIsVisible } = useAnnouncementContext();
	const { accountData } = useAccountContext();

	const navigate = useNavigate(); // Get navigate function from useNavigate hook

	// Fetch majors and their IDs
	useEffect(() => {
		const fetchMajors = async () => {
			try {
				const data = await getMajors();
				if (data.success && data.result) {
					setMajors(data.result ?? []);
					setSelectedMajor(data.result[0]);
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
					const data = await getCurriculaByMajorID(selectedMajor.id);
					if (data.success) {
						setPrograms(data.result ?? []);
					}
				} catch (error) {
					console.error("Error fetching curriculum:", error);
				}
			};
			fetchCurriculum();
		}
	}, [selectedMajor]);

	const onSelectedProgramChange = (program: Curriculum) => {
		setSelectedProgram(program);
		setAnswers(
			program.curriculum_questions.map((question) => ({
				question_id: question.id,
				choice_id: 0,
			}))
		);
	};

	const handleSubmit = async () => {
		if (!selectedMajor || !selectedProgram) {
			console.error("Major or program is not selected properly.");
			return;
		}

		try {
			await putStudentMajorUpdate({ major_id: selectedMajor.id });
			const payload: StudentCurriculum = {
				name: selectedProgram.short_name,
				student_code: accountData?.studentData?.code ?? 0,
				curriculum_id: selectedProgram.id,
				is_system: true,
				is_default: true,
				answers: answers,
			};
			await postStudentCurriculum(payload);
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
						<Listbox value={selectedProgram} onChange={onSelectedProgramChange}>
							<div className="relative mt-1">
								<ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
									<span className="block truncate">
										{selectedProgram
											? selectedProgram.name_th
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
					{selectedProgram?.curriculum_questions.map((question) => (
						<div key={question.id}>
							<label className="block text-sm font-medium">
								{question.name_en}
							</label>
							<Listbox
								value={
									answers.find((a) => a.question_id === question.id)?.choice_id
								}
								onChange={(value) => {
									setAnswers((prev) => {
										const index = prev.findIndex(
											(a) => a.question_id === question.id
										);
										if (index === -1) {
											return prev;
										}

										const newAnswers = [...prev];
										newAnswers[index] = {
											...newAnswers[index],
											choice_id: value,
										};
										console.log(newAnswers);

										return newAnswers;
									});
								}}
							>
								<div className="relative mt-1">
									<ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
										<span className="block truncate">
											{question.choices.find(
												(c) =>
													c.id ===
													answers.find((a) => a.question_id === question.id)
														?.choice_id
											)?.name_en ?? "Select an Answer"}
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
													value={choice.id}
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
