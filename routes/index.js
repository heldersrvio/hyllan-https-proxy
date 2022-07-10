const express = require('express');
const FTPS = require('ftps');

const router = express.Router();
const ftps = new FTPS({
	host: process.env.FTPS_HOST,
	username: process.env.FTPS_USERNAME,
	password: process.env.FTPS_PASSWORD,
	protocol: 'ftp',
	port: process.env.FTPS_PORT || 21,
	additionalLftpCommands: 'set ssl:verify-certificate no'
});

router.post('/*', (req, res) => {
	try {
		if (!req.files) {
			res.send({
				status: false,
				message: 'No file uploaded',
			});
		} else {
			const file = req.files.file;
			const filePath = `/tmp/${file.name};`
			file.mv(filePath);
			ftps.mkdir(`.${req.path.slice(0, req.path.lastIndexOf('/'))}`, '-p').put(filePath, `.${req.path}`).exec((error, _res) => {
				if (!error) {
					res.send({
						status: true,
						message: 'File uploaded',
						data: {
							name: file.name,
							mimetype: file.mimetype,
							size: file.size,
						},
					});
				} else {
					res.status(500).send(error);
				}
			});
		}
	} catch (error) {
        res.status(500).send(error);
    }
});

router.get('/*', (req, res) => {
	try {
		const fileName = req.path.split('/').pop();
		const filePath = `/tmp/${fileName}`;
		ftps.get(`${req.path}`, filePath).exec((_error, _res) => {
			console.log(res);
			res.download(filePath);
		});
	} catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
