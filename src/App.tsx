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
import Announcement from "./common/components/dialogues/Announcement";
import useAnnouncementContext from "./common/contexts/AnnouncementContext";
import { useEffect } from "react";
import Term from "./common/components/dialogues/contents/Term";
import FixedLayer from "./common/components/layer/fixlayer";
import DebugPanel from "./debug/DebugPanel";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAccountData, accountData } = useAccountContext();
  const { isVisible, setIsVisible, setComponent } = useAnnouncementContext();

  useEffect(() => {
    if (accountData) {
      if (!accountData.studentData?.is_term_accepted) {
        setIsVisible(true);
        setComponent(<Term />);
      }
    }
  }, [accountData, isVisible, setComponent, setIsVisible]);

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
      {isVisible && <Announcement />}
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
