import { ReactNode, FC } from "react";

interface FitContainerProps {
  children?: ReactNode;
}

const FitContainer: FC<FitContainerProps> = ({ children }) => {
  return (
    <div className="w-fit bg-white rounded-2xl mb-4 pb-4">
      <div className="w-full overflow-y-auto">{children}</div>
    </div>
  );
};

export default FitContainer;
