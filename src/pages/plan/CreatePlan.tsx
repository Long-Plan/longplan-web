import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLoadingContext } from "react-router-loading";
import { ClientRouteKey } from "../../common/constants/keys";

function CreatePage() {
  const loadingContext = useLoadingContext();
  const [isSetting, setIsSetting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: "Plan 1",
      course: "CPE63",
      edited: "17/07/24, 17:00",
      isChoosing: true,
    },
    {
      id: 2,
      name: "Plan 2",
      course: "CPE63",
      edited: "17/07/24, 17:00",
      isChoosing: false,
    },
    {
      id: 3,
      name: "Plan 3",
      course: "EE61",
      edited: "17/07/24, 17:00",
      isChoosing: false,
    },
    {
      id: 4,
      name: "Plan 4",
      course: "EE61",
      edited: "17/07/24, 17:00",
      isChoosing: false,
    },
    {
      id: 5,
      name: "Plan 5",
      course: "ME63",
      edited: "17/07/24, 17:00",
      isChoosing: false,
    },
  ]);

  type Plan = {
    id: number;
    name: string;
    course: string;
    edited: string;
    isChoosing: boolean;
  };

  useEffect(() => {
    loadingContext.done();
  }, []);

  const handleToggle = () => {
    //new
    const isAnyPlanChosen = plans.some((plan) => plan.isChoosing);

    // if (isSetting && !isAnyPlanChosen) {
    // 	alert("You must choose a plan before saving.");
    // 	return;
    // }

    if (isSetting && !isAnyPlanChosen) {
      setShowPopup(true); // Show custom popup
      return;
    }

    if (isSetting) {
      const sortedPlans = [...plans].sort((a, b) => {
        const choosingComparison = Number(b.isChoosing) - Number(a.isChoosing);
        if (choosingComparison !== 0) {
          return choosingComparison;
        }
        return a.id - b.id;
      });
      setPlans(sortedPlans);
    }
    setIsSetting(!isSetting);
  };

  const handleChoose = (planId: number) => {
    if (isSetting) {
      setPlans(
        plans.map((plan) =>
          plan.id === planId
            ? { ...plan, isChoosing: true }
            : { ...plan, isChoosing: false }
        )
      );
      // new
    }
  };

  const handleDelete = (planId: number) => {
    setPlans(plans.filter((plan) => plan.id !== planId));
  };

  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center">
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-center">
            <div className="text-lg font-semibold text-[#323334]">
              เลือกแพลน
            </div>
            <div className="mt-4 text-black">
              โปรดเลือกแพลนที่ต้องการแสดงก่อนกดบันทึก
            </div>
            <div
              onClick={() => setShowPopup(false)}
              className="mt-6 px-4 py-2 bg-[#4351cc] text-white rounded-full"
            >
              ย้อนกลับ
            </div>
          </div>
          <div
            className="fixed inset-0 bg-black opacity-0"
            onClick={() => setShowPopup(false)}
          ></div>
        </div>
      )}
      <div className="flex flex-col items-center sm:w-[40rem] md:w-[60rem] lg:w-[70rem] xl:w-[80rem] 2xl:w-[80rem] 3xl:w-[100rem] h-auto sm:h-[20rem] md:h-[30rem] lg:h-[35rem] xl:h-[38rem] 2xl:h-[38rem] 3xl:h-[60rem] bg-white rounded-2xl">
        <div className="text-black md:text-2xl text-base font-medium pt-8 md:pt-16">
          สร้างแพลนใหม่
        </div>
        <Link
          to={ClientRouteKey.Plan}
          className="group w-2/4 max-w-full md:w-1/3 md:h-16 h-10 mt-6 mb-12 bg-white hover:bg-gradient-to-r from-[#ecedf9] to-white border hover:border-2 border-[#e7e9fe] hover:border-[#4351cc] rounded-full flex items-center"
        >
          <div className="w-10 md:w-[3.8rem] h-10 md:h-[3.8rem] bg-[#f3f4ff] group-hover:bg-gradient-to-br from-[#FFFFFF] to-[#4351CC] rounded-full border-2 group-hover:border-2 border-[#6873d6] group-hover:border-white flex justify-center items-center shadow text-center text-[#6873d6] group-hover:text-white text-xl md:text-3xl font-bold">
            +
          </div>
          <div className="text-[#6873d6] text-base md:text-xl font-semibold ml-4">
            ลองแพลน
          </div>
        </Link>
        <div className="w-11/12 md:w-2/3 flex flex-row">
          <div className="flex-grow text-black md:text-xl text-base text-center font-medium pb-7">
            แก้ไขแพลนของคุณ
          </div>
          <div onClick={handleToggle}>
            {isSetting ? (
              <div className="flex bg-[#4351cc] rounded-full justify-center items-center gap-2 px-4 py-0.5">
                <img src="/imgs/Save.svg" alt="" />
                <div className="text-center text-white text-xl font-medium">
                  บันทึก
                </div>
              </div>
            ) : (
              <img src="/imgs/Setting.svg" alt="" />
            )}
          </div>
        </div>
        <div className="w-full h-72 flex flex-col items-center gap-4 overflow-y-scroll">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="w-11/12 md:w-2/3 h-12 md:h-14 border hover:border-2 border-[#d9dcf4] hover:border-[#4351cc] bg-white hover:bg-gradient-to-r from-[#ecedf9] to-white rounded-full flex items-center px-5 flex-shrink-0 overflow-hidden"
            >
              <div className="w-1/2 text-[#4f5051] sm:text-base md:text-lg lg:text-xl xl:text-xl font-bold truncate">
                {plan.name}
              </div>
              <div className="w-1/2 flex justify-between items-center overflow-hidden">
                <div className="text-[#4351cc] sm:text-xs md:text-sm lg:text-base xl:text-base font-bold">
                  {plan.course}
                </div>
                <div className="text-[#8a8b8c] sm:text-xs md:text-sm lg:text-base xl:text-base font-normal truncate">
                  Edited {plan.edited}
                </div>
                {plan.isChoosing ? (
                  <div className="px-2.5 py-0.5 rounded-full border border-[#f7c93b] flex justify-center items-center text-[#f7c93b] text-sm md:text-base font-medium">
                    Choosing
                  </div>
                ) : null}
                {isSetting && (
                  <div className="flex gap-0 lg:gap-0.5 xl:gap-5">
                    {!plan.isChoosing && (
                      <div
                        onClick={() => handleChoose(plan.id)}
                        className="px-2.5 rounded-full border border-[#a78c38] bg-[#f7c93b] flex justify-center items-center text-white text-sm md:text-base font-medium"
                      >
                        Choose
                      </div>
                    )}
                    <img
                      src="/imgs/Delect.svg"
                      alt=""
                      onClick={() => handleDelete(plan.id)}
                      className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
