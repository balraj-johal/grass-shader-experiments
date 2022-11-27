import bezier from "bezier-easing";
import * as THREE from "three";

const easingDuration = 4;
const easingChange = 1; // ?
const easeOutSine = (t, b, c) => {
  return c * Math.sin((t / easingDuration) * (Math.PI / 2)) + b;
};
const easeInOutQuad = (t, b, c) => {
  t /= easingDuration / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};
// const easeInOutSine = (t, b, c) => {
// 	return -c / 2 * (Math.cos(Math.PI * t / easingDuration) - 1) + b;
// };
const customEase = bezier(0.08, 0.9, 0.83, 1.08);

export default class RenderTexture {
  constructor(parent, falloff = true) {
    this.parent = parent;
    this.size = 64;
    this.maxAge = 40;
    this.agingRate = 0.25;
    this.radius = 0.15 * 3;
    this.trail = [];
    this.falloff = falloff;

    this.initTexture();
  }

  initTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new THREE.Texture(this.canvas);

    this.canvas.id = "touchTexture";
    this.canvas.style.width =
      this.canvas.style.height = `${this.canvas.width}px`;
  }

  update(delta) {
    if (this.falloff) this.clear();

    // age points
    this.trail.forEach((point, i) => {
      if (!this.falloff) return;
      point.age += this.agingRate;
      // remove old
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else if (point.age < this.maxAge / 3) {
        // point.age += this.agingRate;
      } else {
        // point.age += this.agingRate / 3;
      }
    });

    this.trail.forEach((point, i) => {
      this.drawTouch(point);
    });

    this.texture.needsUpdate = true;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
      let radius = 1;

      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
