import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCoffeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  flavors: string[];
}
