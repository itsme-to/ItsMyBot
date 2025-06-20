import { DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Model, Column, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { MetaMode, MetaType } from './metaHandler.js';

@Table({
  indexes: [
    {
      name: 'meta_unique_scope',
      unique: true,
      fields: ['key', 'scopeId'],
    },
  ],
})
export class MetaData extends Model<InferAttributes<MetaData>, InferCreationAttributes<MetaData>> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  })
  declare id: number | null;
  
  @Column({
    type: DataTypes.STRING,
  })
  declare key: string;

  @Column({
    type: DataTypes.STRING
  })
  declare scopeId: string;

  @Column({
    type: DataTypes.ENUM,
    values: ["number", "string", "boolean", "list"]
  })
  declare type: MetaType;

  @Column({
    type: DataTypes.ENUM,
    values: ["user", "global", "channel", "message"]
  })
  declare mode: MetaMode;

  @Column({
    type: DataTypes.STRING
  })
  declare value: string;

  async toggle(value: boolean) {
    if (this.type !== MetaType.BOOLEAN) {
      throw new Error('Meta type is not boolean');
    }
    this.value = value ? 'true' : 'false';
    await this.save();
  }

  async setValue(value: string | number | boolean | string[]) {
    this.value = Array.isArray(value) ? JSON.stringify(value) : String(value);
    await this.save();
  }

  async add(value: number) {
    if (this.type !== MetaType.NUMBER) {
      throw new Error('Meta type is not number');
    }
    const currentValue = parseFloat(this.value);
    this.value = String(currentValue + value);
    await this.save();
  }

  async subtract(value: number) {
    if (this.type !== MetaType.NUMBER) {
      throw new Error('Meta type is not number');
    }
    const currentValue = parseFloat(this.value);
    this.value = String(currentValue - value);
    await this.save();
  }

  async listAdd(value: string) {
    if (this.type !== MetaType.LIST) {
      throw new Error('Meta type is not list');
    }
    const currentValue = JSON.parse(this.value || '[]');
    if (!Array.isArray(currentValue)) {
      throw new Error('Current value is not an array');
    }
    currentValue.push(value);
    this.value = JSON.stringify(currentValue);
    await this.save();
  }

  async listRemove(value: string) {
    if (this.type !== MetaType.LIST) {
      throw new Error('Meta type is not list');
    }
    const currentValue = JSON.parse(this.value || '[]');
    if (!Array.isArray(currentValue)) {
      throw new Error('Current value is not an array');
    }
    const index = currentValue.indexOf(value);
    if (index > -1) {
      currentValue.splice(index, 1);
      this.value = JSON.stringify(currentValue);
      await this.save();
    }
  }
}