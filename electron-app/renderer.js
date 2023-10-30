function onClickToIndex2 () {
  const a = document.querySelector('a')
  a.addEventListener('click', () => {
    window.myAPI.myLoadFile('index2.html')
  })
}
onClickToIndex2()