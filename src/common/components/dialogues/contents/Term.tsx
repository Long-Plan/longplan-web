import { useState } from "react";
import styled from "styled-components";
import useAnnouncementContext from "../../../contexts/AnnouncementContext";
import { putStudent } from "../../../apis/student/queries";
import toast from "react-hot-toast";

function Term() {
  const [checked, setChecked] = useState(false);
  const { setComponent, setIsVisible } = useAnnouncementContext();

  const handleCheckboxChange = () => {
    setChecked(!checked);
  };

  const handleConfirm = async () => {
    if (checked) {
      try {
        await putStudent({
          is_term_accepted: true,
        });
        setComponent(null);
        setIsVisible(false);

        // Refresh the page after successful submission
        window.location.reload();
      } catch {
        toast.error("เกิดข้อผิดพลาดในการยืนยันข้อกำหนดและเงื่อนไขการให้บริการ");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray bg-opacity-10">
      <div className="bg-white p-8 rounded-[20px] shadow-2xl w-[850px] h-max">
        <h2 className="text-2xl font-bold mb-6 text-center pt-2">
          ข้อกำหนดและเงื่อนไขการให้บริการ (Terms of Service)
        </h2>
        <p className="text-md font-light mb-2 text-center">
          โปรดอ่านข้อกำหนดและเงื่อนไขการให้บริการเหล่านี้อย่างละเอียดก่อนใช้งาน
        </p>
        <ol className="list-decimal list-inside text-sm mb-4">
          <li className="font-semibold">การยอมรับข้อกำหนด</li>
          <p className="py-4 font-light">
            โดยการเข้าถึงและใช้บริการ LongPlan
            คุณจำเป็นต้องยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดเหล่านี้
            หากคุณไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณาอย่าใช้บริการของเรา
          </p>
          <li className="font-semibold">ขอบเขตของบริการ</li>
          <p className="py-4 font-light">
            LongPlan เป็น Web Application
            ที่ช่วยนักศึกษาในการวางแผนวิชาเรียนและตรวจสอบหน่วยกิต
            รวมถึงการช่วยในการลงทะเบียนเรียนตลอดหลักสูตรจนถึงจบการศึกษา
          </p>
          <li className="font-semibold">การใช้งานข้อมูลส่วนบุคคล</li>
          <p className="py-2 font-light">
            ข้อมูลที่เราเก็บรวบรวมจากผู้ใช้ประกอบด้วย:
          </p>
          <p className="ml-4">
            <p className="font-light ">
              3.1. ข้อมูลประวัติการศึกษาจาก CMU Oauth (เช่น ชื่อ นามสกุล
              คณะที่ศึกษา รหัสนักศึกษา)
            </p>
            <p className="font-light">
              3.2. ข้อมูลจากรายวิชาที่ลงทะเบียนและผลการเรียน{" "}
            </p>
          </p>
          <p className="py-4 font-light">
            ข้อมูลดังกล่าวใช้เพียงเพื่อให้บริการ LongPlan
            และได้รับการอนุญาตจากหน่วยงานที่เกี่ยวข้อง
          </p>
          <li className="font-semibold">ความรับผิดชอบของผู้ใช้</li>
          <p className="py-4 font-light">
            เรารักษาความปลอดภัยของข้อมูลส่วนบุคคลของผู้ใช้และจะไม่แบ่งปันข้อมูลกับบุคคลที่สามโดยไม่ได้รับอนุญาต
          </p>
          <li className="font-semibold">ความเป็นส่วนตัว</li>
          <p className="py-4 font-light">
            เราขอสงวนสิทธิ์ในการปรับปรุงและแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา
            โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
          </p>
          <p className="text-red-500 my-4 font-semibold text-sm">
            ทั้งนี้
            โปรดตรวจสอบความถูกต้องของข้อมูลรายวิชาและข้อมูลการลงทะเบียนเรียนอีกครั้ง
            กับทางสำนักทะเบียนหรืออาจารย์ที่ปรึกษา
          </p>
          <p className="flex justify-end font-light text-xs text-gray-400">
            อัพเดทล่าสุด: 30/7/2567
          </p>
        </ol>
        <div className="flex items-center my-8 justify-center font-semibold">
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              checked={checked}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="accept" className="text-base">
              ข้าพเจ้ายอมรับข้อกำหนดและเงื่อนไขการให้บริการ
            </label>
          </CheckboxWrapper>
        </div>
        <ConfirmButton
          className={"bg-blue-shadeb5 hover:bg-blue-shadeb6"}
          onClick={handleConfirm}
          disabled={!checked}
        >
          ยืนยัน
        </ConfirmButton>
      </div>
    </div>
  );
}

export default Term;

const CheckboxWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ConfirmButton = styled.button`
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;

  &:disabled {
    background-color: grey;
    cursor: not-allowed;
  }
`;
