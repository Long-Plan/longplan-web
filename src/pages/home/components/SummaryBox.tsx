import { CheckBadgeIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { CategoryTypeDisplay } from "../scripts/summary";

function SummaryBox({
	categoryTypeDisplay,
}: {
	categoryTypeDisplay: CategoryTypeDisplay;
}) {
	return (
		<div key={categoryTypeDisplay.category.id}>
			<div
				style={{
					backgroundColor: categoryTypeDisplay.category.secondary_color,
					borderColor: categoryTypeDisplay.category.primary_color,
				}}
				className={`w-auto h-12 p-1 rounded-2xl border border-solid flex items-center gap-8 ${
					categoryTypeDisplay.childCategories.length > 0
						? "border-b-0 rounded-bl-none rounded-br-none"
						: ""
				}`}
			>
				<div className="flex flex-row justify-center items-center ml-4">
					<span
						style={{ color: categoryTypeDisplay.category.primary_color }}
						className={`text-sm flex flex-row items-center`}
					>
						{categoryTypeDisplay.earnCredit >=
							categoryTypeDisplay.totalCredit && (
							<CheckBadgeIcon
								style={{
									borderColor: categoryTypeDisplay.category.primary_color,
								}}
								className={`w-8 h-8`}
							/>
						)}

						<div className="grid grid-rows-auto flex-grow">
							{categoryTypeDisplay.category.name_th}
							<span
								style={{ color: categoryTypeDisplay.category.primary_color }}
								className={` text-xs font-medium text-center`}
							>{`(${categoryTypeDisplay.category.name_en})`}</span>
						</div>
					</span>
				</div>
				<div
					style={{ borderColor: categoryTypeDisplay.category.primary_color }}
					className={`ml-auto px-2 mr-2 bg-white rounded-[10px] border border-solid justify-center items-center  inline-flex`}
				>
					<div
						style={{ color: categoryTypeDisplay.category.primary_color }}
						className={`text-center text-sm font-bold `}
					>
						{`${categoryTypeDisplay.earnCredit} / ${categoryTypeDisplay.totalCredit}`}
					</div>
				</div>
			</div>

			{categoryTypeDisplay.childCategories.length > 0 && (
				<div
					style={{ borderColor: categoryTypeDisplay.category.primary_color }}
					className={`rounded-bl-2xl rounded-br-2xl bg-white px-4 py-1 border-t-0 border border-solid mb-4 `}
				>
					<ul className="list-none">
						{categoryTypeDisplay.childCategories.map((group) => (
							<li
								key={group.category.name_en}
								className={`my-3 text-[14px] flex items-center space-x-2`}
							>
								{/* CheckCircleIcon or bullet */}
								{group.earnCredit >= group.totalCredit ? (
									<CheckCircleIcon
										className={`w-6 h-6`}
										style={{ color: group.category.primary_color }}
										aria-label="Completed"
									/>
								) : (
									<span
										style={{ color: group.category.primary_color }}
										className={`w-6 h-6 text-center font-bold`}
									>
										•
									</span>
								)}

								{/* Group Name and Credits */}
								<span
									style={{ color: group.category.primary_color }}
									className={` flex-grow flex w-full font-semibold`}
								>
									{`${group.category.name_en}`}
								</span>
								<span
									style={{ color: group.category.primary_color }}
									className={` text-right w-[100px] font-semibold`}
								>
									{`${group.earnCredit} / ${group.totalCredit}`}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

export default SummaryBox;
