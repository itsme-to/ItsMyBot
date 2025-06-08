import { DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Model, Column } from 'sequelize-typescript';

@Table
export default class Addon extends Model<InferAttributes<Addon>, InferCreationAttributes<Addon>> {
  @Column({
    type: DataTypes.STRING,
    primaryKey: true
  })
  declare name: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: 1
  })
  declare enabled: boolean;
}
