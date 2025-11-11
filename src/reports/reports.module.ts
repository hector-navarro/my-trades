import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Trade, TradeSchema } from '../trades/schemas/trade.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Trade.name, schema: TradeSchema }])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportsModule {}
