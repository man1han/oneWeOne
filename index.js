const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.098

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/twoTrees.png'
})

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/wizard/Idle.png',
    framesMax: 6,
    scale: 2.2,
    offset: {
        x: 180,
        y: 161
    },
    sprites: {
        idle: {
            imageSrc: './assets/wizard/Idle.png',
            framesMax: 6
        },
        run: {
            imageSrc: './assets/wizard/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './assets/wizard/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './assets/wizard/Fall.png',
            framesMax: 2
        }
        ,
        attack1: {
            imageSrc: './assets/wizard/Attack1.png',
            framesMax: 8
        }
        ,
        takeHit: {
            imageSrc: './assets/wizard/Hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './assets/wizard/Death.png',
            framesMax: 7
        }
    },
    attackBox: {
        offset: {
            x: 80,
            y: 50
        },
        width: 170,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 924,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/kenji/Idle.png',
    framesMax: 4,
    scale: 3.2,
    offset: {
        x: 280,
        y: 262
    },
    sprites: {
        idle: {
            imageSrc: './assets/kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './assets/kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './assets/kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './assets/kenji/Fall.png',
            framesMax: 2
        }
        ,
        attack1: {
            imageSrc: './assets/kenji/Attack2.png',
            framesMax: 4
        }
        ,
        takeHit: {
            imageSrc: './assets/kenji/Hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './assets/kenji/Death.png',
            framesMax: 7
        }
    },
    attackBox: {
        offset: {
            x: -220,
            y: 50
        },
        width: 170,
        height: 50
    }
})

console.log(player);


const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.25)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()


    player.velocity.x = 0
    enemy.velocity.x = 0

    if (keys.a.pressed && player.lastKey === 'a' && player.position.x > 0) {
        player.velocity.x = -1
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd' && player.position.x < canvas.width - 100) {
        player.velocity.x = 1
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }
    // Enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && enemy.position.x > 100) {
        enemy.velocity.x = -1
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && enemy.position.x < canvas.width) {
        enemy.velocity.x = 1
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // detect for collision & enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking &&
        player.framesCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // this is where our player gets hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
    ) {

        player.takeHit()
        enemy.isAttacking = false

        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    // if player misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

animate()


window.addEventListener('keydown', (event) => {
    if (!enemy.dead && !player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break

            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break

            case 'w':
                player.velocity.y = -7
                break

            case ' ':
                player.attack()
                break

            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break

            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break

            case 'ArrowUp':
                enemy.velocity.y = -7
                break

            case 'ArrowDown':
                enemy.attack()
                break

        }
    }

    // console.log(event.key)
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break

        case 'a':
            keys.a.pressed = false
            break

        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
})