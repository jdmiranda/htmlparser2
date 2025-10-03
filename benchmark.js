import { Parser } from "./dist/esm/index.js";
import { performance } from "perf_hooks";

// Generate test HTML documents
function generateSmallHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Small Test Document</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a <strong>small</strong> test document.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</body>
</html>`;
}

function generateLargeHTML(size = 10000) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>Large Test Document</title>
    <meta charset="utf-8">
</head>
<body>`;

    for (let i = 0; i < size; i++) {
        html += `
    <div class="item-${i}" id="id-${i}">
        <h2>Section ${i}</h2>
        <p>This is paragraph ${i} with some <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
            <li>Item 1 in section ${i}</li>
            <li>Item 2 in section ${i}</li>
            <li>Item 3 in section ${i}</li>
        </ul>
    </div>`;
    }

    html += `
</body>
</html>`;
    return html;
}

function generateDeepHTML(depth = 100) {
    let html = `<!DOCTYPE html><html><body>`;
    for (let i = 0; i < depth; i++) {
        html += `<div class="level-${i}">`;
    }
    html += `<p>Deep content</p>`;
    for (let i = 0; i < depth; i++) {
        html += `</div>`;
    }
    html += `</body></html>`;
    return html;
}

function generateShallowHTML(width = 1000) {
    let html = `<!DOCTYPE html><html><body>`;
    for (let i = 0; i < width; i++) {
        html += `<p id="p-${i}">Paragraph ${i}</p>`;
    }
    html += `</body></html>`;
    return html;
}

// Benchmark function
function benchmark(name, html, iterations = 100) {
    const bytes = Buffer.byteLength(html, 'utf8');
    const kb = bytes / 1024;

    // Warmup
    for (let i = 0; i < 10; i++) {
        const parser = new Parser();
        parser.parseComplete(html);
    }

    // Actual benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        const parser = new Parser();
        parser.parseComplete(html);
    }
    const end = performance.now();

    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    const throughputKBps = (kb * iterations) / (totalTime / 1000);
    const throughputMBps = throughputKBps / 1024;
    const parsesPerSec = 1000 / avgTime;

    return {
        name,
        bytes,
        kb: kb.toFixed(2),
        iterations,
        totalTime: totalTime.toFixed(2),
        avgTime: avgTime.toFixed(4),
        throughputKBps: throughputKBps.toFixed(2),
        throughputMBps: throughputMBps.toFixed(2),
        parsesPerSec: parsesPerSec.toFixed(2)
    };
}

// Run benchmarks
console.log("=".repeat(80));
console.log("htmlparser2 Performance Benchmarks");
console.log("=".repeat(80));
console.log();

const results = [];

// Small document
console.log("Running: Small Document Benchmark...");
results.push(benchmark("Small Document (1KB)", generateSmallHTML(), 1000));

// Medium document
console.log("Running: Medium Document Benchmark...");
results.push(benchmark("Medium Document (100KB)", generateLargeHTML(1000), 500));

// Large document
console.log("Running: Large Document Benchmark...");
results.push(benchmark("Large Document (1MB)", generateLargeHTML(10000), 100));

// Very large document
console.log("Running: Very Large Document Benchmark...");
results.push(benchmark("Very Large Document (10MB)", generateLargeHTML(100000), 10));

// Deep tree
console.log("Running: Deep Tree Benchmark...");
results.push(benchmark("Deep Tree (depth=100)", generateDeepHTML(100), 500));

// Very deep tree
console.log("Running: Very Deep Tree Benchmark...");
results.push(benchmark("Very Deep Tree (depth=500)", generateDeepHTML(500), 100));

// Shallow tree
console.log("Running: Shallow Tree Benchmark...");
results.push(benchmark("Shallow Tree (width=1000)", generateShallowHTML(1000), 500));

// Very shallow tree
console.log("Running: Very Shallow Tree Benchmark...");
results.push(benchmark("Very Shallow Tree (width=10000)", generateShallowHTML(10000), 100));

console.log();
console.log("=".repeat(80));
console.log("Results Summary");
console.log("=".repeat(80));
console.log();

// Print table header
console.log(
    String("Test").padEnd(35) + " | " +
    String("Size").padStart(10) + " | " +
    String("Avg (ms)").padStart(10) + " | " +
    String("MB/sec").padStart(10) + " | " +
    String("Parses/s").padStart(10)
);
console.log("-".repeat(80));

// Print results
results.forEach(r => {
    console.log(
        String(r.name).padEnd(35) + " | " +
        String(r.kb + " KB").padStart(10) + " | " +
        String(r.avgTime).padStart(10) + " | " +
        String(r.throughputMBps).padStart(10) + " | " +
        String(r.parsesPerSec).padStart(10)
    );
});

console.log();
console.log("=".repeat(80));
console.log("Performance Characteristics");
console.log("=".repeat(80));
console.log();

// Calculate statistics
const smallDocResult = results[0];
const largeDocResult = results[2];
const deepTreeResult = results[4];
const shallowTreeResult = results[6];

console.log(`Small Document Throughput:     ${smallDocResult.throughputMBps} MB/sec`);
console.log(`Large Document Throughput:     ${largeDocResult.throughputMBps} MB/sec`);
console.log(`Deep Tree Performance:         ${deepTreeResult.avgTime} ms avg`);
console.log(`Shallow Tree Performance:      ${shallowTreeResult.avgTime} ms avg`);
console.log();
console.log(`Peak Throughput:               ${Math.max(...results.map(r => parseFloat(r.throughputMBps))).toFixed(2)} MB/sec`);
console.log(`Peak Parse Rate:               ${Math.max(...results.map(r => parseFloat(r.parsesPerSec))).toFixed(2)} parses/sec`);
console.log();

console.log("=".repeat(80));
console.log("Benchmark complete!");
console.log("=".repeat(80));
