import { useEffect, useState } from "react";
import CourseInfo from "./components/CourseInfo";
import GeneralInfo from "./components/GeneralInfo";
import {
	Curriculum,
	Major,
	StudentCurriculum,
	StudentCurriculumCreate,
	StudentCurriculumQuestionAnswer,
} from "../../types";
import useAccountContext from "../../common/contexts/AccountContext";
import { getMajors } from "../../common/apis/major/queries";
import useEnrolledCourseContext from "../../common/contexts/EnrolledCourseContext";
import { PrimaryButton } from "../../common/components/buttons/PrimaryButton";
import {
	Listbox,
	ListboxButton,
	Transition,
	ListboxOptions,
	ListboxOption,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { getCurriculaByMajorID } from "../../common/apis/curricula/queries";
import { getStudentCurriculaByStudent } from "../../common/apis/student_curriculum/queries";
import toast from "react-hot-toast";
import {
	putStudentMajor,
	putStudentCurriculum,
} from "../../common/apis/student/manipulates";
import { postStudentCurricula } from "../../common/apis/student_curriculum/manipulates";

function ProfilePage() {
	const { enrolledCourseData } = useEnrolledCourseContext();
	const [currentSemester, setCurrentSemester] = useState<string>("");
	const [studentCurriculum, setStudentCurriculum] =
		useState<StudentCurriculum | null>(null);
	const [studentCurriculums, setStudentCurriculums] = useState<
		StudentCurriculum[]
	>([]);
	const [selectedStudentCurriculum, setSelectedStudentCurriculum] =
		useState<StudentCurriculum | null>(null);
	const [selectedCurriculum, setSelectedCurriculum] =
		useState<Curriculum | null>(null);
	const [majors, setMajors] = useState<Major[]>([]);
	const [major, setMajor] = useState<Major | null>(null);
	const [curricula, setCurricula] = useState<Curriculum[]>([]);
	const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
	const [isPopupOpenned, setIsPopupOpenned] = useState(false);
	const [curriculumAnswers, setCurriculumAnswers] = useState<
		{ id?: number; question_id: number; choice_id?: number }[]
	>([]);
	const { accountData } = useAccountContext();
	useEffect(() => {
		if (enrolledCourseData.length > 0) {
			const cycleSorted = enrolledCourseData.sort(
				(a, b) =>
					parseInt(b.year) * 10 +
					parseInt(b.semester) -
					(parseInt(a.year) * 10 + parseInt(a.semester))
			);
			setCurrentSemester(
				`ปี ${cycleSorted[0].year} เทอม ${cycleSorted[0].semester}`
			);
		}

		if (accountData?.studentData) {
			getMajors().then((data) => {
				setMajors(data.result ?? []);
				const major =
					data.result?.find(
						(major) => major.id === accountData.studentData?.major_id
					) ?? null;
				setMajor(major);
				setSelectedMajor(major);
			});

			getStudentCurriculaByStudent(accountData.studentData.major_id ?? 0).then(
				async (data) => {
					if (data.result && data.result.length > 0) {
						const curriculum =
							data.result.find(
								(curriculum) =>
									curriculum.id ===
									accountData?.studentData?.student_curriculum_id
							) ?? null;
						setStudentCurriculum(curriculum);
					}
				}
			);
		}
	}, [accountData, enrolledCourseData]);

	useEffect(() => {
		if (selectedMajor) {
			getStudentCurriculaByStudent(selectedMajor.id).then((data) => {
				setStudentCurriculums(data.result ?? []);
				setSelectedStudentCurriculum(
					data.result?.find((f) => f.id === studentCurriculum?.id) ?? null
				);
				if (data.result && data.result.length > 0) {
					setStudentCurriculums(data.result ?? []);
					setSelectedStudentCurriculum(
						data.result?.find((f) => f.id === studentCurriculum?.id) ?? null
					);
				} else {
					getCurriculaByMajorID(selectedMajor.id).then((data) => {
						setCurricula(data.result ?? []);
					});
				}
			});
		}
	}, [selectedMajor, studentCurriculum]);

	const handlerSelectedCurriculum = (curriculum: Curriculum) => {
		setSelectedCurriculum(curriculum);
		setCurriculumAnswers(
			curriculum.curriculum_questions.map((question) => ({
				question_id: question.id,
				choice_id: undefined,
			}))
		);
	};

	const handleConfirm = async () => {
		try {
			if (!selectedMajor || !accountData?.studentData) return;
			await putStudentMajor(selectedMajor.id);
			if (studentCurriculums.length > 0) {
				await putStudentCurriculum(selectedStudentCurriculum?.id ?? 0);
			} else {
				if (!selectedCurriculum) return;
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
			}
		} catch {
			toast.error("เกิดข้อผิดพลาดในการยืนยันข้อกำหนดและเงื่อนไขการให้บริการ");
		}
		setIsPopupOpenned(false);
		window.location.reload();
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

	return (
		<>
			{isPopupOpenned && (
				<div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-50">
					<div className="flex justify-center items-center w-full h-full">
						<div className="bg-white rounded-xl w-full max-w-2xl shadow-lg relative">
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
													{selectedMajor
														? selectedMajor.name_en
														: "Select a Major"}
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
								{selectedMajor &&
									(studentCurriculums.length > 0 ? (
										<div>
											<label className="block text-sm font-medium">
												หลักสูตร
											</label>
											<Listbox
												value={selectedStudentCurriculum}
												onChange={setSelectedStudentCurriculum}
											>
												<div className="relative mt-1">
													<ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
														<span className="block truncate">
															{selectedStudentCurriculum
																? selectedStudentCurriculum.name
																: "Select a Student Curriculum"}
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
															{studentCurriculums.map((studentCurriculum) => (
																<ListboxOption
																	key={studentCurriculum.id}
																	className={({ active }) =>
																		clsx(
																			active
																				? "text-white bg-blue-shadeb5"
																				: "text-gray-900",
																			"relative cursor-default select-none py-2 pl-10 pr-4"
																		)
																	}
																	value={studentCurriculum}
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
																				{studentCurriculum.name}
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
									) : (
										<>
											{selectedMajor && curricula.length > 0 && (
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
											{selectedCurriculum &&
												selectedCurriculum.curriculum_questions.length > 0 &&
												selectedCurriculum.curriculum_questions.map(
													(question) => (
														<div key={question.id}>
															<label className="block text-sm font-medium">
																{question.name_en}
															</label>
															<Listbox
																value={
																	curriculumAnswers.find(
																		(answer) =>
																			answer.question_id === question.id
																	)?.choice_id
																}
																onChange={(choiceID) =>
																	handlerSelectedCurriculumAnswer(
																		question.id,
																		choiceID
																	)
																}
															>
																<div className="relative mt-1">
																	<ListboxButton className="bg-white relative w-full cursor-default rounded-[20px] border border-blue-shadeb5 py-2 pl-3 pr-10 text-left text-blue-shadeb5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
																		<span className="block truncate">
																			{curriculumAnswers.find(
																				(answer) =>
																					answer.question_id === question.id
																			)?.choice_id
																				? question.choices.find(
																						(choice) =>
																							choice.id ===
																							curriculumAnswers.find(
																								(answer) =>
																									answer.question_id ===
																									question.id
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
													)
												)}
										</>
									))}
							</div>

							<div className="flex justify-center my-4">
								<PrimaryButton
									className="mt-[20px]"
									onClick={handleConfirm}
									disabled={
										studentCurriculums.length > 0
											? !selectedStudentCurriculum
											: !selectedCurriculum ||
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
			<div className="w-screen flex justify-center items-center p-6">
				<div className="w-fit bg-white rounded-2xl mb-4 pb-4">
					<div className="w-full overflow-y-auto">
						<GeneralInfo currentSemester={currentSemester} />
						<div className="flex justify-between items-center mt-4 px-10">
							<div className="flex justify-center gap-4 flex-1">
								<p className="text-center text-lg">กำลังศึกษา ภาควิชา</p>
								<p className="text-center text-lg font-medium text-blue-shadeb5">
									{major?.name_en}
								</p>
								<p className="text-center text-lg">หลักสูตร</p>
								<p className="text-center text-lg font-medium text-blue-shadeb5">
									{studentCurriculum?.name}
								</p>
							</div>
							<div className="w-fit flex items-center">
								<button
									className="border border-[#D9DCF5] rounded-full text-sm px-4"
									onClick={() => setIsPopupOpenned((p) => !p)}
								>
									แก้ไข
								</button>
							</div>
						</div>

						<div className="py-8">
							<p className="text-center text-xl">ข้อมูลการลงทะเบียนเรียน</p>
							<CourseInfo
								enrolledCourses={enrolledCourseData}
								studentCurriculum={studentCurriculum}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default ProfilePage;
