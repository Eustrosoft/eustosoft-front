import { httpStatusCodeNames } from '../constants/http-status-code-names.constant';

export const getHttpStatusCodeName = (value: number): string => {
  return httpStatusCodeNames[value] || 'Unknown status';
};
