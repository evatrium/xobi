const connect = suspect => selections => Child => {
    let useAnyChange = selections === true;
    function C() {
        this.componentWillUnmount = (
            !useAnyChange && selections ? suspect.$select(selections) : suspect
        )[useAnyChange ? '$onAnyChange' : '$onChange'](() => this.setState(newObj()));
        this.render = () => h(Child, this.props, this.props.children);
    }
    return (C.prototype = new Component()).constructor = C;
};


/* possible solution for connect function

const connect = (component) => (props) => {

    const state = $state.$use();

    return h(component, {...props, ...state });
};

*/

/* // old test


 it('$connect updates the component when state changes, batching multiple subsequent updates together', async () => {

        const state = xobi({count: 0});

        const rendered = jest.fn();

        const Counter = state.$connect()(class extends Component {
            render() {
                rendered();
                return (
                    <div>
                        <h1>{state.count}</h1>
                        <button onClick={() => state.count++}>inc</button>
                    </div>
                )
            }
        });

        const context = mount(<Counter/>);

        const h1 = () => context.find('h1'),
            button = () => context.find('button');

        expect(rendered).toBeCalledTimes(1);

        expect(h1().text()).toBe('0');

        button().simulate('click');
        button().simulate('click');
        button().simulate('click');
        button().simulate('click');
        button().simulate('click');

        await until();

        expect(h1().text()).toBe('5');
        expect(rendered).toBeCalledTimes(2);

        state.count++;
        state.count++;
        state.count++;
        state.count++;
        state.count++;

        await until();

        expect(h1().text()).toBe('10');
        expect(rendered).toBeCalledTimes(3);

    })

 */