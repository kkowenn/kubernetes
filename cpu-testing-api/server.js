// server.js
require('dotenv').config();
const express = require('express');
const os = require('os');
const cluster = require('cluster');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

app.use(express.json());

// OpenAPI Specification
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CPU Testing API',
            version: '1.0.0',
            description: 'A RESTful API for testing CPU performance and capabilities'
        },
        servers: [
            {
                url: SERVER_URL,
                description: 'Configured server'
            }
        ]
    },
    apis: ['./server.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Helper function to format numbers
const formatNumber = (num) => Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });

// Helper function for CPU intensive task
function cpuIntensiveTask(durationSeconds) {
    const end = Date.now() + (durationSeconds * 1000);
    let result = 0;
    while (Date.now() < end) {
        result += Math.random() * Math.random();
    }
    return result;
}

// Calculation test function
function calculationLoadTest(iterations) {
    let result = 0;
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
        result += Math.sin(i) * Math.cos(i);
        result *= Math.pow(Math.random(), 2);
        result /= Math.sqrt(Math.abs(result) + 1);
    }
    
    const duration = (Date.now() - startTime) / 1000;
    return {
        result: result,
        duration: duration,
        operationsPerSecond: iterations / duration
    };
}

/**
 * @openapi
 * /api/cpu/info:
 *   get:
 *     summary: Get CPU information
 *     description: Returns basic information about the system's CPU
 *     responses:
 *       200:
 *         description: CPU information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 */
app.get('/api/cpu/info', (req, res) => {
    const loadAvg = os.loadavg();
    res.json({
        message: "Here's your CPU information:",
        details: {
            "Number of cores": os.cpus().length,
            "CPU Model": os.cpus()[0].model,
            "Speed": `${os.cpus()[0].speed / 1000} GHz`,
            "Architecture": os.arch(),
            "Current Load": {
                "Last minute": `${(loadAvg[0] * 100 / os.cpus().length).toFixed(1)}%`,
                "Last 5 minutes": `${(loadAvg[1] * 100 / os.cpus().length).toFixed(1)}%`,
                "Last 15 minutes": `${(loadAvg[2] * 100 / os.cpus().length).toFixed(1)}%`
            }
        }
    });
});

/**
 * @openapi
 * /api/cpu/test:
 *   get:
 *     summary: Run a simple CPU test
 *     description: Runs a 2-second CPU stress test
 *     responses:
 *       200:
 *         description: Test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 */
app.get('/api/cpu/test', (req, res) => {
    const startTime = Date.now();
    const result = cpuIntensiveTask(2);
    const duration = (Date.now() - startTime) / 1000;
    
    res.json({
        message: "Completed a quick 2-second CPU stress test!",
        results: {
            "Test duration": `${duration} seconds`,
            "Cores used": os.cpus().length,
            "Performance note": duration < 2.1 ? 
                "Your CPU handled this test very efficiently!" : 
                "Your CPU took a bit longer than expected."
        }
    });
});

/**
 * @openapi
 * /api/cpu/load:
 *   post:
 *     summary: Run a custom CPU load test
 *     description: Runs a CPU load test with specified duration across all cores
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: number
 *                 description: Test duration in seconds
 *                 default: 5
 *     responses:
 *       200:
 *         description: Load test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 */
app.post('/api/cpu/load', (req, res) => {
    const duration = req.body.duration || 5;
    const startTime = Date.now();
    
    const results = [];
    for (let i = 0; i < os.cpus().length; i++) {
        results.push(cpuIntensiveTask(duration / os.cpus().length));
    }
    const actualDuration = (Date.now() - startTime) / 1000;
    
    res.json({
        message: `Ran a ${duration}-second CPU load test across all cores!`,
        results: {
            "Requested duration": `${duration} seconds`,
            "Actual duration": `${actualDuration} seconds`,
            "Cores stressed": os.cpus().length,
            "Performance": actualDuration <= duration * 1.1 ?
                "Your CPU handled the load well!" :
                "Your CPU struggled a bit with this load."
        }
    });
});

/**
 * @openapi
 * /api/cpu/benchmark:
 *   get:
 *     summary: Run CPU benchmark
 *     description: Runs a comprehensive CPU benchmark with mathematical calculations
 *     responses:
 *       200:
 *         description: Benchmark completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 */
app.get('/api/cpu/benchmark', async (req, res) => {
    const iterations = 1000000;
    const startTime = Date.now();
    
    let result = 0;
    for (let i = 0; i < iterations; i++) {
        result += Math.sqrt(Math.random() * Math.PI);
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const opsPerSecond = iterations / duration;
    const cpuScore = Math.round(opsPerSecond * os.cpus().length);
    
    res.json({
        message: "Completed CPU benchmark test!",
        results: {
            "Operations performed": formatNumber(iterations),
            "Time taken": `${duration} seconds`,
            "Operations per second": formatNumber(opsPerSecond),
            "CPU Score": formatNumber(cpuScore),
            "Performance rating": cpuScore > 1000000 ? 
                "Excellent! Your CPU is very powerful!" :
                cpuScore > 500000 ? 
                "Good! Your CPU handles tasks well." :
                "Fair. Your CPU might struggle with heavy tasks."
        }
    });
});

/**
 * @openapi
 * /api/cpu/calc-test:
 *   post:
 *     summary: Run CPU calculation load test
 *     description: Performs a series of mathematical calculations to test CPU performance
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iterations:
 *                 type: number
 *                 description: Number of calculation iterations
 *                 default: 1000000
 *     responses:
 *       200:
 *         description: Calculation test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     iterations:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     operationsPerSecond:
 *                       type: string
 *                     performanceRating:
 *                       type: string
 */
app.post('/api/cpu/calc-test', (req, res) => {
    const iterations = req.body.iterations || 1000000;
    const testResult = calculationLoadTest(iterations);
    
    res.json({
        message: `Completed CPU calculation test with ${formatNumber(iterations)} iterations!`,
        results: {
            "Iterations performed": formatNumber(iterations),
            "Duration": `${testResult.duration.toFixed(2)} seconds`,
            "Operations per second": formatNumber(testResult.operationsPerSecond),
            "Performance rating": testResult.operationsPerSecond > 1000000 ?
                "Outstanding! Your CPU excels at calculations!" :
                testResult.operationsPerSecond > 500000 ?
                "Great! Your CPU handles calculations well." :
                "Average. Your CPU might need more power for heavy calculations."
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Oops! Something went wrong while testing the CPU.",
        suggestion: "Please try again or check your request."
    });
});

// Start server with clustering
if (cluster.isMaster) {
    console.log(`Master process starting ${os.cpus().length} workers...`);
    for (let i = 0; i < os.cpus().length; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} stopped. Starting a new one...`);
        cluster.fork();
    });
} else {
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} running on port ${PORT}`);
        console.log(`Swagger UI available at ${SERVER_URL}/api-docs`);
    });
}

module.exports = app;