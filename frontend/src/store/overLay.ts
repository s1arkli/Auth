import {create} from 'zustand'

interface State {
    isOpen: boolean,//蒙层开关，true=开，false=关
    type: "login" | "register",//蒙层类型

    open: () => void,
    close: () => void,
    setType: (type: "login" | "register") => void,
}

export const useOverlayStore = create<State>()(
    (set) => ({
            isOpen: false,
            type: "login",

            open: () => set({isOpen: true}),
            close: () => set({isOpen: false}),

            setType: (type) => set({type: type}),
        }
    ))