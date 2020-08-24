import {h, Component} from "preact";
import {useCallback, useEffect, useState, useRef} from "preact/hooks";
import {createXobi} from "./createXobi";

let newObj = () => Object.create(null),
    useForceUpdate = ([, set] = useState(newObj())) => useCallback(() => set(newObj()), [set]),
    use = suspect => selections => {
        let fu = useForceUpdate(), useAnyChange = selections === true, isMounted = useRef(true);
        useEffect(() => () => {
            isMounted.current = false;
        }, []);
        useEffect(() => {
            return (!useAnyChange && selections ? suspect.$select(selections) : suspect)[
                useAnyChange ? '$onAnyChange' : '$onChange'](() => isMounted.current && fu())
        }, []);
        return suspect;
    };

export const xobi = createXobi(use);
export default xobi;

