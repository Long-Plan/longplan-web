import { ClientRouteKey, AuthKey } from "../common/constants/keys";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/login/LoginPage";
import OAuthPage from "../pages/oauth/OAuthPage";
import withAuth from "../common/hoc/withAuth";
import ProfilePage from "../pages/profile/ProfilePage";

type Route = {
	path: string;
	component: React.ComponentType;
};
const routes: Route[] = [
	{
		path: ClientRouteKey.Home,
		component: withAuth(AuthKey.UserAuth)(HomePage),
	},
	{
		path: ClientRouteKey.Login,
		component: LoginPage,
	},
	{
		path: ClientRouteKey.OAuth,
		component: OAuthPage,
	},
	{
		path: ClientRouteKey.Profile,
		component: withAuth(AuthKey.UserAuth)(ProfilePage),
	},
];

export default routes;
