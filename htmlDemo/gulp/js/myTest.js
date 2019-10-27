this["my"] = this["my"] || {};
this["my"]["test"] = this["my"]["test"] || {};
this["my"]["test"]["handleTest1"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "	<figure class=\"figureTwo\">\r\n		<img src=\""
    + alias3(((helper = (helper = helpers.img || (depth0 != null ? depth0.img : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"img","hash":{},"data":data}) : helper)))
    + "\" alt=\"\">\r\n		<figcaption>"
    + alias3(((helper = (helper = helpers.des || (depth0 != null ? depth0.des : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"des","hash":{},"data":data}) : helper)))
    + "</figcaption>\r\n	</figure>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<div class=\"divLine\">\r\n";
  stack1 = ((helper = (helper = helpers.info || (depth0 != null ? depth0.info : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"info","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0,options) : helper));
  if (!helpers.info) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>	";
},"useData":true});