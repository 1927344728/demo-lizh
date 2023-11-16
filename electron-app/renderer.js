const replaceText = (selector, text) => {
  const element = document.getElementById(selector)
  if (element) {
    element.innerText = text
  }
}
for (const dependency of ['chrome', 'node', 'electron']) {
  replaceText(`${dependency}-version`, versions[dependency]())
}

const funcPing = async () => {
  const response = await window.versions.ping()
  console.log(response)
}
funcPing()

setTimeout(() => {
  location.href = 'https://pbf.winbaoxian.cn/planBook/planBookResult/pages/planbkTemplatev2.html?nw=1&uuid=29bc3ac795ba438686a9d1cf945afe31&theme=healthy'
})