import { useEffect, useState } from "react";
import {
	Curriculum,
	StudentCurriculum,
	StudentCurriculumCreate,
	StudentCurriculumQuestionAnswer,
} from "../../types";
import { getStudentCurriculaByStudent } from "../../common/apis/student_curriculum/queries";
import useAccountContext from "../../common/contexts/AccountContext";
import {
	CheckIcon,
	ChevronUpDownIcon,
	TrashIcon,
} from "@heroicons/react/20/solid";
import { getCurriculaByMajorID } from "../../common/apis/curricula/queries";
import {
	deleteStudentCurriculum,
	postStudentCurricula,
} from "../../common/apis/student_curriculum/manipulates";
import toast from "react-hot-toast";
import { putStudentCurriculum } from "../../common/apis/student/manipulates";
import { PrimaryButton } from "../../common/components/buttons/PrimaryButton";
import {
	Listbox,
	ListboxButton,
	Transition,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/react";
import clsx from "clsx";

function CreatePage() {
	const { accountData } = useAccountContext();
	const [studentCurricula, setStudentCurricula] = useState<StudentCurriculum[]>(
		[]
	);
	const [curricula, setCurricula] = useState<Curriculum[]>([]);
	const [curriculumAnswers, setCurriculumAnswers] = useState<
		{ question_id: number; choice_id?: number }[]
	>([]);
	const [selectedCurriculum, setSelectedCurriculum] =
		useState<Curriculum | null>(null);
	const [isPopupOpenned, setIsPopupOpenned] = useState(false);
	const [inputName, setInputName] = useState("");

	useEffect(() => {
		if (accountData?.studentData) {
			getStudentCurriculaByStudent(accountData.studentData.major_id ?? 0).then(
				(studentCurriculaData) => {
					const studentCurricula = studentCurriculaData.result ?? [];
					setStudentCurricula(studentCurricula);
				}
			);
			getCurriculaByMajorID(accountData.studentData.major_id ?? 0).then(
				(data) => {
					setCurricula(data.result ?? []);
				}
			);
		}
	}, []);

	const handleDelete = async (id: number) => {
		if (confirm("Are you sure you want to delete this curriculum?")) {
			await deleteStudentCurriculum(id);
			toast.success("ลบแพลนเรียบร้อยแล้ว");
			window.location.reload();
		}
	};

	const handleSetDefault = async (id: number) => {
		if (confirm("Are you sure you want to set this curriculum as default?")) {
			await putStudentCurriculum(id);
			toast.success("Set as default แล้ว");
			window.location.reload();
		}
	};

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
		if (!selectedCurriculum || !accountData?.studentData) return;
		try {
			const answers: StudentCurriculumQuestionAnswer[] = [];
			curriculumAnswers.forEach((curriculumAnswer) => {
				if (!curriculumAnswer.choice_id) return;
				answers.push({
					question_id: curriculumAnswer.question_id,
					choice_id: curriculumAnswer.choice_id,
				});
			});
			const payload: StudentCurriculumCreate = {
				name: inputName.length > 0 ? inputName : selectedCurriculum.name_en,
				student_code: accountData?.studentData?.code,
				curriculum_id: selectedCurriculum.id,
				is_system: false,
				answers: answers,
			};
			await postStudentCurricula(payload);
			window.location.reload();
		} catch {
			toast.error("เกิดข้อผิดพลาดในการยืนยันข้อกำหนดและเงื่อนไขการให้บริการ");
		}
	};

	return (
		<>
			{isPopupOpenned && (
				<div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-50">
					<div
						className="fixed inset-0"
						onClick={() => setIsPopupOpenned(false)}
					></div>
					<div className="flex justify-center items-center w-full h-full">
						<div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative p-8">
							<p className="text-center text-xl font-medium mb-8">
								เลือกแผนการเรียนที่ต้องการ
							</p>
							<div className="space-y-4 px-12">
								<div>
									<label className="block text-sm font-medium">ขื่อแพลน</label>
									<input
										value={inputName}
										onChange={(v) => setInputName(v.target.value)}
										className="w-full border border-blue-shadeb5 rounded-[20px] py-2 px-3 mt-1 text-blue-shadeb5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
									/>
								</div>
								{accountData?.studentData?.major_id && curricula.length > 0 && (
									<div>
										<label className="block text-sm font-medium">
											หลักสูตร
										</label>
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
																				selected
																					? "font-medium"
																					: "font-normal",
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
								<div className="flex justify-center my-4">
									<PrimaryButton
										className="mt-[20px]"
										onClick={handleConfirm}
										disabled={
											!selectedCurriculum ||
											curriculumAnswers.some((answer) => !answer.choice_id) ||
											inputName.length === 0
										}
									>
										ยืนยัน
									</PrimaryButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="w-screen h-screen flex justify-center items-center p-20 pl-24">
				<div className="w-full h-full border bg-white rounded-3xl p-12 flex flex-col items-center">
					<div className="text-black md:text-2xl text-base font-medium">
						สร้างแพลนใหม่
					</div>
					<div
						onClick={() => setIsPopupOpenned(true)}
						className="cursor-pointer group w-1/3 h-20 mt-6 mb-12 bg-white hover:bg-gradient-to-r from-[#ecedf9] to-white border hover:border-2 border-[#e7e9fe] hover:border-[#4351cc] rounded-full flex items-center"
					>
						<div className="w-20 h-[4.8rem] bg-[#f3f4ff] group-hover:bg-gradient-to-br from-[#FFFFFF] to-[#4351CC] rounded-full border-2 group-hover:border-2 border-[#6873d6] group-hover:border-white flex justify-center items-center shadow text-center text-[#6873d6] group-hover:text-white text-xl md:text-3xl font-bold">
							+
						</div>
						<div className="text-[#6873d6] text-base md:text-xl font-semibold ml-4">
							ลองแพลน
						</div>
					</div>
					<div className="flex-grow text-black md:text-xl text-base text-center font-medium pb-7">
						แก้ไขแพลนของคุณ
					</div>
					<div className="w-full h-full flex flex-col items-center gap-4 overflow-y-scroll">
						{studentCurricula.map((studentCurriculum) => (
							<div
								key={studentCurriculum.id}
								className="w-2/3 h-16 border hover:border-2 border-[#d9dcf4] hover:border-[#4351cc] bg-white hover:bg-gradient-to-r from-[#ecedf9] to-white rounded-full flex items-center px-8 flex-shrink-0 overflow-hidden"
							>
								<div className="w-2/3 text-[#4f5051] sm:text-base md:text-lg lg:text-xl xl:text-xl font-bold truncate">
									{studentCurriculum.name}
								</div>
								<div className="w-1/3 flex justify-between items-center overflow-hidden">
									<div className="text-[#4351cc] sm:text-xs md:text-sm lg:text-base xl:text-base font-bold">
										{
											curricula.find(
												(f) => f.id === studentCurriculum.curriculum_id
											)?.short_name
										}
									</div>
									<div className="flex gap-4 items-center">
										{accountData?.studentData?.student_curriculum_id ===
											studentCurriculum.id && (
											<div className="border rounded-full text-base text-gray-300 px-2">
												Default
											</div>
										)}
										{accountData?.studentData?.student_curriculum_id !==
											studentCurriculum.id && (
											<div
												onClick={() => handleSetDefault(studentCurriculum.id)}
												className="cursor-pointer border rounded-full bg-[#F7CA3C] border-[#A78C39] hover:border-[#F7CA3C] hover:text-[#F7CA3C] hover:bg-white text-base text-white px-2"
											>
												Set as default
											</div>
										)}
										{accountData?.studentData?.student_curriculum_id !==
											studentCurriculum.id && (
											<button
												onClick={() => handleDelete(studentCurriculum.id)}
												className="rounded-full p-2 text-red-700 hover:text-white hover:bg-red-700"
											>
												<TrashIcon className="w-5 h-5" />
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}

export default CreatePage;
