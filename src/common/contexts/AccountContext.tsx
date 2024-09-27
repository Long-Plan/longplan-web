import { Nullable } from "tsdef";
import { create } from "zustand";
import { Account } from "../../types/auth";

type AccountStore = {
  accountData: Nullable<Account>;
  setAccountData: (data: Account | null) => void;
};

const useAccountContext = create<AccountStore>()((set) => ({
  accountData: null,
  setAccountData: (data: Account | null) => set(() => ({ accountData: data })),
}));

export default useAccountContext;
