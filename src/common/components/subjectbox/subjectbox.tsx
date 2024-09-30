import React from "react";
import HoverableBoxComponent, { HoverableBoxProps } from "./hoverbox";

interface SubjectBoxProps {
  data: HoverableBoxProps;
}

const SubjectBox: React.FC<SubjectBoxProps> = ({ data }) => {
  return (
    <div>
      <HoverableBoxComponent {...data} />
    </div>
  );
};

export default SubjectBox;
