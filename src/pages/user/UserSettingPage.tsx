import { PageContainer } from "../../common/components/container/PageContainer";
import PlanSettingPopup from "../../common/components/dialogues/contents/settingpopup";
import { useState } from "react";

function SettingsPage() {
  const [isPopupOpen, setPopupOpen] = useState(true);

  const handleClose = () => {
    setPopupOpen(false);
  };

  return (
    <PageContainer>
      {isPopupOpen && <PlanSettingPopup onClose={handleClose} mode={false} />}
      {/* <div className="flex justify-center items-center h-full">
        <button
          className="bg-white w-max h-max justify-center items-center rounded-[20px] border border-solid border-gray-300"
          onClick={() => setPopupOpen(true)}
        >
          setting
        </button>
      </div> */}
    </PageContainer>
  );
}

export default SettingsPage;
