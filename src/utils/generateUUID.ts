import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4().replace(/-/g, '').slice(0, 8);
};
