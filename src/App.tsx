import { ReactFlowProvider } from "@xyflow/react";
import { Toaster } from "react-hot-toast";
import { useQuery } from "react-query";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import useAccountContext from "./common/contexts/AccountContext";
import { validateLocalToken } from "./core/auth";
import { ClientRouteKey } from "./common/constants/keys";
import { routes } from "./core/routes";
import PageLayout from "./common/components/layout/PageLayout";

function App() {
  const navigate = useNavigate();
  const { setAccountData } = useAccountContext();
  const { status } = useQuery("init", initData, {
    staleTime: Infinity,
    onSuccess: (data) => {
      if (data) {
        setAccountData(data);
        if (window.location.pathname !== ClientRouteKey.Home) {
          navigate(ClientRouteKey.Home, { replace: true });
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
