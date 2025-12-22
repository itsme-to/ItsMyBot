import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table
export default class Preset extends Model<InferAttributes<Preset>, InferCreationAttributes<Preset>> {

  @Column({
    type: DataType.STRING,
    primaryKey: true
  })
  declare id: string;

  @Column(DataType.STRING)
  declare channelId: string;

  @Column(DataType.STRING)
  declare presetPath: string;
}