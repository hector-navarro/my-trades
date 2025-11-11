import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SetupsController } from './setups.controller';
import { SetupsService } from './setups.service';
import { Setup, SetupSchema } from './schemas/setup.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Setup.name, schema: SetupSchema }])],
  controllers: [SetupsController],
  providers: [SetupsService],
  exports: [SetupsService]
})
export class SetupsModule {}
