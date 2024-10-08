import { PageContainer } from "../../common/components/container/PageContainer";
import FitContainer from "../../common/components/container/FitContainer";
import GeneralInfo from "../../common/components/profile/GeneralInfo";
import CourseInfo from "../../common/components/profile/CoureseInfo";
// import SummaryBox from "../../common/components/summaryBox/SummaryBox";
// import { SmContainer } from "../../common/components/container/SmallContainer";

function UserPage() {
  return (
    <PageContainer>
      <FitContainer>
        <GeneralInfo />
        <div className="py-10">
          <p className="text-center text-xl">ข้อมูลการลงทะเบียนเรียน</p>
          <CourseInfo />
        </div>
      </FitContainer>
    </PageContainer>
  );
}

export default UserPage;
