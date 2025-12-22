import { DataTypes, InferAttributes, InferCreationAttributes, NonAttribute } from 'sequelize';
import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class CommandModel extends Model<InferAttributes<CommandModel>, InferCreationAttributes<CommandModel>> {
  @Column({
    type: DataTypes.STRING,
    primaryKey: true
  })
  declare id: string;

  @Column({
    type: DataTypes.STRING,
    defaultValue: null,
    allowNull: true
  })
  declare permission: string | null;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: true
  })
  declare enabled: boolean;

  @Column({
    type: DataTypes.JSON,
    defaultValue: {}
  })
  declare data: NonAttribute<any>;
}