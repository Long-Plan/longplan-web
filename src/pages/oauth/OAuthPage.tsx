import { useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientRouteKey, LocalStorageKey } from "../../common/constants/keys";
import { getUserDataQuery, signInQuery } from "../../common/apis/auth/queries";
import { coreApi } from "../../core/connections";
import useAccountContext from "../../common/contexts/AccountContext";
import { getDataOrNull } from "../../common/apis/selectors";
import { getEnrolledCourses } from "../../common/apis/enrolled_course/queries";
import useEnrolledCourseContext from "../../common/contexts/EnrolledCourseContext";

function OAuthPage() {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const code = searchParams.get("code");
	const navigate = useNavigate();
	const { setAccountData, accountData } = useAccountContext();
	const { setEnrolledCoruseData } = useEnrolledCourseContext();

	useEffect(() => {
		if (accountData) {
			navigate(ClientRouteKey.Home, { replace: true });
			return;
		}

		async function callbackHandler() {
			if (!code) {
				toast.error("Error: No code found in the URL.");
				navigate(ClientRouteKey.Login, { replace: true });
			} else {
				const res = await signInQuery(code);
				localStorage.setItem(LocalStorageKey.Auth, res.result ?? "");
				coreApi.defaults.headers.common["Authorization"] = `Bearer ${
					res.result ?? ""
				}`;
				const accountData = await getDataOrNull(getUserDataQuery);
				setAccountData(accountData);
				getEnrolledCourses().then((data) => {
					setEnrolledCoruseData(data.result ?? []);
				});
				navigate(ClientRouteKey.Home, { replace: true });
			}
		}

		callbackHandler();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accountData, code]);
	return <div>Loading.. .</div>;
}

export default OAuthPage;
