App.filter('toShortDate', function () {
 
    return function (t) {
        if (!t || !moment(t).isValid()) {
            return '-';
        } else {
            var year = moment(t).get('year');
            var month = moment(t).get('month') + 1;
            var day = moment(t).get('date');
            
            var newYear = year + 543;
            var thaiYear = [day, month, newYear].join('/');
            
            return thaiYear;
        }
    };
    
});

App.filter('toShortDateTime', function () {

    return function (t) {
        if (!t || !moment(t).isValid()) {
            return '-';
        } else {
            var year = moment(t).get('year');
            var month = moment(t).get('month') + 1;
            var day = moment(t).get('date');

            var minute = moment(t).get('minute');
            var hour = moment(t).get('hour');
            var second = moment(t).get('second');

            var newYear = year + 543;
            var thaiYear = [day, month, newYear].join('/');
            var shortDateTime = thaiYear + ' ' + [hour, minute, second].join(':');
            return shortDateTime;
        }
    };

});

App.filter('toDateTime', function () {
    return function (dt) {
        if (moment(dt).isValid()) {
            return moment(dt).format('LLL');
        } else {
            return '-';
        }
    };
});

App.filter('toLongDate', function () {
    return function (dt) {
        if (moment(dt).isValid()) {
            return moment(dt).format('LLL');
        } else {
            return '-';
        }
    };
});
