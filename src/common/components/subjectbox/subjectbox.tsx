import React from "react";
import HoverableBoxComponent, { HoverableBoxProps } from "./hoverbox";

const SubjectBox: React.FC<HoverableBoxProps> = (props) => {
  return (
    <>
      <HoverableBoxComponent {...props} />
    </>
  );
};

export default SubjectBox;
