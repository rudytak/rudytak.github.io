class Dot {
    constructor(p, v) {
        this.pos = p; // Position vector
        this.vel = v; // Velocity vector
    }

    update() {
        // Move the dot
        this.pos.add(this.vel);

        this.vel.x -= (1 - drag) * pow(this.vel.x, 2) * Math.sign(this.vel.x);
        this.vel.y -= (1 - drag) * pow(this.vel.y, 2) * Math.sign(this.vel.y);

        /*
                this.pos.x = (this.pos.x + width) % width;
                this.pos.y = (this.pos.y + height) % height;*/

        // Calculate the distance of the point to the mouse
        var distance = dist(this.pos.x, this.pos.y, width * 2 / 4, height / 2);
        if (distance > 50) {
            // Calculate the gravitational force
            var force = (1 + forceMult) * 5000 / ((distance + 25) ** 2);
            // Add the force vector to the velocity vector of the point
            this.vel.add(force * (width * 2 / 4 - this.pos.x) / distance, force * (height / 2 - this.pos.y) / distance);
        }

        return (dist(this.pos.x, this.pos.y, width / 2, height / 2));
    }

    draw() {
        push();
        stroke(0, 184, 255, 96); // Color
        strokeWeight(5); // Size
        point(this.pos.x, this.pos.y); // Draw the point
        pop();
    }
}