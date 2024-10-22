import { useEffect, useState } from "react";
import { Category } from "../../../types";
import SummaryBox from "./SummaryBox";
import { ProgressBar } from "./ProgressBar";
import {
	CategoryTypeDisplay,
	getCategoryTypeDisplay,
} from "../scripts/summary";
import { getCategoryDetailOfCourse } from "../../../common/components/utils/categoryProcess";
import { CourseDetailOfCategoryDisplay } from "../HomePage";

interface Props {
	categoryCurriculum: Category;
	courseDetailDisplays: CourseDetailOfCategoryDisplay[];
}

function SummaryCredit({ courseDetailDisplays, categoryCurriculum }: Props) {
	const [categoryTypeDisplays, setCategoryTypeDisplays] = useState<
		CategoryTypeDisplay[]
	>([]);

	const [summaryCredit, setSummaryCredit] = useState({
		totalCredits: 0,
		earnedCredits: 0,
	});

	useEffect(() => {
		const categoryTypeDisplays = getCategoryTypeDisplay(categoryCurriculum);

		let totalCredits = 0;
		let earnedCredits = 0;
		categoryTypeDisplays.forEach((categoryTypeDisplay) => {
			totalCredits += categoryTypeDisplay.totalCredit;
		});
		courseDetailDisplays.forEach((courseDetailDisplay) => {
			earnedCredits += courseDetailDisplay.credit || 0;
			const categoryDetail = getCategoryDetailOfCourse(
				courseDetailDisplay.course_no,
				categoryCurriculum
			);
			if (categoryDetail) {
				courseDetailDisplay.categoryDisplayID =
					categoryDetail.categoryDisplayID;
				courseDetailDisplay.categoryTypeID = categoryDetail.categoryTypeID;

				const categoryTypeDisplay = categoryTypeDisplays.find(
					(categoryTypeDisplay) => {
						return (
							categoryTypeDisplay.category.type_id ===
							courseDetailDisplay.categoryTypeID
						);
					}
				);
				if (categoryTypeDisplay) {
					categoryTypeDisplay.earnCredit += courseDetailDisplay.credit || 0;
				}

				if (categoryTypeDisplay?.childCategories) {
					const categoryDisplay = categoryTypeDisplay.childCategories.find(
						(categoryDisplay) => {
							return (
								categoryDisplay.category.id ===
								courseDetailDisplay.categoryDisplayID
							);
						}
					);
					if (categoryDisplay) {
						categoryDisplay.earnCredit += courseDetailDisplay.credit || 0;
					}
				}
			}
		});
		setCategoryTypeDisplays(categoryTypeDisplays);
		setSummaryCredit({ totalCredits, earnedCredits });
	}, [categoryCurriculum]);

	return (
		<div className="p-4">
			<h3 className="text-center my-4">หน่วยกิตสะสม</h3>
			{categoryTypeDisplays.map((categoryTypeDisplay) => {
				return <SummaryBox categoryTypeDisplay={categoryTypeDisplay} />;
			})}
			{summaryCredit.totalCredits > 0 && (
				<div className="mt-5">
					<h3 className="text-center">หน่วยกิตรวม</h3>
					<p className="text-center text-collection-1-black-shade-bl2 m-2 text-sm">
						{`คุณเรียนไปแล้ว ${summaryCredit.earnedCredits} จาก ${summaryCredit.totalCredits} หน่วยกิต`}
					</p>
					<ProgressBar
						earnedCredits={summaryCredit.earnedCredits}
						maxCredits={summaryCredit.totalCredits}
					/>
				</div>
			)}
		</div>
	);
}

export default SummaryCredit;
