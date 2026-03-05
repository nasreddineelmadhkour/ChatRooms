import { Router } from 'express';
import { body } from 'express-validator';
import validateFormData from '../helpers/validate_form.js';
import DB from '../models/db.js';

const router = Router();

/**
 * Route to list Logs records
 * @GET /logs/index/{fieldname}/{fieldvalue}
 */
router.get(['/', '/index/:fieldname?/:fieldvalue?'], async (req, res) => {
	try {
		const query = {};
		let queryFilters = [];
		let where = {};
		let replacements = {};
		let fieldName = req.params.fieldname;
		let fieldValue = req.params.fieldvalue;

		if (fieldName) {
			queryFilters.push(DB.filterBy(fieldName, fieldValue));
		}
		let search = req.query.search;
		if (search) {
			let searchFields = DB.Logs.searchFields();
			where[DB.op.or] = searchFields;
			replacements.search = `%${search}%`;
		}

		if (queryFilters.length) {
			where[DB.op.and] = queryFilters;
		}
		query.raw = true;
		query.where = where;
		query.replacements = replacements;
		query.order = DB.getOrderBy(req, 'logid', 'asc');
		query.attributes = DB.Logs.listFields();
		let page = parseInt(req.query.page) || 1;
		let limit = parseInt(req.query.limit) || 10;
		let result = await DB.Logs.paginate(query, page, limit);
		return res.ok(result);
	} catch (err) {
		return res.serverError(err);
	}
});

/**
 * Route to view Logs record
 * @GET /logs/view/{recid}
 */
router.get('/view/:recid', async (req, res) => {
	try {
		const recid = req.params.recid || null;
		const query = {
			raw: true,
			where: { LogID: recid },
			attributes: DB.Logs.viewFields()
		};
		let record = await DB.Logs.findOne(query);
		if (!record) {
			return res.notFound();
		}
		return res.ok(record);
	} catch (err) {
		return res.serverError(err);
	}
});

/**
 * Route to insert Logs record
 * @POST /logs/add
 */
router.post(
	'/add/',
	[
		body('ip').optional({ nullable: true }),
		body('details').optional({ nullable: true }),
		body('username').optional({ nullable: true }),
		body('room').optional({ nullable: true }),
	],
	validateFormData,
	async (req, res) => {
		try {
			let modeldata = req.getValidFormData();

			let currentDate = new Date();
			currentDate.setHours(currentDate.getHours() + 1);
			modeldata.datelog = currentDate;

			let record = await DB.Logs.create(modeldata);
			return res.ok(record);
		} catch (err) {
			return res.serverError(err);
		}
	}
);

/**
 * Route to get Logs record for edit
 * @GET /logs/edit/{recid}
 */
router.get('/edit/:recid', async (req, res) => {
	try {
		const recid = req.params.recid;
		const query = {
			raw: true,
			where: { LogID: recid },
			attributes: DB.Logs.editFields()
		};
		let record = await DB.Logs.findOne(query);
		if (!record) {
			return res.notFound();
		}
		return res.ok(record);
	} catch (err) {
		return res.serverError(err);
	}
});

/**
 * Route to update Logs record
 * @POST /logs/edit/{recid}
 */
router.post(
	'/edit/:recid',
	[
		body('ip').optional({ nullable: true }),
		body('details').optional({ nullable: true }),
		body('username').optional({ nullable: true }),
		body('room').optional({ nullable: true }),
	],
	validateFormData,
	async (req, res) => {
		try {
			const recid = req.params.recid;
			let modeldata = req.getValidFormData({ includeOptionals: true });
			let currentDate = new Date();
			currentDate.setHours(currentDate.getHours() + 1);
			modeldata.datelog = currentDate;
			const where = { LogID: recid };
			let record = await DB.Logs.findOne({ raw: true, where });
			if (!record) {
				return res.notFound();
			}
			await DB.Logs.update(modeldata, { where });
			return res.ok(modeldata);
		} catch (err) {
			return res.serverError(err);
		}
	}
);

/**
 * Route to delete Logs record by primary key
 * Multi delete supported by recid separated by comma
 * @GET /logs/delete/{recid}
 */
router.get('/delete/:recid', async (req, res) => {
	try {
		const recid = (req.params.recid || '').split(',');
		const where = { LogID: recid };
		let records = await DB.Logs.findAll({ raw: true, where });
		records.forEach(async (record) => {
			// Actions avant suppression si besoin
		});
		await DB.Logs.destroy({ where });
		return res.ok(recid);
	} catch (err) {
		return res.serverError(err);
	}
});

export default router;