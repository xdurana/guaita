var config = require('../config');
var service = require('../ws/service');

exports.index = function(req, res) {
	//http://localhost:3333/professor?idp=224475&anyAcademic=20122

	async.waterfall([
		function(callback) {
			var args = {
				in0: req.query.idp,
				in1: req.query.anyAcademic
			}
			service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
				if (err) return callback(err);
				callback(null, result);
			});
		}
	], function (err, result) {
		res.json(result);
	});
}

exports.anys = function(req, res) {
	//http://localhost:3333/anys
	service.operation(config.dadesacademiqueswsdl(), 'getAllAnysAcademics', {
	}, function(err, result) {
		if (err) throw new Error(err);
		res.json(result);
	});
}

exports.aula = function(req, res) {
	//http://localhost:3333/aula?anyAcademic=20122&codAssignatura=M1.047&numAula=1
	service.operation(config.racwsdl(), 'getAula', {
		in0: req.query.anyAcademic,
		in1: req.query.codAssignatura,
		in2: req.query.numAula
	}, function(err, result) {
		if (err) throw new Error(err);
		res.json(result);
	});
}