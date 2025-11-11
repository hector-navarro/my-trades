import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Setup, SetupDocument } from './schemas/setup.schema';
import { CreateSetupDto, UpdateSetupDto } from './dto/setup.dto';

@Injectable()
export class SetupsService {
  constructor(@InjectModel(Setup.name) private readonly model: Model<SetupDocument>) {}

  create(userId: string, dto: CreateSetupDto) {
    return this.model.create({ userId: new Types.ObjectId(userId), ...dto });
  }

  findAll(userId: string) {
    return this.model.find({ userId }).lean().exec();
  }

  async update(userId: string, id: string, dto: UpdateSetupDto) {
    const updated = await this.model
      .findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Setup not found');
    }
    return updated;
  }

  async remove(userId: string, id: string) {
    const deleted = await this.model.findOneAndDelete({ _id: id, userId }).lean().exec();
    if (!deleted) {
      throw new NotFoundException('Setup not found');
    }
    return deleted;
  }
}
