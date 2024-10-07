import { useEffect, useState } from "react";
import useAccountContext from "../../contexts/AccountContext";
import { getAllByMajorID } from "../../apis/curricula/queries";

const GeneralInfo = () => {
  const { accountData } = useAccountContext();
  const [major, setMajor] = useState<string>("");

  useEffect(() => {
    const fetchMajor = async () => {
      if (accountData?.studentData?.major_id) {
        try {
          const response = await getAllByMajorID(
            accountData.studentData.major_id
          );
          console.log(response.result);
          if (!Array.isArray(response.result) || response.result.length === 0) {
            return;
          }
          setMajor(response.result[0]?.name_th);
        } catch (error) {
          console.error("Failed to fetch major:", error);
        }
      }
    };

    fetchMajor();
  }, [accountData]);

  return (
    <div className="flex bg-[#ECEEFA] rounded-t-[20px] shadow-[20px] items-center justify-center bg-cover bg-bottom bg-[url('/imgs/ClockBG.svg')] w-[1300px] h-full p-8">
      <div className="flex flex-row items-center">
        <div className="drop-shadow-[10px] rounded-[20px] backdrop-blur-md w-full items-center jusify-center bg-white/10 px-16">
          <div className="flex flex-row items-center justify-center">
            <img
              src="/imgs/ProfilePics.png"
              width="150px"
              className="my-5 mx-2 rounded-full"
              alt="Profile"
            />
            <div className="items-center justify-center">
              <p className="text-lg font-medium mb-4 text-white">
                {accountData?.userData?.firstname}{" "}
                {accountData?.userData?.lastname}
              </p>
              <h1 className="text-lg font-medium mb-4 text-white">
                {accountData?.studentData?.code}
              </h1>
              <h4 className="px-4 text-sm font-normal bg-blue-shadeb5 rounded-lg text-white w-min-full h-[20px] text-center">
                {major || "Loading..."}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfo;
