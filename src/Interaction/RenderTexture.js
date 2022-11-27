import bezier from "bezier-easing";
import * as THREE from "three";

const customEase = bezier(0.08, 0.9, 0.83, 1.08);

export default class RenderTexture {
  constructor(falloff = true, id = "touchTexture") {
    this.size = 64;
    this.maxAge = 40;
    this.agingRate = 0.25;
    this.radius = 0.15 * 3;
    this.trail = [];
    this.falloff = falloff;
    this.id = id;

    this.initTexture();
  }

  initTexture() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.canvas.id = this.id;
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new THREE.Texture(this.canvas);

    this.canvas.style.width =
      this.canvas.style.height = `${this.canvas.width}px`;

    if (!this.falloff) {
      const dataURL = localStorage.getItem("WATER_TEX");
      const img = new Image();
      img.src = dataURL;
      img.onload = () => {
        if (this.ctx) return this.ctx.drawImage(img, 0, 0);
        // fallback if context not ready yet
        let loadTexInterval = setInterval(() => {
          if (this.ctx) {
            this.ctx.drawImage(img, 0, 0);
            clearInterval(loadTexInterval);
          }
        }, 100);
      };
    }
  }

  update() {
    if (this.falloff) {
      this.clear();
    } else {
      localStorage.setItem("WATER_TEX", this.canvas.toDataURL());
    }

    // age points
    this.trail.forEach((point, i) => {
      if (!this.falloff) return;
      point.age += this.agingRate;
      if (point.age > this.maxAge) this.trail.splice(i, 1); // remove
    });

    this.trail.forEach((point, i) => {
      this.drawTouch(point);
    });

    this.texture.needsUpdate = true;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.falloff) localStorage.setItem("WATER_TEX", "");
  }

  addTouch(point) {
    let force = 0;
    const last = this.trail[this.trail.length - 1];
    if (last) {
      const dx = last.x - point.x;
      const dy = last.y - point.y;
      const dd = dx * dx + dy * dy;
      force = Math.min(dd * 10000, 1);
    }
    if (!this.falloff) force = 1;
    this.trail.push({ x: point.x, y: point.y, age: 0, force });
  }

  drawTouch(point) {
    const pos = {
      x: point.x * this.size,
      y: (1 - point.y) * this.size,
    };

    if (this.falloff) {
      let intensity = 0.5;
      // if (point.age < this.maxAge * 0.3) {
      // 	// TODO; very strong falloff here
      // 	intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, easingChange);
      // } else {
      // 	// TODO; much weaker falloff here
      // 	intensity = easeOutSine(1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7), 0, easingChange);
      // }
      intensity *= 1 - customEase(point.age / this.maxAge);

      intensity *= point.force;

      let radius = this.size * this.radius * intensity;
      radius = Math.max(radius, 0);
      if (isNaN(radius)) return;
      const grd = this.ctx.createRadialGradient(
        pos.x,
        pos.y,
        radius * 0.25,
        pos.x,
        pos.y,
        radius
      );
      grd.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
      grd.addColorStop(1, "rgba(0, 0, 0, 0.0)");

      this.ctx.beginPath();
      this.ctx.fillStyle = grd;
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      let radius = 5;

      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
