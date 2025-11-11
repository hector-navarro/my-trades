import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private readonly model: Model<TagDocument>) {}

  create(userId: string, dto: CreateTagDto) {
    return this.model.create({ userId: new Types.ObjectId(userId), ...dto });
  }

  findAll(userId: string) {
    return this.model.find({ userId }).lean().exec();
  }

  async update(userId: string, id: string, dto: UpdateTagDto) {
    const updated = await this.model
      .findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Tag not found');
    }
    return updated;
  }

  async remove(userId: string, id: string) {
    const deleted = await this.model.findOneAndDelete({ _id: id, userId }).lean().exec();
    if (!deleted) {
      throw new NotFoundException('Tag not found');
    }
    return deleted;
  }
}
