class App {
    constructor(params = {}) {
        this.initCanvas();
        this.initPhysics();
        this.initRAF();
        this.updateCanvasSize();
    }

    initCanvas() {
        this.canvas = document.getElementById("index");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener("resize", this.updateCanvasSize.bind(this));
    }

    updateCanvasSize() {
        this.canvas.width = this.canvas.getBoundingClientRect().width;
        this.canvas.height = this.canvas.getBoundingClientRect().height;

        if (this.render) {
            this.render.options.width = this.canvas.width;
            this.render.options.height = this.canvas.height;
        }
    }

    initPhysics() {
        const { Engine, Render, Runner, Bodies, Composite, Composites, World, Mouse, MouseConstraint } = Matter;

        // Create engine and renderer
        this.engine = Engine.create();
        this.render = Render.create({
            element: document.body,
            engine: this.engine,
            canvas: this.canvas,
            options: {
                width: this.canvas.width,
                height: this.canvas.height,
                wireframes: false, 
            }
        });

        // Create large circular boundary
        const globeRadius = 300; 
        const globe = Bodies.circle(this.canvas.width / 2, this.canvas.height / 2, globeRadius, {
            isStatic: true,
            render: {
                fillStyle: 'transparent', 
                strokeStyle: '#000',
                lineWidth: 5
            }
        });

        // Create a stack of small circles 
        const stack = Composites.stack(300, 150, 8, 5, 5, 5, function(x, y) {
            return Bodies.circle(x, y, 25, {
                restitution: 0.8, 
                frictionAir: 0.05, 
                render: {
                    fillStyle: '#6D96A6',
                }
            });
        });

        
        World.add(this.engine.world, [globe, stack]);

        // Add mouse control to shake the circle
        const mouse = Mouse.create(this.render.canvas);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.01,
                render: {
                    visible: false
                }
            }
        });

        World.add(this.engine.world, mouseConstraint);

        // Shake effect
        this.render.canvas.addEventListener('mousemove', (event) => {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            // Apply force to the stack of circles relative to the mouse position
            Composite.translate(stack, {
                x: (mouseX - this.canvas.width / 2) * 0.001, 
                y: (mouseY - this.canvas.height / 2) * 0.001
            });
        });

        // Run the renderer
        Render.run(this.render);

        // Create and run the runner
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);
    }

    initRAF() {
        frame();
    }
}

// Request animation frame logic
function frame() {
    requestAnimationFrame(frame);
}

// Initialize the app
var myApp;

window.onload = function() {
    myApp = new App();
};
