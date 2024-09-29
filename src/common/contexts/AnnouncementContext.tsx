import { Nullable } from "tsdef";
import { create } from "zustand";

type AnnouncementStore = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  component: Nullable<React.ReactNode>;
  setComponent: (component: React.ReactNode) => void;
};

const useAnnouncementContext = create<AnnouncementStore>()((set) => ({
  isVisible: false,
  setIsVisible: (visible: boolean) => set(() => ({ isVisible: visible })),
  component: null,
  setComponent: (component: React.ReactNode) => set(() => ({ component })),
}));

export default useAnnouncementContext;
