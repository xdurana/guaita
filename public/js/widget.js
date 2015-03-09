var $j = jQuery.noConflict();

$j(document).ready(function() {
    
    $j("a[href*='webapps/aulaca']").each(function() {
        var url = this.href.split('#');
        url[0] = url[0] + '&javascriptDisabled=false';
        this.href = url.join('#');
    });

    var refresca = function() {

        $j("a[data-bocamoll-object-resourceid]").each(function() {

            var element = $j(this);

            var subjectid = $j(element).data('bocamoll-subject-id');
            var classroomid= $j(element).data('bocamoll-classroom-id');
            var resourceid = $j(element).data('bocamoll-object-resourceid');

            $j.ajax({
                url: aulaca
                        + '/LoadResource.action?sectionId=-1&pageSize=0&pageCount=0'
                        + '&s=' + SESSION
                        + '&classroomId=' + classroomid
                        + '&subjectId=' + subjectid
                        + '&resourceId=' + resourceid,

                success: function(data) {

                    var num_msg_pendents = Math.max(data.resource.newItems, 0);
                    var num_msg_totals = data.resource.totalItems;
                    var num_msg_pendents_class = num_msg_pendents > 0 ? 'nous' : 'nous cap';
                    pendents += num_msg_pendents;
                    $j("#pendents").text(pendents);

                    if (num_msg_totals > 0) {
                        $j(element).append(
                                        '<span class="marcadors">'
                                        + '<span title=' + missatges_nous + ' class="' + num_msg_pendents_class + '">' + num_msg_pendents + '</span>'
                                        + '<span class="amagar">' + missatges_nous_de + '</span>'
                                        + '<span title="' + missatges_totals + '" class="total">' + num_msg_totals + '</span>'
                                        + '</a>'
                        );
                    }
                }
            });
        });                    
    }

    var pendents = 0;
    $j("#pendents").text(pendents);

    if (maximized) {
        $j("#divMaximizedPartMov").hide();
    }

    refresca();
    setInterval(refresca, 1000 * 60 * 5);
});