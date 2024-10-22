import { ReactFlowProvider } from "@xyflow/react";
import { Toaster } from "react-hot-toast";
import { useQuery } from "react-query";
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";
import useAccountContext from "./common/contexts/AccountContext";
import { validateLocalToken } from "./core/auth";
import { ClientRouteKey } from "./common/constants/keys";
import routes from "./core/routes";
import PageLayout from "./common/components/layouts/PageLayout";
import { useEffect } from "react";
import Term from "./common/components/dialogues/contents/Term";
import FixedLayer from "./common/components/layer/fixlayer";
import DebugPanel from "./debug/DebugPanel";
import Dialogue from "./common/components/dialogues/Dialogue";
import useDialogueContext, {
	DialogueProps,
} from "./common/contexts/DialogueContext";

function App() {
	const navigate = useNavigate();
	const location = useLocation();
	const { setAccountData, accountData } = useAccountContext();
	const { addDialogue } = useDialogueContext();

	useEffect(() => {
		if (accountData) {
			if (!accountData.studentData?.is_term_accepted) {
				const termDialogue: DialogueProps = {
					children: <Term />,
					priority: -999,
				};
				addDialogue(termDialogue);
			}
		}
	}, [accountData, addDialogue]);

	const { status } = useQuery("init", initData, {
		staleTime: Infinity,
		onSuccess: (data) => {
			if (data) {
				setAccountData(data);
			} else {
				if (location.pathname !== ClientRouteKey.OAuth) {
					navigate(ClientRouteKey.Login, { replace: true });
				}
			}
		},
	});

	async function initData() {
		const [data] = await Promise.all([validateLocalToken()]);

		return data;
	}

	return (
		<>
			<Toaster />
			<Dialogue />
			<FixedLayer>
				<DebugPanel isDisplayed={true} routes={routes} />
			</FixedLayer>
			<ReactFlowProvider>
				{status === "loading" ? null : status === "success" ? (
					<Routes>
						{routes.map(({ path, component: Component }) => (
							<Route
								key={path}
								path={path}
								element={
									<PageLayout>
										<Component />
									</PageLayout>
								}
							/>
						))}
					</Routes>
				) : (
					<Navigate to={ClientRouteKey.Login} replace={true} />
				)}
			</ReactFlowProvider>
		</>
	);
}

export default App;
