import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Currency, Status, TypeDiscount } from "src/enums/course.enum";

@Schema({ _id: false })
export class Discount {
    @Prop({ required: true })
    type: TypeDiscount;
    
    @Prop({ required: true, type: Number })
    number: number;
} 

@Schema({ _id: false })
export class Price {
    @Prop({ required: true })
    currency: Currency;
    
    @Prop({ required: true, type: Number })
    number?: number;
}

@Schema({ timestamps: true })
export class Course extends Document {
    @Prop({ required: true, type: String })
    name: string;
    
    @Prop({ required: true, type: String })
    description: string;
    
    @Prop({ required: true, type: Price })
    price: Price;
    
    @Prop({ type: Discount, required: false })
    discount?: Discount;

    @Prop({ type: String, required: false, default: null })
    instructorId?: string;

    @Prop({ type: String, required: false, default: null })
    category?: string;

    @Prop({ type: String, required: false, default: null })
    cover: string;

    @Prop({ required: false, type: [String], default: [] })
    students: string[];

    @Prop({ required: false, type: [String], default: [] })
    sessions: string[];

    @Prop({ required: true, type: Number })
    duration: number;
    
    @Prop({ type: String, enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const CourseSchema = SchemaFactory.createForClass(Course);