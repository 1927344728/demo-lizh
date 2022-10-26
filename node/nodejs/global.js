
function func () {
  console.log(1)
  const si = setTimeout(() => {
    console.log(2)
  })
  console.log(si)
  console.log(3)
}
func()
console.log(4)
debugger