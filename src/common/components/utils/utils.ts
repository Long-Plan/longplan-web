export const yearMap: { [key: string]: string } = {
	1: "First year",
	2: "Second year",
	3: "Third year",
	4: "Fourth year",
	5: "Fifth year",
	6: "Sixth year",
	7: "Seventh year",
	8: "Eighth year",
};

export const semesterMap: { [key: string]: string } = {
	1: "1st Semester",
	2: "2nd Semester",
	3: "Summer",
};

const getYearAndSemester = (year: number, semester: number): string => {
	const yearString = yearMap[year] || "Unknown year";
	const semesterString = semesterMap[semester] || "Unknown semester";

	return `${yearString}, ${semesterString}`;
};

export default getYearAndSemester;
