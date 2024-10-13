import { useEffect } from "react";
import { PageContainer } from "../../common/components/container/PageContainer";

import Diagram from "../../common/components/longcheck/Diagram";
import PlanSettingPopup from "../../common/components/dialogues/contents/settingpopup";
import useAccountContext from "../../common/contexts/AccountContext";
import useAnnouncementContext from "../../common/contexts/AnnouncementContext";

function HomePage() {
	const { accountData } = useAccountContext();
	const { setIsVisible, setComponent } = useAnnouncementContext();
	useEffect(() => {
		if (!accountData?.studentData?.major_id) {
			setIsVisible(true);
			setComponent(<PlanSettingPopup mode={true} />);
		}
	}, []);
	return (
		<PageContainer>
			<Diagram />
		</PageContainer>
	);
}

export default HomePage;
