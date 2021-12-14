function submitForm(e) {
  alert(0);
  e.preventDefault();
}

function fnExecCommandCopy(str) {
  let inputDom = document.createElement("input");
  document.body.appendChild(inputDom);
  inputDom.value = str;
  inputDom.focus();
  inputDom.select();
  if (document.execCommand("copy")) {
    alert("复制成功");
    console.log("复制成功");
  } else {
    console.log("不支持复制");
  }
  inputDom.blur();
  document.body.removeChild(inputDom);
}
function fnExecCommandPaste() {
  try {
    const inputDom = document.querySelector('#CopyInput')
    inputDom.focus()
    document.execCommand('paste')
    alert("出于安全考虑，浏览器通常不允许 document.execCommand('paste') 访问剪贴板，因为它可能包含敏感信息。")
    console.error("出于安全考虑，浏览器通常不允许 document.execCommand('paste') 访问剪贴板，因为它可能包含敏感信息。")
  } catch (err) {
    console.log(err)
  }
}

function fnWriteTextToClipboard() {
  navigator.clipboard.writeText("霁光浮瓦碧参差。").then((res) => {
    alert('霁光浮瓦碧参差。')
    console.log('writeText：写入成功！')
  }).catch((err) => {
    console.log(err)
  })
}
function fnReadTextToClipboard() {
  navigator.clipboard.readText().then((res) => {
    document.querySelector("#CopyInput").value = res
    console.log(`readText：${res}`)
  }).catch((err) => {
    console.log(err)
  })
}

async function fnWriteToClipboard() {
  const image = await fetch('https://my-files-1259410276.cos.ap-chengdu.myqcloud.com/nice/tupian_27781.png').then(response => response.blob())
  const text = new Blob(['一夕轻雷落万丝，\n霁光浮瓦碧参差。\n有情芍药含春泪，\n无力蔷薇卧晓枝。'], {type: 'text/plain'})
  const data = new ClipboardItem({
    'text/plain': text,
    'image/png': image
  })
  navigator.clipboard.write([data]).then(() => {
    console.log('write：写入成功！')
  }).catch((err) => {
    console.log(err)
  })
}

function fnReadFromClipboard () {
  navigator.clipboard.read().then(data => {
    console.log(`read：读取成功！`)
    data.forEach(item => {
      item.types.forEach(async (type) => {
        let readRes = await item.getType(type)
        switch(type) {
          case 'text/plain': {
            let tx = await readRes.text()
            document.querySelector(".box_08 .content").append(tx)
            console.log(tx)
            break
          }
          case 'image/png': {
            const imgDom = new Image()
            imgDom.src = URL.createObjectURL(readRes)
            imgDom.style.width = '100%'
            document.querySelector(".box_08 .content").append(imgDom)
            console.log(imgDom.src)
            break
          }
          default: {
            console.log('未处理的数据类型!')
            break
          }
        }
      })
    })
  }).catch(err => {
    console.error('无法读取剪贴板: ', err)
  })
}