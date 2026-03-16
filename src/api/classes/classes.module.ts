import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
  controllers: [ClassesController],
})
export class ClassesModule {}
