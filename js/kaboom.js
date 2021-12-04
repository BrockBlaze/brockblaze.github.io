import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs";

kaboom ({
    global: true,
    width: 540,
    height: 304,
    scale: 2,
    debug: true,
    clearColor: [0,0,0,1],
})

loadRoot('../images/gameImages/')
loadSprite('bg1', 'gameBG.png')
loadSprite('hero', 'Hero.png')
loadSprite('block', 'block1.png')


scene("game", () => {
    
    const player = add([
        sprite('hero'),
        pos(30, 100),
        area(),
        body(),
        origin('bot')
    ])

    const map = [
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '=======                           ',
        '                                  ',
        '                                  ',
        '                                  ',
        '                                  ',
        '        ====                      ',
        '                                  ',
        '                                  ',
        '                                  ',
        '=================================='
    ]

    const levelCfg = {
        width: 16,
        height: 16,
        '=': [sprite('block', solid(), area())]
    }

    const gameLevel = addLevel(map, levelCfg)

    add([
        rect(width(), 48),
        pos(0, height()),
        origin('bot'),
        area(),
        solid(),
        color(127, 200, 255),
    ]);
    

    // add([sprite('bg1'), layer('bg'), scale(0.3)])
});

start("game");