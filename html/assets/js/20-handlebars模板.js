var funcs = {
  handlebarsTest1: function () {
    let template = Handlebars.compile(`Hellow, <span>{{text}}</span>`);
    let templateStr = template({
      text: "Handlebars!",
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest2: function () {
    let htmlTemplate = document.querySelector('#html-template').innerHTML
    let template = Handlebars.compile(htmlTemplate);
    let templateStr = template({
      title: "Handlebars!",
      body: "html template body!"
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest3: function () {
    let template = Handlebars.compile(`<p>{{firstname}} {{lastname}}</p>`);
    let templateStr = template({
      firstname: "Yehuda",
      lastname: "Katz"
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest4: function () {
    let template = Handlebars.compile(`{{person.firstname}} {{person.lastname}}`);
    let templateStr = template({
      person: {
        firstname: "Yehuda",
        lastname: "Katz"
      }
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest5: function () {
    let template = Handlebars.compile(`
        {{#with author}}
            <p>Author: <span>{{firstname}} {{lastname}}!</span></p>
        {{/with}}
        {{#each people}}
            <p>{{../prefix}} <span>{{firstname}}</span> </p>
        {{/each}}
      `);
    let templateStr = template({
      people: [
        { firstname: "Nils" },
        { firstname: "Yehuda" },
      ],
      prefix: "Hello, ",
      author: { firstname: "li", lastname: "zhao" }
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest6: function () {
    let template = Handlebars.compile(`<span>{{firstname}} {{uCase lastname}}</span>`);
    Handlebars.registerHelper('uCase', s => s.toUpperCase())
    let templateStr = template({
      firstname: "Yehuda",
      lastname: "Katz"
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest7: function () {
    let template = Handlebars.compile(`{{link (uCase people.name) "Welcome to visit!" href=people.url cssStyle="color: #0aa;"}}`);
    Handlebars.registerHelper('uCase', s => s.toUpperCase())
    Handlebars.registerHelper("link", (n, tx, options) => {
      var name = Handlebars.escapeExpression(n)
      var text = Handlebars.escapeExpression(tx)
      let href = Handlebars.escapeExpression(options.hash.href)
      let cssStyle = Handlebars.escapeExpression(options.hash.cssStyle)
      return new Handlebars.SafeString(`<a style="${cssStyle}" href="${href}">Hellow, ${name}! ${text}</a>`);
    });
    let templateStr = template({
      people: {
        name: 'lizh',
        url: "https://www.baidu.com/"
      }
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest8: function () {
    let template = Handlebars.compile(`
        {{> firstPartial}}
        {{> (lookup . 'partName')}}
      `);
    Handlebars.registerPartial('firstPartial', '<p>Hellow, <span>{{first}}</span></p>');
    Handlebars.registerPartial('secondPartial', '<p>Hellow, <span>{{second}}</span></p>');
    let templateStr = template({
      partName: 'secondPartial',
      first: '我是第一块代码片段。',
      second: '我是第二块代码片段。',
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest9: function () {
    let template = Handlebars.compile(`
        {{> firstPartial myOtherContext }}
        {{#each people}}
          {{> secondPartial prefix=../prefix firstname=firstname lastname=lastname}}
        {{/each}}
      `);
    Handlebars.registerPartial('firstPartial', '<p><span>{{information}}</span></p>');
    Handlebars.registerPartial('secondPartial', '<p><span>{{prefix}}, {{firstname}} {{lastname}}</span></p>');
    let templateStr = template({
      myOtherContext: { information: "Interesting!" },
      people: [
        { firstname: "Nils", lastname: "Knappmeier" },
        { firstname: "Yehuda", lastname: "Katz" }
      ],
      prefix: "Hello"
    })
    console.log(templateStr)
    return templateStr
  },
  handlebarsTest10: function () {
    let template = Handlebars.compile(`
        {{#> firstPartial }}
          <span>sorry, 此代码片段未注册！</span>
        {{/firstPartial}}
        {{#*inline "secondPartial"}}
          <span>{{firstname}}。 这是局部注册的 secondPartial 代码片段！</span>
        {{/inline}}
        {{#each people}}
          <p>Hellow, {{> secondPartial}}</p>
        {{/each}}
      `);
    Handlebars.registerPartial('firstPartial', 'firstPartial： {{> @partial-block }}');
    let templateStr = template({
      people: [
        { firstname: "Nils" },
        { firstname: "Yehuda" },
      ]
    })
    console.log(templateStr)
    return templateStr
  }
}