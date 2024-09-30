import { ClientRouteKey } from "../../constants/keys";
import { useNavigate } from "react-router-dom";

function Unauth() {
  const navigate = useNavigate();
  function handleBack() {
    navigate(ClientRouteKey.Login, { replace: true });
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-2">
      <h1 className="font-semibold text-2xl">Unauthorized</h1>
      <p className="text-sm text-gray-500">
        You are not authorized to access this page.
      </p>
      <button
        onClick={() => handleBack()}
        className="inline-block max-w-max bg-white rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
      >
        Back to Login
      </button>
    </div>
  );
}

export default Unauth;
