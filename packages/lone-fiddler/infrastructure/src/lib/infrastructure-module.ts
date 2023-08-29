import { DynamicModule, Module } from '@nestjs/common';
import { Entity } from '@zenithal/lone-fiddler/shared';
import { Key } from '@zenithal/shared';
import * as dynamoose from 'dynamoose';
import {
  DynamooseModule,
  DynamooseModuleAsyncOptions,
  Model,
} from 'nestjs-dynamoose';
import { ModelDefinition } from 'nestjs-dynamoose/dist/interfaces';
import { DynamooseModuleOptions } from 'nestjs-dynamoose/dist/interfaces/dynamoose-options.interface';
import { Repository } from './repository';

@Module({})
export class InfrastructureModule {
  private static baseModuleConfig = {
    module: InfrastructureModule,
  };

  // Entities may be generated by Prisma.
  static async forRootAsync(options: DynamooseModuleAsyncOptions) {
    this.establishConnection();

    return {
      ...this.baseModuleConfig,
      imports: [DynamooseModule.forRootAsync(options)],
    };
  }

  static async forRoot(options: DynamooseModuleOptions) {
    this.establishConnection();
    return {
      ...this.baseModuleConfig,
      imports: [DynamooseModule.forRoot(options)],
    };
  }

  static forFeature<T extends Entity>(model: ModelDefinition): DynamicModule {
    return {
      ...this.baseModuleConfig,
      imports: [DynamooseModule.forFeature([model])],
      providers: [
        {
          provide: this.getTokenName(model.name),
          useFactory: (model: Model<T, Key>) => {
            return new Repository<T>(model);
          },
          inject: [
            {
              token: model.name,
              optional: false,
            },
          ],
        },
      ],
    };
  }

  private static establishConnection() {
    // const ddb = new dynamoose.aws.ddb.DynamoDB({
    //
    // });
    dynamoose.aws.ddb.local('http://localhost:8000');
  }

  private static getTokenName(modelName: string) {
    return modelName.toUpperCase() + '_REPOSITORY';
  }

  private static getModelToken(modelName: string) {
    return modelName.toUpperCase() + '_REPOSITORY';
  }
}