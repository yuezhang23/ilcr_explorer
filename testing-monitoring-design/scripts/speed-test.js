#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const RENDER_BASE_URL = process.env.RENDER_BASE_URL || 'https://your-app-name.onrender.com';
const LOCAL_BASE_URL = 'http://localhost:4000';
const TEST_COUNT = 10; // Number of requests per endpoint for averaging

// Test endpoints
const endpoints = [
    { path: '/api/iclr', method: 'GET', name: 'Get All ICLR Submissions' },
    { path: '/api/iclr/random', method: 'GET', name: 'Get Random Submissions' },
    { path: '/api/iclr/paginated?limit=10&skip=0', method: 'GET', name: 'Get Paginated Submissions' },
    { path: '/api/iclr/ranking/likes/10', method: 'GET', name: 'Get Papers Ranked by Likes' },
    { path: '/api/prompt/all_predictions_by_prompt', method: 'POST', name: 'Get Predictions by Prompt', 
      data: { prompt: "Given the following reviews, determine if a paper would be accepted." } },
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class SpeedTester {
    constructor() {
        this.results = {
            render: {},
            local: {}
        };
    }

    async testEndpoint(baseUrl, endpoint) {
        const results = [];
        const url = `${baseUrl}${endpoint.path}`;
        
        console.log(`\n${colors.cyan}Testing: ${endpoint.name}${colors.reset}`);
        console.log(`${colors.yellow}URL: ${url}${colors.reset}`);
        
        for (let i = 0; i < TEST_COUNT; i++) {
            try {
                const startTime = Date.now();
                
                let response;
                if (endpoint.method === 'GET') {
                    response = await axios.get(url, { timeout: 30000 });
                } else if (endpoint.method === 'POST') {
                    response = await axios.post(url, endpoint.data || {}, { timeout: 30000 });
                }
                
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                results.push({
                    responseTime,
                    statusCode: response.status,
                    success: true
                });
                
                process.stdout.write(`${colors.green}.${colors.reset}`);
                
            } catch (error) {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                results.push({
                    responseTime,
                    statusCode: error.response?.status || 'ERROR',
                    success: false,
                    error: error.message
                });
                
                process.stdout.write(`${colors.red}x${colors.reset}`);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return results;
    }

    calculateStats(results) {
        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);
        
        if (successfulResults.length === 0) {
            return {
                successRate: 0,
                avgResponseTime: 0,
                minResponseTime: 0,
                maxResponseTime: 0,
                p50: 0,
                p95: 0,
                p99: 0,
                errorCount: failedResults.length,
                totalRequests: results.length
            };
        }
        
        const responseTimes = successfulResults.map(r => r.responseTime).sort((a, b) => a - b);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        
        const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
        const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
        const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
        
        return {
            successRate: (successfulResults.length / results.length) * 100,
            avgResponseTime: Math.round(avgResponseTime),
            minResponseTime,
            maxResponseTime,
            p50,
            p95,
            p99,
            errorCount: failedResults.length,
            totalRequests: results.length
        };
    }

    async runTests() {
        console.log(`${colors.bright}🚀 Starting Speed Test for Render Backend${colors.reset}`);
        console.log(`${colors.blue}Render URL: ${RENDER_BASE_URL}${colors.reset}`);
        console.log(`${colors.blue}Local URL: ${LOCAL_BASE_URL}${colors.reset}`);
        console.log(`${colors.blue}Test Count: ${TEST_COUNT} requests per endpoint${colors.reset}\n`);
        
        // Test Render backend
        console.log(`${colors.bright}📊 Testing Render Backend${colors.reset}`);
        for (const endpoint of endpoints) {
            const results = await this.testEndpoint(RENDER_BASE_URL, endpoint);
            this.results.render[endpoint.name] = this.calculateStats(results);
        }
        
        // Test Local backend (if available)
        console.log(`\n\n${colors.bright}📊 Testing Local Backend${colors.reset}`);
        for (const endpoint of endpoints) {
            const results = await this.testEndpoint(LOCAL_BASE_URL, endpoint);
            this.results.local[endpoint.name] = this.calculateStats(results);
        }
        
        this.displayResults();
        this.saveResults();
    }

    displayResults() {
        console.log(`\n\n${colors.bright}📈 SPEED TEST RESULTS${colors.reset}`);
        console.log('='.repeat(80));
        
        for (const endpoint of endpoints) {
            const renderStats = this.results.render[endpoint.name];
            const localStats = this.results.local[endpoint.name];
            
            console.log(`\n${colors.bright}${endpoint.name}${colors.reset}`);
            console.log('-'.repeat(60));
            
            // Render stats
            console.log(`${colors.blue}🌐 Render Backend:${colors.reset}`);
            console.log(`  Success Rate: ${colors.green}${renderStats.successRate.toFixed(1)}%${colors.reset}`);
            console.log(`  Avg Response: ${colors.cyan}${renderStats.avgResponseTime}ms${colors.reset}`);
            console.log(`  P50: ${colors.cyan}${renderStats.p50}ms${colors.reset} | P95: ${colors.cyan}${renderStats.p95}ms${colors.reset} | P99: ${colors.cyan}${renderStats.p99}ms${colors.reset}`);
            console.log(`  Min: ${colors.cyan}${renderStats.minResponseTime}ms${colors.reset} | Max: ${colors.cyan}${renderStats.maxResponseTime}ms${colors.reset}`);
            console.log(`  Errors: ${colors.red}${renderStats.errorCount}/${renderStats.totalRequests}${colors.reset}`);
            
            // Local stats
            console.log(`${colors.blue}💻 Local Backend:${colors.reset}`);
            console.log(`  Success Rate: ${colors.green}${localStats.successRate.toFixed(1)}%${colors.reset}`);
            console.log(`  Avg Response: ${colors.cyan}${localStats.avgResponseTime}ms${colors.reset}`);
            console.log(`  P50: ${colors.cyan}${localStats.p50}ms${colors.reset} | P95: ${colors.cyan}${localStats.p95}ms${colors.reset} | P99: ${colors.cyan}${localStats.p99}ms${colors.reset}`);
            console.log(`  Min: ${colors.cyan}${localStats.minResponseTime}ms${colors.reset} | Max: ${colors.cyan}${localStats.maxResponseTime}ms${colors.reset}`);
            console.log(`  Errors: ${colors.red}${localStats.errorCount}/${localStats.totalRequests}${colors.reset}`);
            
            // Comparison
            if (renderStats.successRate > 0 && localStats.successRate > 0) {
                const speedDiff = renderStats.avgResponseTime - localStats.avgResponseTime;
                const speedDiffPercent = (speedDiff / localStats.avgResponseTime) * 100;
                
                console.log(`${colors.yellow}📊 Comparison:${colors.reset}`);
                if (speedDiff > 0) {
                    console.log(`  Render is ${colors.red}${speedDiffPercent.toFixed(1)}% slower${colors.reset} than local`);
                } else {
                    console.log(`  Render is ${colors.green}${Math.abs(speedDiffPercent).toFixed(1)}% faster${colors.reset} than local`);
                }
            }
        }
    }

    saveResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `speed-test-results-${timestamp}.json`;
        const filepath = path.join(__dirname, filename);
        
        const resultsToSave = {
            timestamp: new Date().toISOString(),
            renderUrl: RENDER_BASE_URL,
            localUrl: LOCAL_BASE_URL,
            testCount: TEST_COUNT,
            results: this.results
        };
        
        fs.writeFileSync(filepath, JSON.stringify(resultsToSave, null, 2));
        console.log(`\n${colors.green}💾 Results saved to: ${filename}${colors.reset}`);
    }
}

// Run the speed test
async function main() {
    try {
        const tester = new SpeedTester();
        await tester.runTests();
    } catch (error) {
        console.error(`${colors.red}Error running speed test:${colors.reset}`, error.message);
        process.exit(1);
    }
}

// Check if script is run directly
if (require.main === module) {
    main();
}

module.exports = SpeedTester;
