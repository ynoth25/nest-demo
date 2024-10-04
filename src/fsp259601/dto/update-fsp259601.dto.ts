import { PartialType } from '@nestjs/mapped-types';
import { CreateFsp259601Dto } from './create-fsp259601.dto';

export class UpdateFsp259601Dto extends PartialType(CreateFsp259601Dto) {}
