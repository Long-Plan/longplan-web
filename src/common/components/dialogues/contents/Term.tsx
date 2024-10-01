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
    <Container>
      <Title>ข้อกำหนดและเงื่อนไขการให้บริการ (Terms of Service)</Title>
      <Paragraph>
        โปรดอ่านข้อกำหนดและเงื่อนไขการให้บริการเหล่านี้อย่างละเอียดก่อนใช้งาน
      </Paragraph>
      <Paragraph>
        <strong>1. การยอมรับข้อกำหนด</strong>
        <br />
        โดยการเข้าใช้งาน LongPlan
        คุณจำเป็นต้องยอมรับและตกลงที่จะปฏิบัติตามข้อกำหนดเหล่านี้
        หากคุณไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณาอย่าใช้บริการของเรา
      </Paragraph>
      <Paragraph>
        <strong>2. ขอบเขตของบริการ</strong>
        <br />
        LongPlan เป็น Web Application
        ที่ช่วยในการวางแผนวิชาเรียนและตรวจสอบหน่วยกิต
        รวมถึงการช่วยในการลงทะเบียนเรียนตลอดหลักสูตรจนจบการศึกษา
      </Paragraph>
      <Paragraph>
        <strong>3. การใช้ข้อมูลส่วนบุคคล</strong>
        <br />
        ข้อมูลที่เราเก็บรวบรวมจากผู้ใช้ประกอบด้วย:
        <ul>
          <li>ข้อมูลประวัติการศึกษา เช่น ชื่อ นามสกุล คณะ รหัสนักศึกษา</li>
          <li>ข้อมูลการลงทะเบียนเรียนและผลการเรียน</li>
        </ul>
        ข้อมูลดังกล่าวจะใช้เพื่อการให้บริการ LongPlan
        และใช้ในการอนุญาตจากหน่วยงานที่เกี่ยวข้อง
      </Paragraph>
      <Paragraph>
        <strong>4. ความเป็นส่วนตัว</strong>
        <br />
        เรารักษาความปลอดภัยของข้อมูลส่วนบุคคลของผู้ใช้และจะไม่แบ่งปันข้อมูลส่วนบุคคลกับบุคคลที่สามโดยไม่ได้รับอนุญาต
      </Paragraph>
      <Paragraph>
        <strong>5. การปรับปรุงและการแก้ไข</strong>
        <br />
        เราสงวนสิทธิ์ในการปรับปรุงและแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา
        โดยไม่ต้องแจ้งให้ทราบล่วงหน้า
      </Paragraph>
      <Paragraph>
        <HighlightText>
          ทั้งนี้
          โปรดตรวจสอบความถูกต้องของข้อมูลรายวิชาและข้อมูลการลงทะเบียนอีกครั้ง
          กับภาคสำนักทะเบียนหรืออาจารย์ที่ปรึกษา
        </HighlightText>
      </Paragraph>
      <Paragraph>อัพเดทล่าสุด: 30/7/2567</Paragraph>
      <CheckboxWrapper>
        <Checkbox
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
        />
        <label>ข้าพเจ้ายอมรับข้อกำหนดและเงื่อนไขการให้บริการ</label>
      </CheckboxWrapper>
      <ConfirmButton onClick={handleConfirm} disabled={!checked}>
        ยืนยัน
      </ConfirmButton>
    </Container>
  );
}

export default Term;

const Container = styled.div`
  text-align: left;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.5em;
`;

const Paragraph = styled.p`
  font-size: 1em;
  line-height: 1.5em;
`;

const HighlightText = styled.span`
  color: red;
  font-weight: bold;
`;

const CheckboxWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ConfirmButton = styled.button`
  background-color: #1a73e8;
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
