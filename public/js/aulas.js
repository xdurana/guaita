I18N_EXPAND = typeof(I18N_EXPAND) == 'undefined' ? 'Expandir' : I18N_EXPAND;
I18N_COLLAPSE = typeof(I18N_COLLAPSE) == 'undefined' ? 'Contraer' : I18N_COLLAPSE;

/* Main Aulas Application */

var UOCAulas = (function($) {

    var baseURL = '';
    var userRole = 'student'; // student, pra, consultor, aula
    var s = '';

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
        // TODO: Toda la funcionalidad relativa a la construcción, cambio de calendario, etc  
    };

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

		    var assignatura = $(block).attr('data-guaita-assignatura');
		    var anyacademic = $(block).attr('data-guaita-anyacademic');
		    var domainId = $(block).attr('data-guaita-domainId');
		    var url = UOCAulas.baseURL;
		    if (userRole === 'pra') {
		        url += '/assignatures/' + domainId + '/aules/?s=' + s + '&codAssignatura=' + assignatura + '&anyAcademic=' + anyacademic;
		    } else {
		        url += 'ajax/tabs_consultor.html';
		    }
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

    /* Declaración de eventos tbl-subject por tipo */
    var addSubjectEvents = function(acc){
        addTabsEvents(acc.find('.tabs'));

        $(acc).find('.activ-student-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var domainId = $(block).attr('data-guaita-domainId');
            var domainIdAula = $(block).attr('data-guaita-domainIdAula');
            var URLActivitatsEstudiants = UOCAulas.baseURL + '/assignatures/' + domainId + '/aules/' + domainIdAula + '/activitats?s=' + s;
            getTable(this, URLActivitatsEstudiants, true);
        });

        $(acc).find('.tools-student-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var domainId = $(block).attr('data-guaita-domainId');
            var domainIdAula = $(block).attr('data-guaita-domainIdAula');
            var URLEinesEstudiants = UOCAulas.baseURL + '/assignatures/' + domainId + '/aules/' + domainIdAula + '/eines?s=' + s;
            getTable(this, URLEinesEstudiants, false);
        });

        $(acc).find('.eval-student-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var domainId = $(block).attr('data-guaita-domainId');
            var domainIdAula = $(block).attr('data-guaita-domainIdAula');
            var URLAvaluacioEstudiants = UOCAulas.baseURL + '/assignatures/' + domainId + '/aules/' + domainIdAula + '/avaluacio?s=' + s;
            getTable(this, URLAvaluacioEstudiants, false);
        });

        $(acc).find('.activ-consultor-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            getTable(this, UOCAulas.baseURL + 'ajax/actividades_consultores.html', true);
        });

        $(acc).find('.tools-consultor-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            getTable(this, UOCAulas.baseURL + 'ajax/herramientas_consultores.html', false);
        });

        $(acc).find('.activ-aula-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            var block = $(this).closest('.acc');
            var domainId = $(block).attr('data-guaita-domainId');
            var domainIdAula = $(block).attr('data-guaita-domainIdAula');
            var idpEstudiant = $(block).attr('data-guaita-idp');
            var s = $(block).attr('data-guaita-s');
            var URLActivitatsAula = UOCAulas.baseURL + '/assignatures/' + domainId + '/aules/' + domainIdAula + '/estudiants/' + idpEstudiant + '/activitats?s=' + s;
            getTable(this, URLActivitatsAula, true);
        });

        $(acc).find('.tools-aula-acc .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            getTable(this, UOCAulas.baseURL + 'ajax/herramientas_aula.html', false);
        });
    };

    /* Declaración de eventos tbl-aula */
    var addAulaEvents = function(acc){
        $(acc).find('.activ-item > .lnk-expand').on('click', function(ev) {
            ev.preventDefault();
            if (acc.hasClass('activ-student-acc')) {
                var block = $(this).closest('.acc');
                var domainId = $(block).attr('data-guaita-domainId');
                var domainIdAula = $(block).attr('data-guaita-domainIdAula');
                var eventId = $(block).attr('data-guaita-eventId');
                var URLActivitatsEstudiants = UOCAulas.baseURL + '/assignatures/' + domainId + '/aules/' + domainIdAula + '/activitats/' + eventId + '/eines?s=' + s;
                getTable(this, URLActivitatsEstudiants, false);
            } else {
                getTable(this, UOCAulas.baseURL + 'ajax/actividad_consultores.html', false);
            }
        });
    };

    /* Declaración eventos tabs: jqueryui tab */
    var addTabsEvents = function(tabs) {
        $(tabs).tabs({
            active: 0,
            hide: 100,
            show: 300
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
    var init = function(role, session) {
        userRole = role;
        s = session;

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
        setupGlobalAdjusts();
    };

    return { // public
        init: init,
        baseURL: baseURL,
        userRole: userRole,
        s: s
    };

}(jQuery));
