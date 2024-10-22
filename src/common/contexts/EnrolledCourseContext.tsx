import { create } from "zustand";
import { EnrolledCourseCycle } from "../../types";

type EnrolledCourseStore = {
	enrolledCourseData: EnrolledCourseCycle[];
	setEnrolledCoruseData: (data: EnrolledCourseCycle[]) => void;
};

const useEnrolledCourseContext = create<EnrolledCourseStore>()((set) => ({
	enrolledCourseData: [],
	setEnrolledCoruseData: (data: EnrolledCourseCycle[]) =>
		set(() => ({ enrolledCourseData: data })),
}));

export default useEnrolledCourseContext;
