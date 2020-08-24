import {useCallback, useEffect, useState, useRef} from "react";
import {createXobi} from "./createXobi";

let newObj = () => Object.create(null),
    //eslint-disable-next-line react-hooks/rules-of-hooks
    useForceUpdate = ([, set] = useState(newObj())) => useCallback(() => set(newObj()), [set]),
    use = suspect => selections => {
        //eslint-disable-next-line react-hooks/rules-of-hooks
        let fu = useForceUpdate(), useAnyChange = selections === true, isMounted = useRef(true);
        useEffect(() => () => {
            isMounted.current = false;
        }, []);
        useEffect(() => {
            return (!useAnyChange && selections ? suspect.$select(selections) : suspect)[
                useAnyChange ? '$onAnyChange' : '$onChange'](() => isMounted.current && fu());
        }, []);
        return suspect;
    };

export const xobi = createXobi(use);
export default xobi;