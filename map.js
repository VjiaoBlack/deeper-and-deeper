const tileWidth = 16;


        // 30 is raw                             1
        // 10 is metal, 20 21 28 29              4
        // 34 is silicon, 36 37 44 45            3
        // 15 is water, 4 5 12 13                2

const tileCodes = {
    DIRT: 1,
    WATER: 2,
    SILICON: 3,
    METAL: 4,

    SOLAR_PANEL: 9,
    TERRARIUM: 10,

    MINING_FOCUS: 17,
};

export {
    tileWidth,
    tileCodes
}