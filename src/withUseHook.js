export const withUseHook = (createXobi, useCallback, useEffect, useRef, useState) => {

  const newObj = () => Object.create(null);
  //eslint-disable-next-line react-hooks/rules-of-hooks
  const useForceUpdate = () => {
    const [, set] = useState(newObj());
    return useCallback(() =>{
      set(newObj());
    }, [set]);
  };

  const use = suspect => selections => {

    //eslint-disable-next-line react-hooks/rules-of-hooks
    const forceUpdate = useForceUpdate();
    const useAnyChange = selections === true;
    const isMounted = useRef(true);

    useEffect(() => () => {
      isMounted.current = false;
    }, []);

    useEffect(() => {
      const toBeObserved = !useAnyChange && selections ? suspect.$select(selections) : suspect;

      const subscribe = toBeObserved[useAnyChange ? '$onAnyChange' : '$onChange'];

      const unsubscribe = subscribe(() => isMounted.current && forceUpdate());

      return () => unsubscribe();
    }, []);

    return suspect;
  };

  return createXobi(use);
};