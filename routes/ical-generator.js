var a = {
    newCalendar: function(events) {
        var cal = {
            domain: 'localhost',
            prodid: '//sebbo.net//ical-generator//EN',

            generated: null,
            events: [],

            methods: {
                setDomain: function(domain) {
                    cal.domain = domain.toString();
                    return cal.methods;
                },
                setProdID: function(id) {
                    if(!id || typeof id !== 'object') {
                        throw 'prodid is not an object.';
                    }
                    if(!id.company) {
                        throw 'prodid.company is a mandatory item.';
                    }
                    if(!id.product) {
                        throw 'prodid.product is a mandatory item.';
                    }
                    id.language = (id.language || 'EN').toUpperCase();

                    cal.prodid = '//' + id.company + '//' + id.product + '//' + id.language;
                    return cal.methods;
                },
                setName: function(name) {
                    cal.name = name.toString();
                    return cal.methods;
                },
                addEvent: function(e) {
                    var _event = {};

                    if(!e || typeof e !== 'object') {
                        throw 'event is not an object.';
                    }

                    // UID
                    _event.uid = e.uid || ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4);

                    // Date Start
                    if(!e.start) {
                        throw 'event.start is a mandatory item.';
                    }
                    _event.start = e.start;

                    // Date Stamp
                    if(e.stamp && Object.prototype.toString.call(e.stamp) != '[object Date]') {
                        throw 'event.stamp must be a Date Object.';
                    }
                    _event.stamp = e.stamp || new Date();

                    // Summary
                    if(!e.summary) {
                        throw 'event.summary is a mandatory item.';
                    }
                    _event.summary = e.summary;

                    // Location
                    _event.location = e.location || null;
                    
                    // Description
                    _event.description = e.description || null;

                    // Organizer
                    _event.organizer = null;
                    if(e.organizer && typeof e.organizer === 'object') {
                        if(!e.organizer.name) {
                            throw 'event.organizer.name is empty.';
                        }
                        if(!e.organizer.email) {
                            throw 'event.organizer.email is empty.';
                        }

                        _event.organizer = {
                            name: e.organizer.name,
                            email: e.organizer.email
                        };
                    }

                    // URL
                    _event.url = e.url || null;

                    cal.generated = null;
                    cal.events.push(_event);
                    return cal.methods;
                },
                generate: function() {
                    var g;

                    var _formatDate = function(d, dateonly) {
                        var pad = function(i) {
                            return (i < 10 ? '0': '') + i;
                        };

                        var s = d.getFullYear();
                        s += pad(d.getMonth() + 1);
                        s += pad(d.getDate());

                        if(!dateonly) {
                            s += 'T';
                            s += pad(d.getHours());
                            s += pad(d.getMinutes());
                            s += pad(d.getSeconds());
                        }

                        return s;
                    };

                    var _escape = function (str) {
                        return str.replace(/[\\;,\n]/g, function (match) {
                            if (match === '\n')
                                return '\\n';

                            return '\\' + match;
                        });
                    }

                    var _getUID = function(e) {
                        return e.start + 'Z-' + e.uid + '@' + cal.domain;
                    };

                    // VCALENDAR and VERSION
                    g = 'BEGIN:VCALENDAR\nVERSION:2.0\r\n';

                    // PRODID
                    g += 'PRODID:-' + cal.prodid + '\r\n';

                    // NAME
                    if (cal.name) {
                        g += 'X-WR-CALNAME:' + cal.name + '\r\n';
                    }

                    // Domain
                    if(!cal.domain) {
                        cal.domain = require("os").hostname() || 'localhost';
                    }

                    // Events
                    cal.events.forEach(function(e) {
                        g += 'BEGIN:VEVENT\r\n';
                        g += 'UID:' + _getUID(e) + '\r\n';
                        g += 'DTSTAMP:' + _formatDate(e.stamp) + '\r\n';
                        g += 'DTSTART;VALUE=DATE:' + e.start + '\r\n';

                        if(e.summary) g += 'SUMMARY:' + _escape(e.summary) + '\r\n';
                        if(e.location) g += 'LOCATION:' + _escape(e.location) + '\r\n';
                        if(e.description) g += 'DESCRIPTION:' + _escape(e.description )+ '\r\n';
                        if(e.organizer) g += 'ORGANIZER;CN="' + e.organizer.name.replace(/\"/g, '\\"') + '":mailto:' + e.organizer.email + '\r\n';
                        if(e.url) g += 'URL;VALUE=URI:' + e.url + '\r\n';

                        g += 'END:VEVENT\r\n';
                    });

                    g += 'END:VCALENDAR';
                    cal.generated = g;

                    return cal.methods;
                },
                save: function(path, cb) {
                    if(!cal.generated) cal.methods.generate();
                    require('fs').writeFile(path, cal.generated, cb || function(){});
                    return cal.methods;
                },
                saveSync: function(path) {
                    if(!cal.generated) cal.methods.generate();
                    return require('fs').writeFileSync(path, cal.generated);
                },
                serve: function(res) {
                    if(!cal.generated) cal.methods.generate();
                    
                    res.writeHead(200, {
                        'Content-Type': 'text/calendar',
                        'Content-Disposition': 'attachment; filename="calendar.ics"'
                    });
                    res.end(cal.generated);
                    return cal.methods;
                },
                toString: function() {
                    if(!cal.generated) cal.methods.generate();
                    return cal.generated;
                },
                clear: function() {
                    cal.events = [];
                    cal.generated = false;
                    return cal.methods;
                }
            }
        };

        return cal.methods;
    }
};

module.exports = a.newCalendar;