import multer, { StorageEngine } from 'multer';
import { faker } from '@faker-js/faker';
import { uploadPathTemp } from '../config';

import BadRequestError from '../errors/bad-reqest-error';

const storage: StorageEngine = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadPathTemp);
  },
  filename(_req, file, cb) {
    const id = faker.string.uuid();
    const fileExtension = file.originalname.split('.').pop();
    cb(null, `${id}.${fileExtension}`);
  },
});

const allowedTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

const fileMiddleware = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new BadRequestError('Разрешены только изображения png, jpg, jpeg, gif, svg+xml'));
    }
    cb(null, true);
  },
});

export default fileMiddleware;
