import type Sharp from './types';

const sharp: Sharp = require('sharp');

export const preprocessingImageFile = async (buffer: Buffer) => {
  return sharp(buffer)
    .resize(250, 250)
    .webp()
    .toBuffer()
    .then((data) => ({ buffer: data, mimetype: 'image/webp' }))
    .catch((error) => {
      console.log(error);
      return null;
    });
};
