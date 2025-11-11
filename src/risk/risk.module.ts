import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { RiskPolicy, RiskPolicySchema } from './schemas/risk-policy.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: RiskPolicy.name, schema: RiskPolicySchema }])],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService]
})
export class RiskModule {}
