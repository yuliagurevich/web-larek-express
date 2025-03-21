import mongoose, { Schema } from 'mongoose';
import { productErrorMessages } from '../middlewares/error-messages';

interface IImage {
  fileName: string;
  originalName: string;
}

const imageSchema = new Schema<IImage>({
  fileName: {
    type: String,
    required: [true, productErrorMessages.image.fileName.required],
  },
  originalName: {
    type: String,
    required: [true, productErrorMessages.image.originalName.required],
  },
});

export interface IProduct {
  title: string;
  image: IImage;
  category: string;
  description?: string;
  price?: number | null;
}

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    minlength: [2, productErrorMessages.title.min],
    maxlength: [30, productErrorMessages.title.max],
    unique: true,
    required: [true, productErrorMessages.title.required],
  },
  image: imageSchema,
  category: {
    type: String,
    required: [true, productErrorMessages.category.required],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
});

export default mongoose.model<IProduct>('product', productSchema);
