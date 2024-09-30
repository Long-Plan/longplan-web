import { CoCreElecBox } from "../../common/components/subjectbox/stylebox";
import SubjectBox from "../../common/components/subjectbox/subjectbox";

function HomePage() {
  return (
    <div className="w-screen h-screen items-center justify-center text-center p-16">
      <SubjectBox
        data={{
          BoxComponent: CoCreElecBox,
          courseFullName: "Sample Course",
          courseCategory: "Sample Category",
          courseRecommendedYear: "1",
          coursePrerequisites: ["261200"],
          course_no: "261200",
          course_title: "Introduction to Sample Course",
          course_credit: 3,
          course_group: "A",
        }}
      />
    </div>
  );
}

export default HomePage;
