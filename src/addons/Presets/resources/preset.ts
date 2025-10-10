import { MessageValidator } from "@itsmybot";
import { IsNumber, IsOptional, Min } from "class-validator";

export default class DefautConfig extends MessageValidator {
    @IsOptional()
    @IsNumber()
    @Min(0)
    'update-time': number;
}