document.addEventListener('DOMContentLoaded', function() {
    const movingLion = document.querySelector('#moving-lion');
    const movingElephant = document.querySelector('#moving-elephant');
    const movingGiraffe = document.querySelector('#moving-giraffe');
    const movingMonkey = document.querySelector('#moving-monkey');
    const movingBird = document.querySelector('#moving-bird');

    let lionPosition = -200;
    let elephantPosition = -400;
    let giraffePosition = -600;
    let monkeyPosition = -800;
    let birdPosition = -100;

    let lastScrollY = window.scrollY;

    movingLion.animate([
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' },
        { transform: 'scale(1.1)', filter: 'drop-shadow(5px 5px 12px rgba(0,0,0,0.9))' },
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' }
    ], {
        duration: 2000,
        iterations: Infinity,
        easing: 'ease-in-out',
        delay: 0
    });

    movingElephant.animate([
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' },
        { transform: 'scale(1.08)', filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.8))' },
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' }
    ], {
        duration: 2500,
        iterations: Infinity,
        easing: 'ease-in-out',
        delay: 400
    });

    movingGiraffe.animate([
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' },
        { transform: 'scale(1.06)', filter: 'drop-shadow(4px 4px 9px rgba(0,0,0,0.8))' },
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' }
    ], {
        duration: 3000,
        iterations: Infinity,
        easing: 'ease-in-out',
        delay: 800
    });

    movingMonkey.animate([
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' },
        { transform: 'scale(1.12)', filter: 'drop-shadow(6px 6px 14px rgba(0,0,0,1.0))' },
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' }
    ], {
        duration: 1500,
        iterations: Infinity,
        easing: 'ease-in-out',
        delay: 1200
    });

    movingBird.animate([
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' },
        { transform: 'scale(1.15)', filter: 'drop-shadow(7px 7px 16px rgba(0,0,0,1.1))' },
        { transform: 'scale(1)', filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.7))' }
    ], {
        duration: 1800,
        iterations: Infinity,
        easing: 'ease-in-out',
        delay: 600
    });

    function updateAnimalPositionsOnScroll() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;
                
        if (scrollDelta > 0) {
            lionPosition += 16;
            elephantPosition += 12;
            giraffePosition += 10;
            monkeyPosition += 20;
            birdPosition += 24;
        } else if (scrollDelta < 0) {
            lionPosition -= 16;
            elephantPosition -= 12;
            giraffePosition -= 10;
            monkeyPosition -= 20;
            birdPosition -= 24;
        }

        if (lionPosition > window.innerWidth + 200) lionPosition = -200;
        if (elephantPosition > window.innerWidth + 400) elephantPosition = -400;
        if (giraffePosition > window.innerWidth + 600) giraffePosition = -600;
        if (monkeyPosition > window.innerWidth + 800) monkeyPosition = -800;
        if (birdPosition > window.innerWidth + 100) birdPosition = -100;
                
        if (lionPosition < -300) lionPosition = window.innerWidth + 100;
        if (elephantPosition < -500) elephantPosition = window.innerWidth + 300;
        if (giraffePosition < -700) giraffePosition = window.innerWidth + 500;
        if (monkeyPosition < -900) monkeyPosition = window.innerWidth + 700;
        if (birdPosition < -200) birdPosition = window.innerWidth;

        movingLion.style.left = `${lionPosition}px`;
        movingElephant.style.left = `${elephantPosition}px`;
        movingGiraffe.style.left = `${giraffePosition}px`;
        movingMonkey.style.left = `${monkeyPosition}px`;
        movingBird.style.left = `${birdPosition}px`;

        movingBird.style.bottom = `${100 + Math.sin(Date.now() * 0.005) * 15}px`;

        lastScrollY = currentScrollY;
        requestAnimationFrame(updateAnimalPositionsOnScroll);
    }

    window.addEventListener('scroll', function() {
        if (!this.scrollAnimationFrame) {
            this.scrollAnimationFrame = requestAnimationFrame(updateAnimalPositionsOnScroll);
        }
    });
});