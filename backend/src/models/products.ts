import mongoose, { Schema } from 'mongoose';

interface IImage {
    fileName: string;
    originalName: string;
}

const imageSchema = new Schema<IImage>({
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    }
})

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
        min: 2,
        max: 30,
        unique: true,
        required: true
    },
    image: imageSchema,
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        default: null
    }
})

export default mongoose.model<IProduct>('product', productSchema);