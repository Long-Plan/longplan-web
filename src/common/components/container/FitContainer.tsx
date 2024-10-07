import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function FitContainer({ children }: Props) {
  return (
    <div className="bg-white rounded-[20px] mb-4 pb-4">
      <div className="w-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default FitContainer;
