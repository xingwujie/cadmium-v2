/**
 * Created by Brent on 10/29/2015.
 */

var modelTemplates = {
    default:{
        dependencies: ['Listeners', 'Common'],
        menu: ['Default'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: [],
        modals: []
    },
    acquire:{
        dependencies: ['Listeners', 'Cs', 'Common', 'Create', 'Acquire'],
        menu: ['File', 'Create', 'Algorithms'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['surveillanceScore', 'fireControlScore', 'weaponScore', 'evaluation'],
        modals: []
    },
    vapor: {
        dependencies: ['Listeners', 'Cs', 'Common', 'Create', 'Vapor'],
        menu: ['File', 'Create', 'Vapor'],
        leftUtil: ['Prioritization', 'Scene'],
        rightUtil: ['sensorEditor'],
        footer: [],
        modals: []
    },
    advancedSim: {
        dependencies: ['Listeners', 'Cs', 'Common', 'Create', 'AdvancedSim'],
        menu: ['File', 'Create', 'Simulation'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['clouds'],
        modals: []
    },
    birdsEye: {
        dependencies: ['Listeners', 'Cs', 'Common', 'Create', 'BirdsEye'],
        menu: ['File', 'Create'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['clouds'],
        modals: []
    }
};

