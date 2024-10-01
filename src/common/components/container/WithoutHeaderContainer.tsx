import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function ContainerWithoutHeader({ children }: Props) {
  return (
    <div className="bg-white rounded-[20px] shadow-md mb-4 w-[1100px]">
      <div className="p-2 md:p-10 w-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default ContainerWithoutHeader;
