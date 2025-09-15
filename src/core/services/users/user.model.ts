import { userMention } from 'discord.js';
import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Column({
    type: DataTypes.STRING,
    primaryKey: true
  })
  declare id: string;

  @Column({
    type: DataTypes.STRING
  })
  declare username: string;

  @Column({
    type: DataTypes.STRING
  })
  declare displayName: string;

  @Column({
    type: DataTypes.STRING
  })
  declare avatar: string | null;

  @Column({
    type: DataTypes.INTEGER
  })
  declare createdAt: number

  @Column({
    type: DataTypes.INTEGER,
    allowNull: true
  })
  declare joinedAt?: number

  @Column({
    type: DataTypes.JSON
  })
  declare roles: string[];

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false
  })
  declare isBot: boolean;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 0
  })
  declare coins: CreationOptional<number>;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 0
  })
  declare messages: CreationOptional<number>

  get mention(): NonAttribute<string> {
    return userMention(this.id);
  }

  async addCoins(amount: number) {
    this.coins += amount;
    await this.save();
  }

  async removeCoins(amount: number) {
    if (this.coins >= amount) {
      this.coins -= amount;
      await this.save();
    } else {
      throw new Error("Insufficient coins");
    }
  }

  async setCoins(amount: number) {
    this.coins = amount;
    await this.save();
  }

  hasCoins(amount: number) {
    return this.coins >= amount;
  }
}