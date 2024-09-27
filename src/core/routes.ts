import { ClientRouteKey } from "../common/constants/keys";
import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/login/LoginPage";
import OAuthPage from "../pages/oauth/OAuthPage";

type Route = {
  path: string;
  component: React.ComponentType;
};
export const routes: Route[] = [
  {
    path: ClientRouteKey.Home,
    component: HomePage,
  },
  {
    path: ClientRouteKey.Login,
    component: LoginPage,
  },
  {
    path: ClientRouteKey.OAuth,
    component: OAuthPage,
  },
];
