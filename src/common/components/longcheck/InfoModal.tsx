import React from "react";

interface InfoModalProps {
  title: string;
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({
  title,
  imageUrl,
  imageAlt,
  onClose,
}) => {
  // This function handles clicks on the overlay and closes the modal if the user clicks outside the modal content
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50"
      onClick={handleOverlayClick}
    >
      <div className="flex flex-col bg-white p-6 rounded-[20px] shadow-lg w-[800px] text-center">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="flex flex-col m-4 justify-center items-center">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-[500px] pb-4 transition duration-300 hover:scale-100"
          />
        </div>
        <button
          className="bg-blue-shadeb5 hover:bg-blue-shadeb4 text-white font-bold py-2 px-4 rounded-[20px]"
          onClick={onClose}
        >
          ปิด
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
