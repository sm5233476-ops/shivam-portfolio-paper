gsap.fromTo(words, 
      {
        opacity: 0,
        y: "115%"
      },
      {
        opacity: 1,
        y: "0%",
        duration: 0.8,
        ease: "power3.out",
        stagger: staggerTime,
        scrollTrigger: typeof ScrollTrigger !== 'undefined' ? {
          trigger: target,
          start: "top 85%",
          once: true
        } : null,
        onComplete: () => {
          gsap.set(words, { clearProps: "transform,opacity" });
        }
      }
    );
