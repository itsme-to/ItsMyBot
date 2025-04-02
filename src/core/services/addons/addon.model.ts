import { DataTypes, Optional } from 'sequelize';
import { Table, Model, Column } from 'sequelize-typescript';


interface AddonAttributes {
  name: string;
  enabled: boolean;
}

interface AddonCreationAttributes extends Optional<AddonAttributes, 'name'> { }

@Table
export default class Addon extends Model<AddonAttributes, AddonCreationAttributes> {
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
