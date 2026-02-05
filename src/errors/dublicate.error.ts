import { QueryFailedError } from 'typeorm';

export function isMysqlDuplicateError(
  error: unknown,
): error is QueryFailedError & {
  driverError: { code: string };
} {
  return (
    error instanceof QueryFailedError &&
    typeof (error as QueryFailedError).driverError === 'object' &&
    (error as QueryFailedError).driverError !== null &&
    'code' in (error as QueryFailedError).driverError
  );
}
