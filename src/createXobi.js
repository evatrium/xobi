// utils
export const isObj = thing => Object.prototype.toString.call(thing) === '[object Object]';//thing instanceof Object;
export const isFunc = thing => typeof thing === 'function';
export const def = (s, k, o) => Object.defineProperty(s, k, o);
export const keys = obj => Object.keys(obj);
export const isEmpty = obj => !keys(obj).length;
// state properties can be stored on both objects and functions (static properties)
export const canHaveProps = thing => isObj(thing) || isFunc(thing);
// check for xobi identifier
export const is$xobi = thing => canHaveProps(thing) && thing.$xobi;
const promise = new Promise(resolve => resolve());
// wraps a callback with a debouncer
// delays the execution of the callback until browser micro tasks have completed
// batching multiple notifications into a single update
export const createProcessor = updateComplete => {
  let isProcessing = false;
  return () => {
    if (!isProcessing) isProcessing = promise.then(() => {
      updateComplete();
      isProcessing = false;
    });
    return isProcessing;
  };
};
// merges properties onto a target recursively
export const deepAssign = (target, props) => {
  for (let key in props) {
    canHaveProps(target[key]) && canHaveProps(props[key])
      ? deepAssign(target[key], props[key])
      : (target[key] = props[key]);
  }
  return target;
};
// factory function that creates a subscription
export const Subie = (subs = [], _unsub = it => subs.splice(subs.indexOf(it) >>> 0, 1)) => [
  it => { // subscription
    subs.push(it);
    return () => _unsub(it); // unsubscribe
  }, // notifier
  (...data) => subs.slice().map(f => (f(...data)))
];

// core
// factory function for creating xobi with optional (p)react useHook integration
export const createXobi = useHook => (state, options = {}) => {
  // flag for disabling batched updates
  const noBatch = options.batch === false;
  // storage for changed paths eg: { 'some.nested.prop': true }
  let _paths = {};
  // create pub sub for $onAnyChange,
  const [base_sub, _base_notify] = Subie();
  // notify $onAnyChange listeners if _paths contains changes
  const base_notifier = () => {
    !isEmpty(_paths) && _base_notify(keys(_paths));
    _paths = {};// reset this branch's changed paths after notification
  };
  const base_notify = noBatch ? base_notifier : createProcessor(base_notifier);
  // recursively traverse through nested objects, making them observable
  const xobify = (suspect, _lastPath = '') => {
    // if its already observed then return it
    if (is$xobi(suspect)) return suspect;
    // create pub sub for $onChange
    const [sub, notify] = Subie();
    // notify $onAnyChange listeners if _paths contains changes
    const _notifier = () => {
      const { $xobi: o } = suspect;
      !isEmpty(o.paths) && notify(keys(o.paths));
      o.paths = {}; //reset this branch's changed paths after notification
    };

    // used to identify a xobi object
    const $xobi = { paths: {} }; // and a store to save paths that have changed on this branch
    const $use = useHook && useHook(suspect);
    const $notify = noBatch ? _notifier : createProcessor(_notifier);
    const $onChange = cb => sub(cb);
    const $onAnyChange = cb => base_sub(cb);
    const $merge = update => (isObj(update) && deepAssign(suspect, update), promise);
    const $getState = () => keys(suspect).reduce((acc, curr) => {
      let value = suspect[curr], func = isFunc(value);
      if (is$xobi(value)) {
        // if the property is a function and the function properties are empty,
        if (func && isEmpty(value)) {//then don't include it as a property on the state
        } else acc[curr] = value.$getState();
      } else if (!func) acc[curr] = value;
      return acc;
    }, {});
    const $select = (selections) => {
      const _xobiCopy = {};
      // assign the _xobi items and suspect to the copy
      deepAssign(deepAssign(_xobiCopy, _xobi), suspect);
      // override the $onChange with an anyChange listener
      _xobiCopy.$onChange = (callback) => {
        const [sub, notify] = Subie();
        const _unsub = sub(callback);
        const _mainUnsub = suspect.$onAnyChange((paths = []) => {
          // only notify if the changed path is included in the selections
          [].concat(selections).some(val => paths.includes(val)) && notify(paths);
        }); // return unsubscribe
        return () => (_mainUnsub(), _unsub());
      };
      return _xobiCopy;
    };

    // all items to be added to the suspect as non enumerable properties
    const _xobi = { $xobi, $use, $notify, $onChange, $onAnyChange, $getState, $merge, $select };
    for (let k in _xobi) def(suspect, k, { enumerable: false, value: _xobi[k] });

    // for every other enumerable property on the suspect
    for (let key in suspect) {
      // keep an internal record
      let internal = suspect[key];
      // build the "dot-walk" path to it
      let path = _lastPath + (_lastPath ? '.' : '') + key;
      // if its a function or object, then recursively make it observable
      if (canHaveProps(internal)) xobify(suspect[key], path);
      // define the getter and setter for the property
      def(suspect, key, {
        enumerable: true,
        get: () => internal,
        set(value) {
          if (value === internal) return; // if equal, then dip out of the update
          if (key[0] === '$') return (internal = value); // opt out of triggering change callback
          if (is$xobi(internal) && isObj(value)) return deepAssign(suspect[key], value); // merge updates if object
          internal = value;
          // collect the property paths that have changed
          _paths[path] = suspect.$xobi.paths[path] = true;
          base_notify(); // notify $onAnyChange
          suspect.$notify(); // notify this branch $onChange
        }
      });
    }
    return suspect;
  };
  return xobify(state);
};

/*
  TODO: add to docs - properties must be defined on initialization for change detection to work
 */