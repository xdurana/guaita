var soap = require('soap');
var url = 'http://esb.uoc.es/dades-academiques-ws/services/DadesAcademiquesService?WSDL';

//http://cv.uoc.edu/~grc_8842_w01/ws/html/wsdl/DadesAcademiquesService.xml

exports.getAssignaturesByResponsableAny = function(req, res) {

	//http://localhost:3000/ws/getAssignaturesByResponsableAny?in0=224475&in1=20121

	var args = {
		in0: req.query.in0, //IDP del PRA "224475"
		in1: req.query.in1	//Any acadèmic "20121"
	};	
	soap.createClient(url, function(err, client) {
	  client.getAssignaturesByResponsableAny(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}