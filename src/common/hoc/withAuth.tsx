import React from "react";

import { AuthKey } from "../constants/keys";
import Unauth from "../components/middleware/unauth";
import { useLoadingContext } from "react-router-loading";
import useAccountContext from "../contexts/AccountContext";
import Navbar from "../components/Navbar/Navbar";

function withAuth(authType: AuthKey) {
  return <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    return function WithAuthComponent(props: P) {
      const loadingContext = useLoadingContext();
      const { accountData } = useAccountContext();

      // for dev
      // if (authType === AuthKey.UserAuth) {
      //   return (
      //     <>
      //       <Navbar />
      //       <WrappedComponent {...props} />
      //     </>
      //   );
      // }

      // for prod
      if (authType === AuthKey.UserAuth && accountData) {
        return (
          <>
            <Navbar />
            <WrappedComponent {...props} />
          </>
        );
      }
      loadingContext.done();
      return <Unauth />;
    };
  };
}

export default withAuth;
