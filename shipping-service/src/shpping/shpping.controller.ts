import { Controller } from '@nestjs/common';
import { ShppingService } from './shpping.service';

@Controller('shpping')
export class ShppingController {
  constructor(private readonly shppingService: ShppingService) {}
}
