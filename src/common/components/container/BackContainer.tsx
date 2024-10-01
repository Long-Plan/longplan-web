import { To, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { BackwardIcon } from "@heroicons/react/20/solid";

interface Props {
  title: string;
  children?: ReactNode;
  back?: To;
}

function ContainerWithBack({ title, children, back }: Props) {
  const navigate = useNavigate();
  return (
    <>
      <div className="rounded-xl mb-4 m-4">
        <div className="drop-shadow-md bg-gray-50 px-6 py-4 rounded-t-xl flex items-center gap-6">
          <BackwardIcon
            color="#AE0218"
            className="cursor-pointer size-6"
            onClick={() => (back ? navigate(back) : navigate(-1))}
          />
          <span className="text-lg">{title}</span>
        </div>
        <div className="p-4 md:p-8 w-full overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

export default ContainerWithBack;
