function genPromise() {
    return Promise.resolve(1)
  }
  const r1 = await genPromise()
  console.log(r1)