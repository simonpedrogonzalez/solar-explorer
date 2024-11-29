let globalState = {
    selected: {
        bodies: [],
        missions: [],
    },
};

export const SELECTION_TYPES = {
    BODY: 'BODY',
    MISSION: 'MISSION',
}

export const get = () => {
    return globalState;
};

export const updateMissionSelection = (d) => {
    updateObjectSelection(d, 'mission');
}

export const updateBodySelection = (d) => {
    updateObjectSelection(d, 'body');
}

const updateObjectSelection = (d, selectionType) => {
    let arrayOfSelected;
    if (selectionType === 'body') {
        arrayOfSelected = globalState.selected.bodies;
    } else if (selectionType === 'mission') {
        arrayOfSelected = globalState.selected.missions;
    } else {
        throw new Error('Invalid selection type');
    }

    const index = arrayOfSelected.indexOf(d);
    if (index > -1) {
        arrayOfSelected.splice(index, 1);
    } else {
        arrayOfSelected.push(d);
    }
    console.log(arrayOfSelected.map(obj => obj.name));
}

export const isMissionSelected = (d) => {
    return isObjectSelected(d, 'mission');
}

export const isBodySelected = (d) => {
    return isObjectSelected(d, 'body');
}

export const clearSelection = () => {
    globalState.selected.bodies = [];
    globalState.selected.missions = [];
}

export const isObjectSelected = (d, selectionType) => {
    let arrayOfSelected;
    switch (selectionType) {
        case SELECTION_TYPES.BODY:
            arrayOfSelected = globalState.selected.bodies;
            break;
        case SELECTION_TYPES.MISSION:
            arrayOfSelected = globalState.selected.missions;
            break;
        default:
            throw new Error('Global state invalid selection type: ' + selectionType);
    }
    return arrayOfSelected.includes(d);
}
