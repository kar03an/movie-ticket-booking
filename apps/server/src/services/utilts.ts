import { ServerApiError } from "../lib";

// try catch wrapper
export function createService<ServiceArgs extends unknown[], ServiceResult>(
  serviceFn: (...args: ServiceArgs) => Promise<ServiceResult>,
) {
  return async (...args: ServiceArgs) => {
    try {
      return await serviceFn(...args);
    } catch (err) {
      throw new ServerApiError("Service error:", 500);
    }
  };
}


