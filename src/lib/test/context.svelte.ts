import { setContext, getContext } from "svelte";

interface CounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

class CounterStateClass implements CounterState {

    count: number = $state(0);
    constructor() {
        this.count = 0;
    }
    increment = () => {
        this.count += 1;
    }

    decrement = () => {
        this.count -= 1;
    }

    reset = () => {
        this.count = 0;
    }
}

const DEFAULT_KEY = "default";

export const getCounterState = (key: string = DEFAULT_KEY): CounterState => { return getContext<CounterState>(key) };


export const setCounterState = (key: string = DEFAULT_KEY) => {
    const state = new CounterStateClass();
    return setContext<CounterState>(key, state);
};