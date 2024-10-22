import {
	Listbox,
	ListboxButton,
	Transition,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Curriculum, StudentCurriculum } from "../../../types";
import { Cog8ToothIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { getCurriculumByID } from "../../../common/apis/curricula/queries";
import { PrimaryButton } from "../../../common/components/buttons/PrimaryButton";
import { putStudentCurriculaQuestion } from "../../../common/apis/student_curriculum/manipulates";
import toast from "react-hot-toast";

interface Props {
	studentCurricula: StudentCurriculum[];
	selectedStudentCurriculum: StudentCurriculum | null;
	setSelectedStudentCurriculum: (curriculum: StudentCurriculum) => void;
}

function StudentCurriculumDropdown({
	studentCurricula,
	selectedStudentCurriculum,
	setSelectedStudentCurriculum,
}: Props) {
	const [selectedCurriculum, setSelectedCurriculum] =
		useState<Curriculum | null>(null);
	const [curriculumAnswers, setCurriculumAnswers] = useState<
		{ id?: number; question_id: number; choice_id?: number }[]
	>([]);
	const [isPopupOpenned, setIsPopupOpenned] = useState(false);
	useEffect(() => {
		if (selectedStudentCurriculum) {
			getCurriculumByID(selectedStudentCurriculum.curriculum_id).then((res) => {
				setSelectedCurriculum(res.result ?? null);
				if (res.result) {
					setCurriculumAnswers(
						res.result?.curriculum_questions.map((question) => ({
							id: selectedStudentCurriculum.answers.find(
								(answer) => answer.question_id === question.id
							)?.id,
							question_id: question.id,
							choice_id: selectedStudentCurriculum.answers.find(
								(answer) => answer.question_id === question.id
							)?.choice_id,
						})) ?? []
					);
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStudentCurriculum]);

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
		if (!selectedStudentCurriculum) return;
		try {
			await putStudentCurriculaQuestion({
				student_curriculum_id: selectedStudentCurriculum.id,
				payload: curriculumAnswers.map((answer) => ({
					id: answer.id,
					question_id: answer.question_id,
					choice_id: answer.choice_id ?? 0,
				})),
			});

			toast.success("บันทึกข้อมูลสำเร็จ");
			window.location.reload();
		} catch {
			toast.error("บันทึกข้อมูลไม่สำเร็จ");
		}
		setIsPopupOpenned(false);
	};

	const handleSetting = () => {
		setIsPopupOpenned(true);
	};

	return (
		<>
			{isPopupOpenned && (
				<div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-50">
					<div className="flex justify-center items-center w-full h-full">
						<div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative">
							<p className="text-center text-md font-medium my-8">
								เลือกรูปแบบหลักสูตรที่คุณต้องการ
							</p>
							<div className="space-y-4 px-12 text-left">
								{selectedCurriculum &&
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
																				(answer) =>
																					answer.question_id === question.id
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
																					selected
																						? "font-medium"
																						: "font-normal",
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
										curriculumAnswers.some((answer) => !answer.choice_id)
									}
								>
									ยืนยัน
								</PrimaryButton>
							</div>
						</div>
					</div>
				</div>
			)}
			<div className="w-full flex justify-center items-center gap-4">
				<h2 className="font-semibold">แผนการเรียนหลักสูตร</h2>
				<Listbox
					value={selectedStudentCurriculum}
					onChange={setSelectedStudentCurriculum}
				>
					{({ open }) => (
						<>
							<ListboxButton className="relative flex items-center h-10 w-[300px] pl-3 pr-12 text-left cursor-pointer rounded-3xl bg-white border-2 border-blue-shadeb5 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
								<div className="flex items-center">
									<span className="ml-3 font-bold text-blue-shadeb5 truncate">
										{selectedStudentCurriculum?.name ?? "Select an option"}
									</span>
								</div>
								<span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
									<ChevronUpDownIcon
										className="w-5 h-5 text-blue-shadeb3"
										aria-hidden="true"
									/>
								</span>
								<Transition
									show={open}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<ListboxOptions className="absolute left-0 top-10 z-10 h-fit w-full bg-white shadow-lg rounded-[20px] ring-1 ring-blue-shadeb5 ring-opacity-5 overflow-auto focus:outline-none md:text-md">
										{studentCurricula.map((studentCurriculum) => (
											<ListboxOption
												key={studentCurriculum.id}
												value={studentCurriculum}
												className={({ active }) =>
													clsx(
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
																className={clsx(
																	selected
																		? "font-bold text-blue-shadeb5"
																		: "font-normal",
																	"ml-3 block truncate"
																)}
															>
																{studentCurriculum.name}
															</span>
														</div>
														{selected && (
															<span
																className={clsx(
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
							</ListboxButton>
						</>
					)}
				</Listbox>
				<Cog8ToothIcon
					className="w-10 border-2 border-[#4351CC] rounded-full p-1 text-[#4351CC] cursor-pointer"
					onClick={handleSetting}
				/>
			</div>
		</>
	);
}

export default StudentCurriculumDropdown;
