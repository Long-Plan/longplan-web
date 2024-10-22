import { FC, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

const ContainerWithoutHeader: FC<Props> = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl max-w-screen-xl mx-auto">
      <div className="p-4 md:p-8 w-full overflow-y-auto">{children}</div>
    </div>
  );
};

export default ContainerWithoutHeader;
