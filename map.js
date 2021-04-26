const tileWidth = 16;

const MINING_RATE = 5000;

        // 30 is raw                             1
        // 10 is metal, 20 21 28 29              4
        // 34 is silicon, 36 37 44 45            3
        // 15 is water, 4 5 12 13                2

const tileCodes = {
    DIRT: 1,
    WATER: 2,
    SILICON: 3,
    METAL: 4,
};

const buildingCodes = {
    SOLAR_PANEL: 9,
    TERRARIUM: 10,
    APARTMENTS: 11,

    ENERGY_STORAGE: 25,
    WATER_STORAGE: 26,
    SILICON_STORAGE: 27,
    METAL_STORAGE: 28, 
    FOILAGE_STORAGE: 29,
};

const buildingCost = {
    [buildingCodes.SOLAR_PANEL]: {
        silicon: 1,
        energy: 1,
        metal: 1,
    },
    [buildingCodes.TERRARIUM]: {
        metal: 1,
        water: 1,
        energy: 1,
    },
    [buildingCodes.APARTMENTS]: {
        metal: 2,
        energy: 1,
    },

    [buildingCodes.ENERGY_STORAGE]: {
        energy: 1,
        metal: 1,
        silicon: 1,
    },
    [buildingCodes.WATER_STORAGE]: {
        energy: 1,
        metal: 1,
    },
    [buildingCodes.SILICON_STORAGE]: {
        energy: 1,
        metal: 1,
    },
    [buildingCodes.METAL_STORAGE]: {
        energy: 1,
        metal: 1,
    }, 
    [buildingCodes.FOILAGE_STORAGE]: {
        energy: 1,
        metal: 1,
        water: 1,
    },
}

const buildingResourceUse = {
    [buildingCodes.SOLAR_PANEL]: {
        water: 0.2,
    },
    [buildingCodes.TERRARIUM]: {
        water: 0.5,
        energy: 0.5,
    },
    [buildingCodes.APARTMENTS]: {
        energy: 0.5,
        water: 0.5,
        foilage: 0.5,
    },

    [buildingCodes.ENERGY_STORAGE]: {},
    [buildingCodes.WATER_STORAGE]: {
        energy: 0.2,
    },
    [buildingCodes.SILICON_STORAGE]: {},
    [buildingCodes.METAL_STORAGE]: {}, 
    [buildingCodes.FOILAGE_STORAGE]: {
        energy: 0.5,
        water: 0.2
    },
}

const buildingResourceGain = {
    [buildingCodes.SOLAR_PANEL]: {
        energy: 0.5,
    },
    [buildingCodes.TERRARIUM]: {
        foilage: 0.5,
    },
    [buildingCodes.APARTMENTS]: {
    },

    [buildingCodes.ENERGY_STORAGE]: {},
    [buildingCodes.WATER_STORAGE]: {
    },
    [buildingCodes.SILICON_STORAGE]: {},
    [buildingCodes.METAL_STORAGE]: {}, 
    [buildingCodes.FOILAGE_STORAGE]: {
    },
}

const effectCodes = {
    MINING_FOCUS: 17,
};


export {
    tileWidth,
    tileCodes,
    buildingCodes,
    effectCodes,

    buildingCost,
    buildingResourceUse,
    buildingResourceGain,

    MINING_RATE
}