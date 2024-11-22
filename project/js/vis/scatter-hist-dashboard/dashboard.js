import * as bodySection from './bodySection.js';
import * as missionSection from './missionSection.js';

export const setup = async () => {
    bodySection.setup();
    missionSection.setup();
}