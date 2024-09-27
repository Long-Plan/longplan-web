import { useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientRouteKey, LocalStorageKey } from "../../common/constants/keys";
import { signInQuery } from "../../common/apis/auth/queries";
import { coreApi } from "../../core/connections";

function OAuthPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code");
  const navigate = useNavigate();

  useEffect(() => {
    async function callbackHandler() {
      console.log("OAuthPage -> code", code);

      if (!code) {
        toast.error("Error: No code found in the URL.");
        navigate(ClientRouteKey.Login);
      } else {
        const token = await signInQuery(code);
        localStorage.setItem(LocalStorageKey.Auth, token);
        coreApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        navigate(ClientRouteKey.Home);
      }
    }

    callbackHandler();
  }, [code, navigate]);
  return <div>Loading.. .</div>;
}

export default OAuthPage;
