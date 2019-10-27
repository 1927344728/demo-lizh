;
(function() {
    var tpls = window.WY.templates,
        HBS = window.Handlebars;

    HBS.registerHelper('rangeOptions', function(lowVal, highVal, val, placeholder, options) {
        var out = (val === undefined && placeholder) ? '<option disabled selected style="display:none;">' + placeholder + '</option>' : '';

        for (var i = lowVal; i <= highVal; i++) {
            out += '<option value="' + i + '"' +
                (val == i ? ' selected>' : '>') +
                i + (options && options.hash && options.hash.suffix || '') + '</option>';
        }
        return new HBS.SafeString(out);
    });

    HBS.registerHelper('equals', function(val1, val2, options) {
        var condition = options.strict ? val1 === val2 : val1 == val2;

        if (condition) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    HBS.registerPartial({
        genderSel: tpls.partial.genderSel,
        ageSel: tpls.partial.ageSel,
        occupationTypeSel: tpls.partial.occupationTypeSel
    });
})();
