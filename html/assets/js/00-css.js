function onChangePercentValue2 (type) {
  const inputDom = document.querySelector(`.interaction_form.r${type} .percent_value`)
  const percentDom = document.querySelector(`.box_02 .ring .percent`)
  let value = inputDom.value.replace(/\D/g, '')
  if (!value) {
    inputDom.value = ''
    return
  }
  value = value <= 360 ? value : value  % 360
  inputDom.value = value
  percentDom.innerHTML = `${value}%`
  
  if (value === 360) {
    value = value - 0.01
  }
  const styleDom = document.querySelector('#ringAfterStyle') || document.createElement("style")
  styleDom.id = 'ringAfterStyle'
  let content = `
    .box_02 .ring .right:after {
      transform: rotate(${Math.min(value, 180)}deg);
    }
    .box_02 .ring .left:after {
      transform: rotate(${value > 180 ?  (value - 180) + 'deg' : 0});
    }
  `
  styleDom.innerHTML = content
  document.body.append(styleDom)
}

function onChangePercentValue3 (type) {
  const inputDom = document.querySelector(`.interaction_form.r${type} .percent_value`)
  const ringDom = document.querySelector(`.box_03 .ring`)
  let value = inputDom.value.replace(/\D/g, '')
  if (!value) {
    inputDom.value = ''
    return
  }
  value = value <= 360 ? value : value  % 360
  
  inputDom.value = value
  if (value === 360) {
    value = value - 0.01
  }
  ringDom.style.backgroundImage = `conic-gradient(#e31515 ${value / 360 * 100}%,#13cfe7 ${value / 360 * 100}% 100%)`;
}

