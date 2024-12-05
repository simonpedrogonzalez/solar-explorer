let globalState = {
    selected: {
        bodies: [],
        missions: [],
    },
};

let listeners = [];

export const SELECTION_TYPES = {
    BODY: 'BODY',
    MISSION: 'MISSION',
}

class Listener{
    constructor(func, selectionType){
        this.id = Date.now().toString();
        this.function = func;
        this.selectionType = selectionType;
    }
    notify(d, isSelected){
        this.function(d, isSelected);
    }
}


const getSelectionByType = (selectionType) => {
    switch (selectionType) {
        case SELECTION_TYPES.BODY:
            return globalState.selected.bodies;
        case SELECTION_TYPES.MISSION:
            return globalState.selected.missions;
        default:
            throw new Error('Invalid selection type');
    }
}

const getListenerByType = (selectionType) => {
    return listeners.filter(l => l.selectionType === selectionType);
}

export const suscribeToObjectSelection = (listener, selectionType) => {
    listener = new Listener(listener, selectionType);
    listeners.push(listener);
    return listener.id;
}

export const notifyAllToListener = (listenerID) => {
    const listener = listeners.find(l => l.id === listenerID);
    if (!listener) throw new Error('Listener not found: ' + listenerID);
    let selection = getSelectionByType(listener.selectionType);
    selection.forEach(d => listener.notify(d, true));
}

export const updateObjectSelection = (d, selectionType) => {
    let arrayOfSelected;
    if (selectionType === SELECTION_TYPES.BODY) {
        arrayOfSelected = globalState.selected.bodies;
    } else if (selectionType === SELECTION_TYPES.MISSION) {
        arrayOfSelected = globalState.selected.missions;
    } else {
        throw new Error('Invalid selection type');
    }

    const index = arrayOfSelected.indexOf(d);
    const wasSelected = index > -1;
    const isSelected = !wasSelected;
    if (wasSelected) {
        arrayOfSelected.splice(index, 1);
    } else {
        arrayOfSelected.push(d);
    }
    console.log(arrayOfSelected.map(d => d.name));

    let listeners = getListenerByType(selectionType);
    listeners.forEach(l => l.notify(d, isSelected));
}

export const clearSelection = () => {
    globalState.selected.bodies = [];
    globalState.selected.missions = [];
}

export const isObjectSelected = (d, selectionType) => {
    let arrayOfSelected = getSelectionByType(selectionType);
    if (arrayOfSelected.includes(d)) {
        console.log(d.name + " is selected");
    }
    return arrayOfSelected.includes(d);
}
