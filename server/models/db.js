import { Sequelize, sequelize } from './basemodel.js';

// Override timezone formatting
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
	return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss');
};



import Logs from './logs.js';


const op = Sequelize.Op;
const raw = Sequelize.literal; // use to include raw expression

const filterBy = function (expression, value) {
	return sequelize.where(raw(expression), value);
}


function rawQuery(queryText, options) {
	return sequelize.query(queryText, options);
}

function rawQuery2(queryText, options) {
	return sequelize2.query(queryText, options);
}
async function rawQueryList(queryText, queryParams) {
	const records = await rawQuery(queryText, { replacements: queryParams, type: Sequelize.QueryTypes.SELECT });
	return records;
}


async function rawQueryList2(queryText, queryParams) {
	const records = await rawQuery2(queryText, { replacements: queryParams, type: Sequelize.QueryTypes.SELECT });
	return records;
}


async function rawQueryOne(queryText, queryParams) {
	const records = await rawQueryList(queryText, queryParams);
	return records[0] || null;
}

async function rawQueryValue(queryText, queryParams) {
	const record = await rawQueryOne(queryText, queryParams);
	if (record) {
		return Object.values(record)[0];
	}
	return null;
}

function getOrderBy(req, sortField = null, sortType = 'desc') {
	const orderBy = req.query.orderby || sortField;
	const orderType = req.query.ordertype || sortType;
	if (orderBy) {
		let order = raw(`${orderBy} ${orderType}`);
		return [[order]];
	}
	return null;
}

export default {
	sequelize,
	op,
	filterBy,
	raw,
	rawQuery,
	rawQueryList,
	rawQueryList2,
	rawQueryOne,
	rawQueryValue,
	getOrderBy,
	Logs,

}
