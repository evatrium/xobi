const isObj = thing => Object.prototype.toString.call(thing) === '[object Object]',

    isFunc = thing => typeof thing === 'function',

    def = (s, k, o) => Object.defineProperty(s, k, o),

    promise = new Promise(resolve => resolve()),

    keys = obj => Object.keys(obj),

    isEmpty = obj => !keys(obj).length,

    processor = (cb, proc = false) => () => (proc || (proc = promise.then(() => (cb(), (proc = false))), proc)),

    deepAssign = (t, p) => (keys(p).map(k => ((isObj(t[k]) && isObj(p[k])) ? deepAssign(t[k], p[k]) : t[k] = p[k])), t),

    Subie = (subs = [], _unsub = it => subs.splice(subs.indexOf(it) >>> 0, 1)) => [
        it => ((subs.push(it), () => _unsub(it))),
        (...data) => subs.slice().map(f => (f(...data)))
    ];

export const createXobi = (connect, use) => state => {

    let _paths = {},

        [base_sub, _base_notify] = Subie(),

        base_notify = processor(() => (!isEmpty(_paths) && _base_notify(keys(_paths)), (_paths = {})));

    const xobify = (suspect, _lastPath = '', [sub, notify] = Subie(), _xobi) => {

        if (suspect.$xobi) return suspect;

        _xobi = {

            $use: use && use(suspect),

            $connect: connect && connect(suspect),

            $xobi: {paths: {}},

            $notify: processor(({$xobi: o} = suspect) => (!isEmpty(o.paths) && notify(keys(o.paths)), (o.paths = {}))),

            $onChange: cb => sub(cb),

            $onAnyChange: cb => base_sub(cb),

            $getState: () => keys(suspect).reduce((acc, curr) =>
                !isFunc(suspect[curr]) ? (acc[curr] = (isObj(suspect[curr]) && suspect[curr].$xobi)
                    ? suspect[curr].$getState() : suspect[curr], acc) : acc, {}),

            $merge: update => (isObj(update) && deepAssign(suspect, update), promise),

            $select: (selections, _xobiCopy = {}) => (

                deepAssign(_xobiCopy, _xobi),

                    deepAssign(_xobiCopy, suspect),

                    _xobiCopy.$onChange = (callback, [sub, notify] = Subie(), _mainUnsub, _unsub) => (

                        (_mainUnsub = suspect.$onAnyChange((paths = []) =>
                            [].concat(selections).some(val => paths.includes(val)) && notify(paths)
                        )),
                            _unsub = sub(callback),

                            () => (_mainUnsub(), _unsub())

                    ), _xobiCopy
            )
        };

        for (let k in _xobi) def(suspect, k, {enumerable: false, value: _xobi[k]});

        for (let key in suspect) {

            let internal = suspect[key], path = _lastPath + (_lastPath ? '.' : '') + key;

            if (isObj(internal)) xobify(suspect[key], path);

            def(suspect, key, {
                enumerable: true,
                get: () => internal,
                set(value) {

                    if (value === internal) return;

                    if (key[0] === '$') return (internal = value);

                    if (isObj(internal) && internal.$xobi && isObj(value)) return deepAssign(suspect[key], value);

                    internal = value;

                    _paths[path] = suspect.$xobi.paths[path] = true;

                    base_notify();

                    suspect.$notify();
                }
            });
        }
        return suspect
    };
    return xobify(state);
};



