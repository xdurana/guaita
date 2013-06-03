var service = require('./service');
var url = 'http://esb.uoc.es/dades-academiques-ws/services/DadesAcademiquesService?WSDL';

//http://cv.uoc.edu/~grc_8842_w01/ws/html/wsdl/DadesAcademiquesService.xml

exports.getAssignaturesByResponsableAnyWS = function(req, res) {
	//http://localhost:3333/ws/getAssignaturesByResponsableAny?in0=224475&in1=20121
	var args = {
		in0: req.query.in0, //IDP del PRA "224475"
		in1: req.query.in1	//Any acadèmic "20121"
	};
	service.operation(url, 'getAssignaturesByResponsableAny', args, function(err, result) {
		if (err) throw new Error(err);
		res.json(result);
	});
}