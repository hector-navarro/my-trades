import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { Trade, TradeSchema } from '../trades/schemas/trade.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Trade.name, schema: TradeSchema }])],
  controllers: [ExportsController],
  providers: [ExportsService]
})
export class ExportsModule {}
