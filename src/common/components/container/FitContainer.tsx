import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function FitContainer({ children }: Props) {
  return (
    <div className="bg-white rounded-[20px] shadow-md mb-4 w-fit pb-4">
      <div className="w-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default FitContainer;
