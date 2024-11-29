let globalState = {
    selected: {
        bodies: [],
        missions: [],
    },
};

export const getGlobalState = () => {
    return globalState;
};

export const updateGlobalStateObjectSelection = (d, selectionType) => {
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

export const isObjectSelected = (d, selectionType) => {
    let arrayOfSelected;
    if (selectionType === 'body') {
        arrayOfSelected = globalState.selected.bodies;
    } else if (selectionType === 'mission') {
        arrayOfSelected = globalState.selected.missions;
    } else {
        throw new Error('Invalid selection type');
    }
    return arrayOfSelected.includes(d);
}
