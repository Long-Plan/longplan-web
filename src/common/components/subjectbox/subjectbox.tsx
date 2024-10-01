import React from "react";
import HoverableBoxComponent, { HoverableBoxProps } from "./hoverbox";

const SubjectBox: React.FC<HoverableBoxProps> = (props) => {
  return (
    <div>
      <HoverableBoxComponent {...props} />
    </div>
  );
};

export default SubjectBox;
