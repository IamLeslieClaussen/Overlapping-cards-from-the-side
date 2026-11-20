import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

const cards = document.querySelectorAll(".spotlight-cards .card");
const totalCards = cards.length;
const transition = totalCards - 1;
const segmentSize = 1 / transition;

const cardYOffset = -4;
const cardScaleStep = 0.035;
const cardEnterRotation = 50;
const isMobile = window.matchMedia("(max-width: 1000px)").matches;
const cardEnterX = isMobile ? 250 : 350;

function getEnterDirection(i) {
    return i % 2 === 1 ? 1 : -1;
}

cards.forEach((card, i) => {
    if(i === 0) {
        gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            scale: 1,
            rotation: 0,
        });
    } else {
        const dir = getEnterDirection(i);
        gsap.set(card, {
            xPercent: -50 + cardEnterX * dir, 
            yPercent: -50,
            rotation: cardEnterRotation * dir,
            scale: 1
        });
    }
});

ScrollTrigger.create({
    trigger: ".spotlight",
    start: "top top",
    end:`+=${window.innerHeight * 8}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    onUpdate: (self) => {
        const progress = self.progress

        const activeTransition = Math.min(
            Math.floor(progress / segmentSize),
            transition - 1,
        );
        const segProgress =
        (progress - activeTransition * segmentSize) / segmentSize;

        const enteringIndex = activeTransition + 1;

        cards.forEach((card, i) => {
            if(i > enteringIndex) {
                const dir = getEnterDirection(i);
                gsap.set(card, {
                    xPercent: -50 + cardEnterX * dir,
                    yPercent: -50,
                    rotation: cardEnterRotation * dir, 
                    scale: 1,
                });
              } else if (i === enteringIndex) {
                const dir = getEnterDirection(i);
                const enterProgress = gsap.parseEase("power2.out")(segProgress);
                gsap.set(card, {
                    xPercent: gsap.utils.interpolate(
                        -50 + cardEnterX * dir,
                        -50,
                        enterProgress,
                    ),
                    yPercent: -50, 
                    rotation: gsap.utils.interpolate(
                        cardEnterRotation * dir,
                        0,
                        enterProgress,
                    ),
                    scale: 1,
                });
              } else {
                const baseBehind = activeTransition -1;

                const delayedSeg = gsap.utils.clamp(0, 1, (segProgress - 0.3) / 0.7);
                const easedSeg = gsap.parseEase("power2.out")(delayedSeg);

                const currentBehind = baseBehind + easedSeg;
                const currentYBehind = currentBehind * cardYOffset;
                const currentScale = 1 - currentBehind * cardScaleStep;

                gsap.set(card, {
                    xPercent: -50,
                    yPercent: -50 + currentYBehind, 
                    rotation: 0,
                    scale: currentScale,
                })
              }
        })
    }

})