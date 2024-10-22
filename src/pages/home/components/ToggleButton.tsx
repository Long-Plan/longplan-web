import { useState } from "react";

interface ToggleButtonProps {
  onClick: () => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ onClick }) => {
  const [isChecked, setIsChecked] = useState(true);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <>
      <label className="relative inline-flex cursor-pointer select-none items-center">
        <input
          type="checkbox"
          name="autoSaver"
          className="sr-only"
          checked={isChecked}
          onChange={handleCheckboxChange}
          onClick={onClick}
        />
        <span
          className={`slider mr-3 flex h-[24px] w-[46px] items-center rounded-full p-1 duration-200 ${
            isChecked ? "bg-gray-200" : "bg-blue-shadeb3"
          }`}
        >
          <span
            className={`dot size-[16px] rounded-full bg-white duration-200 ${
              isChecked ? "translate-x-6" : ""
            }`}
          ></span>
        </span>
        <span className="label flex items-center text-xs font-medium text-black">
          Summer
        </span>
      </label>
    </>
  );
};

export default ToggleButton;
