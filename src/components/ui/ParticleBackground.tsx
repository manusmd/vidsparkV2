import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  pulseSpeed: number;
  pulseSize: number;
  baseSize: number;
  angle: number;
  rotationSpeed: number;
}

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);
  const mousePosition = useRef({ x: 0, y: 0 });
  const time = useRef(0);

  const colors = [
    { r: 139, g: 92, b: 246 },   // Purple
    { r: 59, g: 130, b: 246 },   // Blue
    { r: 236, g: 72, b: 153 },   // Pink
    { r: 124, g: 58, b: 237 },   // Indigo
    { r: 45, g: 212, b: 191 },   // Teal
  ];

  const createParticle = (canvas: HTMLCanvasElement): Particle => {
    const baseSize = Math.random() * 3 + 2;
    const colorIndex = Math.floor(Math.random() * colors.length);
    const { r, g, b } = colors[colorIndex];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: baseSize,
      baseSize: baseSize,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.4,
      color: `rgba(${r}, ${g}, ${b}, 1)`, // Full opacity for base color
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseSize: Math.random() * 1 + 0.5,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.angle);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
    const baseColor = particle.color.match(/\d+/g);
    if (!baseColor) return;
    
    const opacity = particle.opacity * 2; // Double the opacity
    gradient.addColorStop(0, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${opacity})`);
    gradient.addColorStop(1, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0)`);

    ctx.beginPath();
    ctx.fillStyle = gradient;
    
    // Draw a more complex shape
    const points = 5;
    const innerRadius = particle.size * 0.5;
    const outerRadius = particle.size;

    ctx.moveTo(0, -outerRadius);
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / points) * i;
      ctx.lineTo(Math.sin(angle) * radius, -Math.cos(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const connectParticles = (ctx: CanvasRenderingContext2D, particles: Particle[], mouseX: number, mouseY: number) => {
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const opacity = (1 - distance / 150);
          const gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y,
            particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, `rgba(147, 51, 234, ${opacity})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, ${opacity})`);

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Connect particles to mouse position with a max distance
      const dxMouse = particles[i].x - mouseX;
      const dyMouse = particles[i].y - mouseY;
      const mouseDistance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (mouseDistance < 200) {
        const opacity = (1 - mouseDistance / 200);
        const gradient = ctx.createLinearGradient(
          particles[i].x, particles[i].y,
          mouseX, mouseY
        );
        gradient.addColorStop(0, `rgba(236, 72, 153, ${opacity})`);
        gradient.addColorStop(1, `rgba(147, 51, 234, ${opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });

    if (!canvas || !ctx) return;

    time.current += 0.01;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'screen';

    particles.current.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Bounce off edges
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

      // Pulsing size effect
      particle.size = particle.baseSize + Math.sin(time.current * particle.pulseSpeed) * particle.pulseSize;
      
      // Rotation
      particle.angle += particle.rotationSpeed;

      drawParticle(ctx, particle);
    });

    connectParticles(ctx, particles.current, mousePosition.current.x, mousePosition.current.y);
    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      particles.current = Array.from({ length: 100 }, () => createParticle(canvas));
    };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
}; 