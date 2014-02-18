I18N_EXPAND = typeof(I18N_EXPAND) == 'undefined' ? 'Expandir' : I18N_EXPAND;
I18N_COLLAPSE = typeof(I18N_COLLAPSE) == 'undefined' ? 'Contraer' : I18N_COLLAPSE;

/* Main Aulas Application */

String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

var UOCAulas = (function($) {

    var baseURL = '/app/guaita';
    var userRole = 'student'; // student, pra, consultor, aula
    var s = '';
    var idp = '';

    /* Método importado de uoc/common.js */
    var getWinNm = function() {
        var now = new Date();
        var hr = new String(now.getHours());
        var mn = new String(now.getMinutes());
        var sc = new String(now.getSeconds());
        var winNm = hr + mn + sc;
        return winNm;
    };

    /* Método importado de uoc/common.js */
    var oWin = function(event, url ) {   
        event.preventDefault();
        event.stopPropagation();
        window.open(url,getWinNm(),'scrollbars,menubar,status,resizable,width=800,height=600');
    };

    /* Ajustes varios */
    var setupGlobalAdjusts = function(){

        /* Declaración eventos delegados para las ventanas popup */
        $('#content').on('click', '.LaunchesOWin', function(event){
            oWin(event,$(this).attr('href'));
        });

        $('#feedback').on('click', '.LaunchesOWin', function(event){
            oWin(event,$(this).attr('href'));
        });        

        $('#content').on('click', '.lnk-user', function(event){
            oWin(event,$(this).attr('href'));
        });        

        /* Selección multiple de usuarios */
        $('#content').on('click', '.check-all-users', function () {
            var chk = this;
            var tbl = $(this).closest('.tbl-users');
            tbl.find(".check-user").each(function(){
                if($(this).is(":visible"))
                    $(this).prop('checked', chk.checked);
                else
                    $(this).prop('checked', false);
            });           
        });

        $('#content').on('click', '.lnk-contact-all', function () {
            event.stopPropagation();
            var to = [];
            var students = $(this).closest('.ui-tabs-panel').find('[data-guaita-idp]');
            students.each(function(){
                var checkeds = $(this).find('input[type=checkbox]:checked');
                if (checkeds.length > 0) {
                    to.push(encodeURI($(checkeds).attr('data-guaita-username')));
                }
            });
            oWin(event, 'http://cv.uoc.edu/WebMail/writeMail.do?s=' + s + '&to=' + to.join(',') + '&cc=&re=&body=&l=pers&type=popup');
            return false;
        });

        var getcount = function(url, c1, c2) {
            $(c1).spin('tiny');
            $(c2).spin('tiny');
            var jqxhr = $.getJSON(url, {
                format: 'json'
            })
            .done(function(data) {
                $(c1).text(data.value);
                $(c2).text(data.value);
            })
            .fail(function() {
                $(c1).text("N/D");
                $(c2).text("N/D");
            })
            .always(function() {
                $(c1).spin(false);
                $(c2).spin(false);
            });
        }

        var getdate = function(url, c1, c2) {
            $(c1).spin('tiny');
            $(c2).spin('tiny');
            var jqxhr = $.getJSON(url, {
                format: 'json'
            })
            .done(function(data) {
                if (data.value.length > 0) {
                    var d = moment(data.value[0].timestamp).format("DD/MM/YYYY");
                } else {
                    var d = "N/D";
                }
                $(c1).text(d);
                $(c2).text(d);
            })
            .fail(function() {
                $(c1).text("N/D");
                $(c2).text("N/D");
            })
            .always(function() {
                $(c1).spin(false);
                $(c2).spin(false);
            });
        }

        var loadclicks = function(cell) {            
            var idp = $(cell).attr('data-guaita-idp');
            var domainidaula = $(cell).attr('data-guaita-domainidaula');
            var url = '{0}/lrs/idp/{1}/aules/{2}?s={3}'.format(baseURL, idp, domainidaula, s);
            var c1 = $(cell).find('.clics-estudiant');
            var c2 = $('.tools-aula-acc[data-guaita-idp="' + idp + '"]').find('.clics-estudiant');
            getcount(url, c1, c2);
        }

        var loadlastclassroomconnection = function(cell) {
            var idp = $(cell).attr('data-guaita-idp');
            var domainidaula = $(cell).attr('data-guaita-domainidaula');
            var url = '{0}/lrs/idp/{1}/aules/{2}/last?s={3}'.format(baseURL, idp, domainidaula, s);
            var c1 = $(cell).find('.connexio-aula-estudiant');
            var c2 = $('.tools-aula-acc[data-guaita-idp="' + idp + '"]').find('.connexio-aula-estudiant');
            getdate(url, c1, c2);
        }

        var loadlastclassroomwidgetconnection = function(cell) {
            var idp = $(cell).attr('data-guaita-idp');
            var domainidaula = $(cell).attr('data-guaita-domainidaula');
            var url = '{0}/lrs/idp/{1}/aules/{2}/widget?s={3}'.format(baseURL, idp, domainidaula, s);
            var c1 = $(cell).find('.connexio-widget-estudiant');
            var c2 = $('.tools-aula-acc[data-guaita-idp="' + idp + '"]').find('.connexio-widget-estudiant');
            getdate(url, c1, c2);
        }

        $(".activ-aula-acc" ).each(function() {
            loadclicks($(this));
            loadlastclassroomconnection($(this));
            loadlastclassroomwidgetconnection($(this));
        });
    };

    /* Aula simplecolorpicker setup */
    var setupColorpickers = function(){

        if (!jQuery().simplecolorpicker) return;

        /* setup Colorpickers */
        $('.colorpicker').simplecolorpicker({delay:200,picker: true});
        $('.colorpicker').change(function() {
            /*
             * TODO: Cambio de color asignatura server side vía ajax 
             * Sustituir el color de los cuadros correspondientes en calendarios y filtros
             * Será necesario identificar de forma inequivoca estos cuadros con la asignatura, 
             * porque podría haber más de una asignatura con el mísmo color.
             * En esta maqueta solo se cambia el color de la barra.
             */
            var $block = $(this).parent();
            var new_color = $(this).val().replace('#', '');
            var old_color = $block.data('color');
            $block.data('color', new_color);
            $block.removeClass('c_'+old_color).addClass('c_'+new_color);
        });
    };

    /* Ordenación: jqueryui sortable */
    var setupSortable = function(){ 
        $( ".sortable" ).sortable({
            revert: 100,
            cursor: "move",
            handle: ".icon-move",
            placeholder: "ui-sortable-placeholder",
            forcePlaceholderSize: true,
            update : function(e, ui) {
                // TODO: Save new order
                console.log($(".sortable").sortable("toArray"));
            }
        });
    };

    /* Tooltips: jqueryui tooltip */
    var setupTooltips = function(){
        $('.tooltip').tooltip({
            position: {
            my: "left-20% bottom-12",
            at: "center top",
            using: function( position, feedback ) {
                $( this ).css( position );
                $( "<div>" )
                    .addClass( "tip-arrow" )
                    .appendTo( this );
                }
            }
        });
    };

    var setupCalendars = function(){
        addTabsEvents('.tabs-calendar');
        setupCalendarFilters();
        buildCalendar();
    };

    var buildCalendar = function() {
        clearCalendar();
        $('#month-select').on('change', function() {
            clearCalendar();
            $('#page-' + this.value).show();
            $('#list-' + this.value).show();
        });
        var month = new Date().getMonth() + 1;
        $('#month-select').val(new Date().getFullYear() + '-' + month);
        $('#page-' + new Date().getFullYear() + '-' + month).show();
        $('#list-' + new Date().getFullYear() + '-' + month).show();

    }

    var clearCalendar = function() {
        $(".tbl-calendar" ).each(function() {
            $(this).hide();
        });

        $(".tbl-events" ).each(function() {
            $(this).hide();
        });

        $(".calendar-semester" ).each(function() {
            $(this).show();
        });

        $(".events-semester" ).each(function() {
            $(this).show();
        });

        $(".typology-list :checkbox").click(function() {
            reloadEvents();
        });

        $(".subject-list :checkbox").click(function() {
            reloadEvents();
        });
    }

    var reloadEvents = function() {
        $(".event-tipus").show();
        $(".typology-list :checkbox:not(:checked)").each(function() {
            $(".event-tipus-" + $(this).val()).hide();
        });
        $(".subject-list :checkbox:not(:checked)").each(function() {
            $(".event-aula-" + $(this).val()).hide();
        });
    }

    /* Gestiona la visibilidad de eventos del calendario */
    var setupCalendarFilters = function(){

         $(':checkbox.check-filter').click (function () {

            var self = this;
            var arr_subjects = $(":checkbox[name='filter_subject[]']:checked").map(function(){ return $(this).val(); }).get();
            var arr_types = $(":checkbox[name='filter_type[]']:checked").map(function(){ return $(this).val(); }).get();
            var arr_events = [];
            var pattern = '-';

            if($(self).attr('name') === 'filter_subject[]')
                pattern = $(self).val() + pattern; 
            else
                pattern = pattern + $(self).val();

            $.each(arr_subjects,function(i1,val1){
                $.each(arr_types,function(i2,val2){
                    arr_events.push(val1+'-'+val2);
                });
            });

            $('[class*="'+pattern+'"]').each(function(){
                var item = this;
                var n_events = $.grep(arr_events, function(el){ return $(item).hasClass(el); });
                var minim = 0;

                if($(item).parent().hasClass('multiple')) minim = 1;

                if(n_events.length>minim){
                    if($(item).parent().parent().hasClass('day-wrap')){
                        $(item).parent().addClass('on');
                        $(item).parent().fadeIn(300);
                    }else{
                        $(item).fadeIn(300);
                    }
                }else{
                    if($(item).parent().parent().hasClass('day-wrap')){
                        $(item).parent().removeClass('on');
                        $(item).parent().fadeOut(300);
                    }else{
                        $(item).fadeOut(300);
                    }
                }  
                 
            });

            $('.day-wrap > :last-child').each(function(){
                var on = false;
                var $current = $(this);

                if($(this).hasClass('on')) {
                    $(this).attr('aria-hidden', false);
                    on = true;
                }else{
                    $(this).attr('aria-hidden', true);
                }

                $($current.prevUntil('.no-event')).each(function(){
                    if($(this).hasClass('on')){
                        if(on){
                            $(this).attr('aria-hidden', true);
                        }else{
                            on=true;
                            $(this).attr('aria-hidden', false);
                        }
                    }else{
                      $(this).attr('aria-hidden', true);  
                    }
                });

                if(on) 
                    $(this).parent().find('.no-event').attr('aria-hidden', true).hide();
                else
                    $(this).parent().find('.no-event').attr('aria-hidden', false).show();
            });

        });

    };

    /* Accordeon (Estudiantes): jqueryui accordion */
    var setupAccordionStudent = function(){
        $( ".accordion" ).each(function(){
            var activa = ( $(this).hasClass('open') ) ? 0 : false;
            if(!$(this).hasClass('ui-accordion')){
                $(this).accordion({
                    heightStyle: "content",
                    collapsible: true,
                    header: '.block-head',
                    active: activa,
                    animate: {
                        easing: "easeOutQuint",
                        duration: 300
                    },
                    beforeActivate: function( event, ui ) {
                       if($(this).children('.block-head').hasClass('ui-state-active')){
                            $(this).find('.closed-lbl').hide();
                            $(this).find('.open-lbl').show();
                       }else{
                            $(this).find('.open-lbl').hide();
                            $(this).find('.closed-lbl').show();
                       }
                    }
                });
            }
        });

        // Stop propagation for links in accordion headers
        $(".block-top").unbind("click").click(function(ev){ ev.stopPropagation(); }); 
    };

    /* Accordeon bloques principales de asignaturas (PRA/Consultor): jqueryui accordion */
    var setupAccordionSubjects = function(){
        $(".accordion").on('click', '.block-head', function(ev) {
            var self = this;
            var acc = $(self).parent();
		    var block = $(acc).find('.block-head');
            var url = '{0}/aules/?s={1}&idp={2}&perfil={3}'.format(
                subjectBaseURL(block),
                s,
                idp,
                userRole === 'pra' ? 'pra' : 'consultor'
            );
            if (acc.hasClass('loaded')) {
                toggleSubject(acc);
            } else {
                if(!acc.hasClass('loading')){
                    acc.addClass('loading');
                    $(self).children('.ui-icon').spin('tiny');
                    $.ajax({
                        type: "GET",
                        url: url,
                        dataType: "html"
                    }).done(function(data){
                        acc.find('.block-content').html(data);
                        addSubjectEvents(acc);
                    }).fail(function(jqXHR, status, error) {
                        acc.find('.block-content').html('<div class="error-row">' + status + ": " + error+'</div>');
                        //console.log('Error:' + status + " > " + error);
                    }).always(function() {
                        $(self).children('.ui-icon').spin(false);
                        acc.removeClass('loading').addClass('loaded');
                		toggleSubject(acc);
                    });
            	}
            }
        });

        $( ".accordion" ).each(function(){
            var self = this;
            if(!$(self).hasClass('ui-accordion')){
                $(self).accordion({
                    heightStyle: "content",
                    collapsible: true,
                    header: '.block-head',
                    active: false,
                    event: false,
                    animate: {
                        easing: "easeOutQuint",
                        duration: 500
                    }
                });
            }
            // con class="open" podemos abrimos el bloque inicialmente
            // if ($(self).hasClass('open')) $(self).find('.block-head').trigger('click');
        });

        // Stop propagation for links in accordion headers
        $(".block-top").unbind("click").click(function(ev){ ev.stopPropagation(); });

    };

    /* Gestión toggle accordion principal subjects */
    var toggleSubject = function(acc){
        if (acc.accordion("option", "active") === false) {
            acc.accordion('activate', 0);
            acc.children('.block-resum').slideUp({ duration: 500, easing: 'easeOutQuint' });
        }else{
            acc.accordion("activate", false);
            acc.children('.block-resum').slideDown({ duration: 500, easing: 'easeOutQuint' });
        }
    };

    /* Gestión toggle accordion tablas interiores (no jqueryui accordion) */
    var toggleRow = function(elm, acc, acc_content){
        if(acc.hasClass('open')){
            acc.removeClass('open');
            $(elm).attr('title',I18N_EXPAND);
        }else{
            acc.addClass('open');
            $(elm).attr('title',I18N_COLLAPSE);
        }

        var tbl = acc.closest('.tbl-subject');
        if(tbl.find('> tbody.open').length>0){
            if (!tbl.hasClass('tbl-open')) tbl.addClass('tbl-open');
        }else{
            if (tbl.hasClass('tbl-open')) tbl.removeClass('tbl-open');
        }
        acc_content.slideToggle(500, 'easeOutQuint');
    };

    var subjectBaseURL = function(block) {
        return '{0}/assignatures/{1}/{2}/{3}'.format(
            baseURL,
            $(block).attr('data-guaita-anyacademic'),
            $(block).attr('data-guaita-assignatura'),
            $(block).attr('data-guaita-domainId')
        );
    }

    var classroomBaseURL = function(block) {
        return '{0}/aules/{1}/{2}/{3}'.format(
            subjectBaseURL(block),
            $(block).attr('data-guaita-codaula'),
            $(block).attr('data-guaita-domainIdAula'),
            $(block).attr('data-guaita-domainCode')
        );
    }

    /* Declaración de eventos tbl-subject por tipo */
    var addSubjectEvents = function(acc){
        addTabsEvents(acc.find('.tabs'));

        $('.window-close').click(function(){
            window.close();
        });

        $(acc).find('.activ-student-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/activitats?s={1}'.format(
                classroomBaseURL(block),
                s
            );
            getTable(this, url, true);
        });

        $(acc).find('.tools-student-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/eines?idp={1}&s={2}'.format(
                classroomBaseURL(block),
                $(block).attr('data-guaita-idp'),
                s
            );
            getTable(this, url, false);
        });

        $(acc).find('.eval-student-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var domainId = $(block).attr('data-guaita-domainId');
            var domainIdAula = $(block).attr('data-guaita-domainIdAula');

            var head = $(acc).find('.block-head');
            var codAssignatura = $(head).attr('data-guaita-assignatura');
            var anyAcademic = $(head).attr('data-guaita-anyacademic');
            var codAula = $(block).attr('data-guaita-codaula');

            var url = '{0}/avaluacio?s={1}'.format(
                classroomBaseURL(block),
                s
            );
            getTable(this, url, false);
        });

        $(acc).find('.activ-consultor-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/activitats?s={2}&idp={1}&perfil=consultor'.format(
                classroomBaseURL(block),
                $(block).attr('data-guaita-idp'),
                s
            );
            getTable(this, url, true);
        });

        $(acc).find('.tools-consultor-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/eines?s={2}&idp={1}&perfil=consultor'.format(
                classroomBaseURL(block),
                $(block).attr('data-guaita-idp'),
                s
            );
            getTable(this, url, false);
        });

        $(acc).find('.activ-aula-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/activitats?s={2}&idp={1}&perfil=estudiant'.format(
                classroomBaseURL(block),
                $(block).attr('data-guaita-idp'),
                s
            );
            getTable(this, url, true);
        });

        $(acc).find('.tools-aula-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/eines?s={2}&idp={1}&perfil=estudiant'.format(
                classroomBaseURL(block),
                $(block).attr('data-guaita-idp'),
                s
            );
            getTable(this, url, false);
        });

        $('.lnk-more-aula').click(function() {
            $(this).attr('target', '_blank');
        });

        $('.lnk-extern').click(function() {
            $(this).attr('target', '_blank');
        });
    };

    /* Declaración de eventos tbl-aula */
    var addAulaEvents = function(acc) {
        $(acc).find('.activ-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var url = '{0}/activitats/{1}/eines?idp={2}&s={3}'.format(
                classroomBaseURL(block),                
                $(block).attr('data-guaita-eventId'),
                $(block).attr('data-guaita-idp') == '' ? idp : $(block).attr('data-guaita-idp'),
                s
            );
            getTable(this, url, false);
        });
        $(acc).find('.activ-item > .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            if (acc.hasClass('activ-student-acc')) {
                var url = '{0}/activitats/{1}/eines?idp={2}&s={3}'.format(
                    classroomBaseURL(block),
                    $(block).attr('data-guaita-eventId'),
                    $(block).attr('data-guaita-idp'),
                    s
                );
                getTable(this, url, false);
            } else {
                var url = '{0}/activitats/{2}/eines?s={3}&idp={1}&perfil=estudiant'.format(
                    classroomBaseURL(block),
                    $(block).attr('data-guaita-idp'),
                    $(block).attr('data-guaita-eventId'),
                    s
                );
                getTable(this, url, false);
            }
        });
    };

    /* Declaración eventos tabs: jqueryui tab */
    var addTabsEvents = function(tabs) {
        $(tabs).tabs({
            active: 0,
            hide: 100,
            show: 200
        });
    };


    /* Metodo provisional para la obtención de subtablas vía ajax */
    var getTable = function(elm, url, events){
        var acc = $(elm).closest('.acc');
        var acc_content = acc.find($(elm).attr('href'));
        if(acc.hasClass('loaded')){
           toggleRow(elm,acc,acc_content);
        }else{
            if(!acc.hasClass('loading')){
                acc.addClass('loading');
                acc_content.css('display','none');
                $(elm).spin('tiny');
                $.ajax({
                    type: "GET",
                    url: url,
                    dataType: "html",
                }).done(function(data){
                    acc_content.html(data);
                    if (events) addAulaEvents(acc);
                }).fail(function(jqXHR, status, error) {
                    acc_content.html('<div class="error-row">' + status + ": " + error+'</div>');
                    //console.log('Error:' + status + " > " + error);
                }).always(function() {
                    $(elm).spin(false);
                    acc.removeClass('loading').addClass('loaded');
                    toggleRow(elm,acc,acc_content);
                });
            }
        }
    };

    /* Initialize application */
    var init = function(role, session, _idp) {
        userRole = role;
        s = session;
        idp = _idp;

        switch (userRole){
            case 'aula':
                addSubjectEvents($('#block-aula'));
                break;
            case 'student':
                setupAccordionStudent();
                setupCalendars();
                break;
            default:
                setupAccordionSubjects();
                setupSortable();
        }

        setupTooltips();
        setupColorpickers();
        setupGlobalAdjusts();
    };

    return { // public
        init: init,
        baseURL: baseURL,
        userRole: userRole,
        s: s,
        idp: idp
    };

}(jQuery));
