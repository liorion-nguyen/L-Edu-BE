import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role, Status } from '../enums/user.enum';

@Schema({ _id: false })
class Address {
    @Prop({ required: true })
    province: string;

    @Prop({ required: true })
    district: string;

    @Prop({ required: true })
    ward: string;
}

@Schema({ _id: false })
class Phone {
    @Prop({ required: true })
    country: string;

    @Prop({ required: true })
    number: string;
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true })
    password: string;

    @Prop({ default: null })
    avatar?: string;

    @Prop({ type: Address, required: false, default: null })
    address?: Address;

    @Prop({ type: Phone, required: false, default: null })
    phone?: Phone;

    @Prop({ required: true })
    fullName: string;

    @Prop({ default: null })
    gender?: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ enum: Role, default: Role.STUDENT })
    role: Role;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;

    @Prop({ default: null })
    birthday?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
