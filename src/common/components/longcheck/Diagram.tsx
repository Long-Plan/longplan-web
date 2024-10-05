import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import InfoModal from "./InfoModal";
import { useEffect, useState } from "react";
// import getCategoryDetail, { CurriculaDTO } from "./CategoryDetail";

function Diagram() {
  const [showInfo, setShowInfo] = useState(false);
  //   const [curriculaData, setCurriculaData] = useState<CurriculaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const data = await getCategoryDetail();
        // setCurriculaData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  //   console.log(curriculaData);

  return (
    <div className="bg-white rounded-[20px] w-full pb-12 cursor-default">
      <div className="flex justify-end pb-2 m-2 top-0 right-0 h-[30px]">
        <div className={`flex flex-cols justify-center items-center`}>
          <div className="flex border-[2px] border-solid border-blue-shadeb5 w-[30px] h-[10px] rounded-[20px] bg-blue-shadeb1 mr-2" />
          <p className={`text-sm text-gray mr-4`}>เรียนแล้ว</p>
        </div>
        <div className={`flex flex-cols justify-center items-center`}>
          <div className="flex border-[2px] border-solid border-blue-shadeb5 w-[30px] h-[10px] rounded-[20px] bg-white mr-2" />
          <p className={`text-sm text-gray mr-4`}>ยังไม่ได้เรียน</p>
        </div>
        <div className={`flex flex-cols justify-center items-center`}>
          <div className="flex border-[2px] border-solid border-gray-300 w-[30px] h-[10px] rounded-[20px] bg-gray-0 mr-2" />
          <p className={`text-sm text-gray mr-8`}>F/W</p>
        </div>
        <div className={`flex flex-cols justify-center items-center`}>
          <QuestionMarkCircleIcon
            className={`flex w-[25px] h-[25px] cursor-pointer justify-center items-center text-blue-shadeb5 transition-all duration-300 hover:scale-125`}
            onClick={() => setShowInfo(true)}
          >
            ?
          </QuestionMarkCircleIcon>
          {showInfo && (
            <InfoModal
              title="ข้อมูลชนิดกล่องวิชาในแต่ละหมวดหมู่"
              imageUrl="/imgs/Subjectbox_Details.svg"
              imageAlt="Subject Box Details"
              onClose={() => setShowInfo(false)}
            />
          )}
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-hidden hover:overflow-x-scroll overscroll-x-contain border-x border-gray-100 rounded-t-2xl rounded-br-2xl w-full">
        <div className="flex w-full overflow-x-auto">{}</div>
      </div>
    </div>
  );
}

export default Diagram;
