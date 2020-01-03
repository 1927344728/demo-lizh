this["my"] = this["my"] || {};
this["my"]["test"] = this["my"]["test"] || {};
this["my"]["test"]["handleTest1"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<figure>\n		<img src=\""
    + alias4(((helper = (helper = helpers.img || (depth0 != null ? depth0.img : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"img","hash":{},"data":data,"loc":{"start":{"line":4,"column":12},"end":{"line":4,"column":19}}}) : helper)))
    + "\" alt=\"\">\n		<figcaption>"
    + alias4(((helper = (helper = helpers.des || (depth0 != null ? depth0.des : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"des","hash":{},"data":data,"loc":{"start":{"line":5,"column":14},"end":{"line":5,"column":21}}}) : helper)))
    + "</figcaption>\n	</figure>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<div class=\"text_img_content\">\n";
  stack1 = ((helper = (helper = helpers.info || (depth0 != null ? depth0.info : depth0)) != null ? helper : container.hooks.helperMissing),(options={"name":"info","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":1},"end":{"line":7,"column":10}}}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.info) { stack1 = container.hooks.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>";
},"useData":true});