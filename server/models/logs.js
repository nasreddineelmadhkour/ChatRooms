import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Logs extends BaseModel {
	static init() {
		return super.init(
			{
				logid: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				ip: { type: Sequelize.STRING(50), allowNull: true, },
                details: { type: Sequelize.STRING(50), allowNull: true, },
                username: { type: Sequelize.STRING(50), allowNull: true, },
                room: { type: Sequelize.STRING(50), allowNull: true, },
                msg: { type: Sequelize.STRING(50), allowNull: true, },

				datelog: {type: Sequelize.DATE,allowNull: true,},

			},
			{
				sequelize,
				schema: "dbo",
				tableName: "LOGS",
				modelName: "LOGS",
				timestamps: false, // car y a pas les colonnes createdAt et updatedAt
			}
		);
	}

	static listFields() {
		return [
			Sequelize.literal("LogID AS logid"),
			Sequelize.literal("IP AS ip"),
			Sequelize.literal("Details AS details"),
			Sequelize.literal("Username AS username"),
			Sequelize.literal("Room AS room"),
			Sequelize.literal("DateLog AS datelog"),
            Sequelize.literal("MSG AS msg"),
		];
	}

	static viewFields() {
		return this.listFields();
	}

	static editFields() {
		return [
			Sequelize.literal("IP AS ip"),
			Sequelize.literal("Details AS details"),
			Sequelize.literal("Username AS username"),
			Sequelize.literal("Room AS room"),
			Sequelize.literal("DateLog AS datelog"),
            Sequelize.literal("MSG AS msg"),
		];
	}

	static searchFields() {
		return [
			Sequelize.literal("LogID LIKE :search"),
			Sequelize.literal("IP LIKE :search"),
			Sequelize.literal("Details LIKE :search"),
			Sequelize.literal("Username LIKE :search"),
			Sequelize.literal("Room LIKE :search")
		];
	}
}

Logs.init();
export default Logs;