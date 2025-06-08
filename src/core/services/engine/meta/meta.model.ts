import { DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Table, Model, Column, PrimaryKey } from 'sequelize-typescript';

@Table
export class Meta extends Model<InferAttributes<Meta>, InferCreationAttributes<Meta>> {
  @PrimaryKey
  @Column({
    type: DataTypes.STRING,
  })
  declare key: string;

  @PrimaryKey
  @Column({
    type: DataTypes.STRING
  })
  declare scopeId: string;

  @PrimaryKey
  @Column({
    type: DataTypes.ENUM,
    values: ["number", "string", "boolean"]
  })
  declare type: string;

  @PrimaryKey
  @Column({
    type: DataTypes.ENUM,
    values: ["user", "global", "channel"]
  })
  declare mode: string;

  @Column({
    type: DataTypes.STRING
  })
  declare value: string;

  async switch(value: boolean) {
    if (this.type !== 'boolean') {
      throw new Error('Meta type is not boolean');
    }
    this.value = value ? 'true' : 'false';
    await this.save();
  }

  async setValue(value: string | number | boolean) {
    this.value = String(value);
    await this.save();
  }

  async add(value: number) {
    if (this.type !== 'number') {
      throw new Error('Meta type is not number');
    }
    const currentValue = parseFloat(this.value);
    this.value = String(currentValue + value);
    await this.save();
  }

  async subtract(value: number) {
    if (this.type !== 'number') {
      throw new Error('Meta type is not number');
    }
    const currentValue = parseFloat(this.value);
    this.value = String(currentValue - value);
    await this.save();
  }
}