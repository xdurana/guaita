/*  Aulas Student Class */

UOCAulas.Student = (function() {

    /**
     * Setup Colorpickers
     */
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

    /**
     * Setup Calendars
     */
    var setupCalendars = function(){
        UOCAulas.addTabsEvents('.tabs-calendar');
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


    /* Initialize application */
    var init = function() {
        setupAccordionStudent();
        setupColorpickers();
        setupCalendars();
    };

    return { // public
        init: init
    };

}());
