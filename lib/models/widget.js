module.exports = function(config) {

    /**
     * Number of connected users
     * @param object
     * @returns {*}
     */
    var getConnectecUsers = function(object) {
        return object.connectedStudentsCount ? object.connectedStudentsCount : 0;
    };

    /**
     * Object tool
     * @param eina
     * @param docent
     * @returns {{}}
     */
    var setEina = function (eina, docent) {
        var e = {};
        e.viewItemsUrl = eina.viewItemsUrl;
        e.nom = eina.translatedDescription;
        e.resourceId = eina.resourceId;
        e.idTipoLink = eina.idTipoLink;
        e.mostrar = (eina.visible == 0 || eina.visible == 1 && docent);
        return e;
    };

    /**
     * Widget de l'aula v2
     * @param anyAcademic
     * @param codAssignatura
     * @param subjectId
     * @param codAula
     * @param classroomId
     * @param domainCode
     * @param idp
     * @param libs
     * @param up_maximized
     * @param mobil
     * @param s
     * @param next
     */
    var createWidget = function (anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, libs, up_maximized, mobil, s, next) {

        var struct = {
            anyAcademic: anyAcademic,
            codAssignatura: codAssignatura,
            domainId: subjectId,
            subjectId: subjectId,
            codAula: codAula,
            classroomId: classroomId,
            domainCode: domainCode,
            idp: idp,
            s: s,
            libs: libs,
            style: up_maximized == 'false' ? 'display:none' : 'display:block',
            lang: config.lng(),
            docent: false,
            missatgesPendents: 0,
            contrast: false,
            cv: config.cv(),
            aulaca: config.aulaca(),
            maximized: up_maximized != 'false',
            classminmax: up_maximized == 'false' ? 'maxim' : 'minim',
            mobil: mobil == 'true'
        };

        config.services.aulaca.authorize(s, idp, subjectId, function (err, result) {

            if (err) return next(err);
            //if (!result.student && !result.tutor && !result.teacher) return next(null, struct);

            struct.docent = result.teacher;
            struct.permisos = true;

            config.services.aulaca.getWidgetAula(subjectId, classroomId, s, function (err, result) {

                if (err) return next(null, struct);
                if (!(result.widget && result.widget.classroom)) return next("No s'ha pogut carregar el widget de l'aula");

                struct.anyAcademic = result.widget.anyAcademic;
                struct.codAssignatura = result.widget.classroom.codi;
                struct.codAula = result.widget.classroom.numeralAula;
                struct.domainCode = result.widget.classroom.domainCode;
                struct.nomAssignatura = result.widget.classroom.widgetTitle.replace("´", "'");
                struct.isAulaca = result.widget.classroom.presentation == 'AULACA';
                struct.color = result.widget.color;
                struct.secondaryColor = result.widget.secondaryColor;
                struct.urlAula = result.widget.classroomAccessUrl;
                struct.connectedStudentsAccessUrl = result.widget.connectedStudentsAccessUrl;
                struct.campus = result.widget.classroom.campus;

                struct.link = config.util.format(
                    '%s/app/guaita/assignatures/%s/%s/%s/aules/%s/%s/%s/widget?idp=%s&s=%s',
                    config.cv(),
                    struct.anyAcademic,
                    struct.codAssignatura,
                    struct.subjectId,
                    struct.codAula,
                    struct.classroomId,
                    struct.domainCode,
                    struct.idp,
                    struct.s
                );

                struct.avaluacio = [];
                result.widget.assessmentSystems.forEach(function (assessmentSystem) {
                    struct.avaluacio = struct.avaluacio.concat(assessmentSystem.links);
                });

                struct.referenceUsers = result.widget.referenceUsers.length > 0 ? result.widget.referenceUsers : false;
                struct.consultor = null;
                result.widget.referenceUsers.forEach(function (ru) {
                    struct.consultor = {
                        fitxa: ru.userResume,
                        nomComplert: ru.fullName,
                        foto: ru.photo,
                        writeTo: ru.writeTo
                    }
                });

                struct.activa = result.widget.currentActivity && result.widget.currentActivity.accessUrl != '' ? {
                    link: result.widget.currentActivity.accessUrl,
                    name: result.widget.currentActivity.name,
                    startDateStr: result.widget.currentActivity.startDateStr,
                    deliveryDateStr: result.widget.currentActivity.deliveryDateStr,
                    eines: []
                } : false;

                result.widget.currentActivity.resources.forEach(function (eina) {
                    struct.activa.eines.push(setEina(eina, struct.docent));
                });

                struct.connectats = getConnectecUsers(result.widget);

                struct.eines = [];
                result.widget.classroomResources.forEach(function (eina) {
                    struct.eines.push(setEina(eina, struct.docent));
                });

                return next(null, struct);
            });
        });
    };

    /**
     * Widget de l'aula v2 amb domainCode
     * @param domainCode
     * @param idp
     * @param libs
     * @param up_maximized
     * @param mobil
     * @param s
     * @param next
     */
    var createWidgetDomainCode = function (domainCode, idp, libs, up_maximized, mobil, s, next) {

        var struct = {
            domainCode: domainCode,
            idp: idp,
            s: s,
            libs: libs,
            style: up_maximized == 'false' ? 'display:none' : 'display:block',
            lang: config.lng(),
            docent: false,
            missatgesPendents: 0,
            contrast: false,
            cv: config.cv(),
            aulaca: config.aulaca(),
            maximized: up_maximized != 'false',
            classminmax: up_maximized == 'false' ? 'maxim' : 'minim',
            mobil: mobil == 'true'
        };

        config.services.aulaca.authorizeDomainCode(s, idp, domainCode, function (err, result) {

            if (err) return next(err);
            //if (!result.student && !result.tutor && !result.teacher) return next(null, struct);

            struct.docent = result.teacher;
            struct.permisos = true;

            config.services.aulaca.getWidgetDomainCode(domainCode, mobil, s, function (err, result) {

                if (err || !result) return next(err);
                if (!(result.widget && result.widget.classroom)) return next("No s'ha pogut carregar el widget de l'aula");

                struct.anyAcademic = result.widget.anyAcademic;
                struct.codAssignatura = result.widget.classroom.codi;
                struct.codAula = result.widget.classroom.numeralAula;
                struct.domainId = result.widget.classroom.domainId;
                struct.subjectId = result.widget.classroom.domainFatherId;
                struct.classroomId = result.widget.classroom.domainId;
                struct.domainCode = result.widget.classroom.domainCode;
                struct.nomAssignatura = result.widget.classroom.widgetTitle.replace("´", "'");
                struct.isAulaca = result.widget.classroom.presentation == 'AULACA';
                struct.color = result.widget.color;
                struct.secondaryColor = result.widget.secondaryColor;
                struct.urlAula = result.widget.classroomAccessUrl;
                struct.connectedStudentsAccessUrl = result.widget.connectedStudentsAccessUrl;
                struct.campus = result.widget.classroom.campus;

                struct.link = config.util.format(
                    '%s/app/guaita/assignatures/%s/%s/%s/aules/%s/%s/%s/widget?idp=%s&s=%s',
                    config.cv(),
                    struct.anyAcademic,
                    struct.codAssignatura,
                    struct.subjectId,
                    struct.codAula,
                    struct.classroomId,
                    struct.domainCode,
                    struct.idp,
                    struct.s
                );

                struct.avaluacio = [];
                result.widget.assessmentSystems.forEach(function (assessmentSystem) {
                    struct.avaluacio = struct.avaluacio.concat(assessmentSystem.links);
                });

                struct.referenceUsers = result.widget.referenceUsers.length > 0 ? result.widget.referenceUsers : false;
                struct.consultor = null;
                if (struct.referenceUsers) {
                    result.widget.referenceUsers.forEach(function (ru) {
                        struct.consultor = {
                            fitxa: ru.userResume,
                            nomComplert: ru.fullName,
                            foto: ru.photo,
                            writeTo: ru.writeTo
                        }
                    });
                }

                struct.activa = result.widget.currentActivity && result.widget.currentActivity.accessUrl != '' ? {
                    link: result.widget.currentActivity.accessUrl,
                    name: result.widget.currentActivity.name,
                    startDateStr: result.widget.currentActivity.startDateStr,
                    deliveryDateStr: result.widget.currentActivity.deliveryDateStr,
                    eines: []
                } : false;

                if (struct.activa) {
                    result.widget.currentActivity.resources.forEach(function (eina) {
                        struct.activa.eines.push(setEina(eina, struct.docent));
                    });
                }

                struct.connectats = getConnectecUsers(result.widget);

                struct.eines = [];
                result.widget.classroomResources.forEach(function (eina) {
                    struct.eines.push(setEina(eina, struct.docent));
                });

                return next(null, struct);
            });
        });
    };

    return {
        createWidget: createWidget,
        createWidgetDomainCode: createWidgetDomainCode
    }
};