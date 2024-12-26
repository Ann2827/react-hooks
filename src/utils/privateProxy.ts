const privateProxy = <T extends Object>(): ProxyHandler<T> => ({
  get(target, prop) {
    if (typeof prop !== 'string' || prop?.startsWith('_')) {
      throw new Error('Отказано в доступе');
    } else {
      const value = target[prop as keyof Object];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  },
  set(target, prop, val) {
    // console.log('privateProxy Proxy set', target, prop, val);
    // перехватываем запись свойства
    if (typeof prop !== 'string' || prop?.startsWith('_')) {
      throw new Error('Отказано в доступе');
    } else {
      target[prop as keyof Object] = val;
      return true;
    }
  },
  deleteProperty(target, prop) {
    // перехватываем удаление свойства
    if (typeof prop !== 'string' || prop?.startsWith('_')) {
      throw new Error('Отказано в доступе');
    } else {
      delete target[prop as keyof Object];
      return true;
    }
  },
  ownKeys(target) {
    // перехватываем попытку итерации
    return Object.keys(target).filter((key) => !key.startsWith('_'));
  },
});

export default privateProxy;

// Example
// data.time = new Proxy<IData['time']>(data.time, {
//   get(target, prop, _receiver) {
//     return typeof prop === 'string' && prop in target ? target[prop] : 0;
//   },
// });
