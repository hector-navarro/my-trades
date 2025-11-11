import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RiskPolicy, RiskPolicyDocument } from './schemas/risk-policy.schema';
import { UpdateRiskPolicyDto } from './dto/update-risk-policy.dto';

@Injectable()
export class RiskService {
  constructor(@InjectModel(RiskPolicy.name) private readonly model: Model<RiskPolicyDocument>) {}

  async getPolicy(userId: string) {
    let policy = await this.model.findOne({ userId }).lean().exec();
    if (!policy) {
      policy = await this.model
        .create({ userId: new Types.ObjectId(userId) })
        .then((doc) => doc.toObject());
    }
    return policy;
  }

  async updatePolicy(userId: string, dto: UpdateRiskPolicyDto) {
    return this.model
      .findOneAndUpdate(
        { userId },
        { $set: { ...dto } },
        { upsert: true, new: true }
      )
      .lean()
      .exec();
  }
}
