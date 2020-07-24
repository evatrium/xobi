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
                useAnyChange ? '$onAnyChange' : '$onChange'](() => isMounted && fu())
        }, []);
        return suspect;
    },
    connect = suspect => selections => Child => {
        let useAnyChange = selections === true;

        function C() {
            this.componentWillUnmount = (
                !useAnyChange && selections ? suspect.$select(selections) : suspect
            )[useAnyChange ? '$onAnyChange' : '$onChange'](() => this.setState(newObj()));
            this.render = () => h(Child, this.props, this.props.children);
        }

        return (C.prototype = new Component()).constructor = C;
    };

export const xobi = createXobi(connect, use);