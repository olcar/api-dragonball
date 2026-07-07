import { Module } from '@nestjs/common';
import { TransformationService } from './transformation.service';
import { TransformationController } from './transformation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transformation } from './entities/transformation.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Character } from 'src/characters/entities/character.entity';

@Module({
  controllers: [TransformationController],
  providers: [TransformationService],
  imports: [
    TypeOrmModule.forFeature([Transformation, Character]),
    CloudinaryModule,
  ],
})
export class TransformationModule {}
