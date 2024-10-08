import { PageContainer } from "../../common/components/container/PageContainer";
import PlanSettingPopup from "../../common/components/dialogues/contents/settingpopup";

function SettingsPage() {
  return (
    <PageContainer>
      <PlanSettingPopup mode={false} />
    </PageContainer>
  );
}

export default SettingsPage;
