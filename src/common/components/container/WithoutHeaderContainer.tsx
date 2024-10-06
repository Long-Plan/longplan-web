import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function ContainerWithoutHeader({ children }: Props) {
  return (
    <div className="bg-white rounded-[20px] mb-4 max-w-screen-xl">
      <div className="p-2 md:p-10 w-full overflow-y-auto">{children}</div>
    </div>
  );
}

export default ContainerWithoutHeader;
