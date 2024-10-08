import { ReactNode, FC } from "react";

interface Props {
  children?: ReactNode;
}

const ContainerWithoutHeader: FC<Props> = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl mb-4 max-w-screen-xl">
      <div className="p-6 md:p-10 w-full overflow-y-auto">{children}</div>
    </div>
  );
};

export default ContainerWithoutHeader;
