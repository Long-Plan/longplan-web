import {
	Listbox,
	ListboxButton,
	ListboxOption,
	ListboxOptions,
	Transition,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import {
	Curriculum,
	Major,
	StudentCurriculumCreate,
	StudentCurriculumQuestionAnswer,
} from "../../../../types";
import { getMajors } from "../../../apis/major/queries";
import clsx from "clsx";
import { getCurriculaByMajorID } from "../../../apis/curricula/queries";
import { PrimaryButton } from "../../buttons/PrimaryButton";
import useDialogueContext from "../../../contexts/DialogueContext";
import toast from "react-hot-toast";
import {
	putStudentCurriculum,
	putStudentMajor,
} from "../../../apis/student/manipulates";
import { postStudentCurricula } from "../../../apis/student_curriculum/manipulates";
import useAccountContext from "../../../contexts/AccountContext";
function CurriculumSetting() {
	const [majors, setMajors] = useState<Major[]>([]);
	const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
	const [selectedCurriculum, setSelectedCurriculum] =
		useState<Curriculum | null>(null);
	const [curricula, setCurricula] = useState<Curriculum[]>([]);
	const [curriculumAnswers, setCurriculumAnswers] = useState<
		{ question_id: number; choice_id?: number }[]
	>([]);
	const { removeDialogue } = useDialogueContext();
	const { accountData } = useAccountContext();
	useEffect(() => {
		getMajors().then((res) => {
			setMajors(res.result ?? []);
		});
	}, []);

	useEffect(() => {
		if (selectedMajor) {
			getCurriculaByMajorID(selectedMajor.id).then((res) => {
				setCurricula(res.result ?? []);
			});
		}
	}, [selectedMajor]);

	const handlerSelectedCurriculum = (curriculum: Curriculum) => {
		setSelectedCurriculum(curriculum);
		if (!curriculum.curriculum_questions) setCurriculumAnswers([]);
		else
			setCurriculumAnswers(
				curriculum.curriculum_questions.map((question) => ({
					question_id: question.id,
					choice_id: undefined,
				}))
			);
	};

	const handlerSelectedCurriculumAnswer = (
		questionID: number,
		choiceID: number
	) => {
		setCurriculumAnswers((answers) =>
			answers.map((answer) =>
				answer.question_id === questionID
					? { ...answer, choice_id: choiceID }
					: answer
			)
		);
	};

	const handleConfirm = async () => {
		if (!selectedMajor || !selectedCurriculum || !accountData?.studentData)
			return;
		try {
			await putStudentMajor(selectedMajor.id);
			const answers: StudentCurriculumQuestionAnswer[] = [];
			curriculumAnswers.forEach((curriculumAnswer) => {
				if (!curriculumAnswer.choice_id) return;
				answers.push({
					question_id: curriculumAnswer.question_id,
					choice_id: curriculumAnswer.choice_id,
				});
			});
			const payload: StudentCurriculumCreate = {
				name: selectedCurriculum.short_name,
				student_code: accountData?.studentData?.code,
				curriculum_id: selectedCurriculum.id,
				is_system: false,
				answers: answers,
			};
			const studentCurriculum = await postStudentCurricula(payload);
			await putStudentCurriculum(studentCurriculum.result ?? 0);
			window.location.reload();
		} catch {
			toast.error("เกิดข้อผิดพลาดในการยืนยันข้อกำหนดและเงื่อนไขการให้บริการ");
		}
		removeDialogue();
	};

	return (
		<div className="flex justify-center items-center max-w-fit">
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
						<Listbox
							value={selectedMajor}
							onChange={(selectedMajor) => {
								setSelectedMajor(selectedMajor);
								setSelectedCurriculum(null);
							}}
						>
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
													clsx(
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
															className={clsx(
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
					{selectedMajor && curricula.length > 0 && (
						<div>
							<label className="block text-sm font-medium">หลักสูตร</label>
							<Listbox
								value={selectedCurriculum}
								onChange={handlerSelectedCurriculum}
							>
								<div className="relative mt-1">
									<ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
										<span className="block truncate">
											{selectedCurriculum
												? selectedCurriculum.name_en
												: "Select a Curriculum"}
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
											{curricula.map((curriculum) => (
												<ListboxOption
													key={curriculum.id}
													className={({ active }) =>
														clsx(
															active
																? "text-white bg-blue-shadeb5"
																: "text-gray-900",
															"relative cursor-default select-none py-2 pl-10 pr-4"
														)
													}
													value={curriculum}
												>
													{({ selected }) => (
														<>
															<span
																className={clsx(
																	selected ? "font-medium" : "font-normal",
																	"block truncate"
																)}
															>
																{curriculum.name_en}
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
					)}
					{selectedCurriculum?.curriculum_questions &&
						selectedCurriculum.curriculum_questions.length > 0 &&
						selectedCurriculum.curriculum_questions.map((question) => (
							<div key={question.id}>
								<label className="block text-sm font-medium">
									{question.name_en}
								</label>
								<Listbox
									value={
										curriculumAnswers.find(
											(answer) => answer.question_id === question.id
										)?.choice_id
									}
									onChange={(choiceID) =>
										handlerSelectedCurriculumAnswer(question.id, choiceID)
									}
								>
									<div className="relative mt-1">
										<ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
											<span className="block truncate">
												{curriculumAnswers.find(
													(answer) => answer.question_id === question.id
												)?.choice_id
													? question.choices.find(
															(choice) =>
																choice.id ===
																curriculumAnswers.find(
																	(answer) => answer.question_id === question.id
																)?.choice_id
													  )?.name_en
													: "Select a Choice"}
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
															clsx(
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
																	className={clsx(
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
				<div className="flex justify-center my-4">
					<PrimaryButton
						className="mt-[20px]"
						onClick={handleConfirm}
						disabled={
							!selectedCurriculum ||
							curriculumAnswers.some((answer) => !answer.choice_id) ||
							!selectedMajor
						}
					>
						ยืนยัน
					</PrimaryButton>
				</div>
			</div>
		</div>
	);
}

export default CurriculumSetting;
