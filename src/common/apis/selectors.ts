import { TResponse } from "../../types";

export async function getDataOrNull<T>(
  fn: () => Promise<TResponse<T>>
): Promise<T | null> {
  try {
    const result = await fn();
    return result.result ?? null;
  } catch {
    return null;
  }
}
