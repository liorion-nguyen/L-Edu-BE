import { Body, Controller, Get, Post } from '@nestjs/common';
import { SkipAuth } from './config/skip.auth';

@Controller()
export class AppController {
  @Get('/')
  @SkipAuth()
  getHome(): string {
    return 'Welcome to L Edu API 🚀';
  }

  @Get('/health')
  @SkipAuth()
  healthCheck(): object {
    return { status: 'ok', timestamp: new Date() };
  }

  @Post('/jits')
  @SkipAuth()
  handleJits(@Body() body: {
    currentEmployeeSalary: string;
    desiredEmployeeSalary: string;
  }): any {
    const { currentEmployeeSalary, desiredEmployeeSalary } = body;
    const currentSalary = parseFloat(currentEmployeeSalary);
    const desiredSalary = parseFloat(desiredEmployeeSalary);
    const precentageIncrease = ((desiredSalary - currentSalary) / currentSalary) * 100;
    console.log(`Current Salary: ${precentageIncrease}`);
    return {
      errorCode: 0, 
      metadata: { 
        precentageIncrease: precentageIncrease.toFixed(2)
      }
    };
  }
}