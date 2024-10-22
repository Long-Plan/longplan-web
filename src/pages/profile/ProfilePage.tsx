import { useEffect, useState } from "react";
import CourseInfo from "./components/CourseInfo";
import GeneralInfo from "./components/GeneralInfo";
import { StudentCurriculum } from "../../types";
import { getEnrolledCourses } from "../../common/apis/enrolled_course/queries";
import useAccountContext from "../../common/contexts/AccountContext";
import { getMajors } from "../../common/apis/major/queries";
import { getStudentCurriculaByStudent } from "../../common/apis/student_curriculum/queries";
import useEnrolledCourseContext from "../../common/contexts/EnrolledCourseContext";

function ProfilePage() {
	const { enrolledCourseData } = useEnrolledCourseContext();
	const [currentSemester, setCurrentSemester] = useState<string>("");
	const [studentCurriculum, setStudentCurriculum] =
		useState<StudentCurriculum | null>(null);
	const [major, setMajor] = useState<string>("");
	const { accountData } = useAccountContext();
	useEffect(() => {
		getEnrolledCourses().then((data) => {
			if (data.result && data.result.length > 0) {
				const cycleSorted = data.result.sort(
					(a, b) =>
						parseInt(b.year) * 10 +
						parseInt(b.semester) -
						(parseInt(a.year) * 10 + parseInt(a.semester))
				);
				setCurrentSemester(
					`ปี ${cycleSorted[0].year} เทอม ${cycleSorted[0].semester}`
				);
			}
		});
		if (accountData?.studentData?.major_id) {
			getMajors().then((data) => {
				setMajor(
					data.result?.find(
						(major) => major.id === accountData.studentData?.major_id
					)?.name_th ?? ""
				);
			});
		}
		if (accountData?.studentData?.student_curriculum_id) {
			getStudentCurriculaByStudent().then(async (data) => {
				if (data.result && data.result.length > 0) {
					const curriculum =
						data.result.find(
							(curriculum) =>
								curriculum.id ===
								accountData?.studentData?.student_curriculum_id
						) ?? null;
					setStudentCurriculum(curriculum);
				}
			});
		}
	}, []);
	return (
		<div className="w-screen flex justify-center items-center p-6">
			<div className="w-fit bg-white rounded-2xl mb-4 pb-4">
				<div className="w-full overflow-y-auto">
					<GeneralInfo currentSemester={currentSemester} />
					<div className="flex justify-center gap-4">
						<p className="text-center text-lg mt-4">กำลังศึกษา ภาควิชา</p>
						<p className="text-center text-lg font-medium mt-4 text-blue-shadeb5">
							{major}
						</p>
						<p className="text-center text-lg mt-4">หลักสูตร</p>
						<p className="text-center text-lg font-medium mt-4 text-blue-shadeb5">
							{studentCurriculum?.name}
						</p>
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
	);
}

export default ProfilePage;
