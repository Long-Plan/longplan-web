export * from "./auth";
export * from "./student";

export type TResponse<T> = {
  success: boolean;
  message?: string;
  result?: T;
};
