import { CoCreBox } from "../../common/components/subjectbox/stylebox";
import SubjectBox from "../../common/components/subjectbox/subjectbox";

function HomePage() {
  return (
    <div className="w-screen h-screen flex items-center justify-center text-center p-16">
      <SubjectBox
        BoxComponent={CoCreBox}
        course_detail={{
          course_no: "261200",
          title_long_th: "การเขียนโปรแกรมคอมพิวเตอร์",
          title_long_en: "Computer Programming",
          course_desc_th: "หลักการพื้นฐานของการเขียนโปรแกรมคอมพิวเตอร์",
          course_desc_en: "Fundamental principles of computer programming",
          credit: 3,
          category: "Core",
          recommendedYear: "1",
          recommendedSemester: "1",
          prerequisites: "None",
        }}
        is_enrolled={true}
      />
    </div>
  );
}

export default HomePage;
