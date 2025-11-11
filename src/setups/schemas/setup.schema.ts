import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SetupDocument = Setup & Document;

@Schema({ timestamps: true, collection: 'setups' })
export class Setup {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;
}

export const SetupSchema = SchemaFactory.createForClass(Setup);
