const tileItems = ['3-uniform_54', '5-uniform_150.svg'];


// eslint-disable-next-line no-async-promise-executor
export default new Promise(async ($export) => {
  // await anything that needs to be imported
  // await anything that asynchronous
  // finally export the module resolving the Promise
  // as object, function, class, ... anything
  const textures = {};
  for (const tileItem of tileItems) {
    // eslint-disable-next-line no-await-in-loop
    textures[tileItem] = await import(`../../../static`);
  }

  $export(textures);
});
