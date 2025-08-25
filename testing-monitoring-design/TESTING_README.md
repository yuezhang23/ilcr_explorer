# ICLR Backend Testing Suite

This directory contains comprehensive testing tools for measuring the performance of your ICLR Rating backend, whether it's running locally or on Render.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd testing-monitoring-design
npm install
npm install -g artillery
```

### 2. Configure Your Render Backend URL

Edit the `env.example` file and copy it to `.env`:

```bash
cp env.example .env
```

Update the `RENDER_BASE_URL` in `.env` with your actual Render backend URL.

### 3. Run All Tests

```bash
chmod +x scripts/run-all-tests.sh
./scripts/run-all-tests.sh
```

## 🧪 Testing Tools

### 1. Speed Test (`scripts/speed-test.js`)

**Purpose**: Measure response times and success rates for individual endpoints

**Features**:
- Tests multiple endpoints with configurable request counts
- Compares Render vs Local performance
- Generates detailed statistics (P50, P95, P99 percentiles)
- Saves results to JSON files for analysis

**Usage**:
```bash
# Run with default settings
npm run speed-test

# Run with custom Render URL
RENDER_BASE_URL=https://myapp.onrender.com npm run speed-test
```

**Output**: Detailed console report + JSON results file

### 2. Load Test (`load-tests/load-test-render.yml`)

**Purpose**: Simulate multiple users hitting your backend simultaneously

**Features**:
- Progressive load increase (warm-up → ramp-up → sustained → peak → stress → cool-down)
- Realistic user scenarios (paper retrieval, search, predictions)
- Performance thresholds and error rate monitoring
- Detailed metrics by endpoint

**Usage**:
```bash
# Run load test
npm run load-test:render

# Run with custom URL
artillery run load-tests/load-test-render.yml --target https://myapp.onrender.com
```

**Output**: Artillery report with performance metrics

### 3. Health Check

**Purpose**: Quick connectivity and basic performance check

**Features**:
- Basic connectivity test
- Response time measurement
- Quick status check

**Usage**:
```bash
./scripts/run-all-tests.sh --health-only
```

## 📊 Understanding Results

### Speed Test Metrics

- **Success Rate**: Percentage of successful requests
- **Response Times**: Min, Max, Average, P50, P95, P99
- **Error Count**: Number of failed requests
- **Comparison**: Render vs Local performance difference

### Load Test Metrics

- **Throughput**: Requests per second
- **Response Time Percentiles**: P50, P75, P90, P95, P99
- **Error Rate**: Percentage of failed requests
- **Endpoint Performance**: Individual endpoint statistics

### Performance Thresholds

The tests use these thresholds (configurable):

- **Max Error Rate**: 10% (higher tolerance for Render due to cold starts)
- **P95 Response Time**: 3 seconds
- **P99 Response Time**: 8 seconds
- **Max Response Time**: 5 seconds

## 🔧 Configuration

### Environment Variables

Set these in your `.env` file or environment:

```bash
RENDER_BASE_URL=https://your-app-name.onrender.com
LOCAL_BASE_URL=http://localhost:4000
TEST_COUNT=10
TIMEOUT_MS=30000
```

### Customizing Tests

#### Speed Test

Edit `scripts/speed-test.js` to:
- Add/remove endpoints
- Change test counts
- Modify timeout values
- Add custom metrics

#### Load Test

Edit `load-tests/load-test-render.yml` to:
- Adjust load phases
- Modify request scenarios
- Change performance thresholds
- Add custom assertions

## 📈 Interpreting Results

### Good Performance Indicators

- **Success Rate**: > 95%
- **P95 Response Time**: < 3 seconds
- **Error Rate**: < 5%
- **Consistent Performance**: Low variance in response times

### Render-Specific Considerations

- **Cold Start Latency**: First request after inactivity may be slower
- **Geographic Distribution**: Response times vary by user location
- **Resource Scaling**: Performance may vary with load
- **Free Tier Limitations**: May have rate limits or performance caps

### Performance Comparison

Compare Render vs Local to understand:
- **Network Overhead**: Additional latency from internet routing
- **Resource Differences**: CPU/Memory limitations on Render
- **Database Performance**: Connection pooling and query optimization

## 🚨 Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check if Render backend is running
   - Verify URL is correct
   - Check firewall/network settings

2. **High Error Rates**
   - Review backend logs
   - Check database connectivity
   - Verify API endpoint availability

3. **Slow Response Times**
   - Check database query performance
   - Review backend resource usage
   - Consider database indexing

4. **Load Test Failures**
   - Reduce load test intensity
   - Check backend resource limits
   - Verify rate limiting settings

### Debug Mode

Enable detailed logging:

```bash
# Speed test with debug
DEBUG=* npm run speed-test

# Load test with verbose output
artillery run --verbose load-tests/load-test-render.yml
```

## 📋 Test Scenarios

### Speed Test Endpoints

1. **Get All ICLR Submissions** (`/api/iclr`)
2. **Get Random Submissions** (`/api/iclr/random`)
3. **Get Paginated Submissions** (`/api/iclr/paginated`)
4. **Get Papers Ranked by Likes** (`/api/iclr/ranking/likes/10`)
5. **Get Predictions by Prompt** (`/api/prompt/all_predictions_by_prompt`)

### Load Test Scenarios

1. **Health Check** (15% weight)
2. **Paper Retrieval** (25% weight)
3. **Search Operations** (20% weight)
4. **Prediction System** (20% weight)
5. **Mixed Operations** (20% weight)

## 🔄 Continuous Testing

### Automated Testing

Set up regular testing:

```bash
# Add to crontab for daily testing
0 9 * * * cd /path/to/testing-monitoring-design && ./scripts/run-all-tests.sh > results/daily-test-$(date +\%Y\%m\%d).log 2>&1
```

### CI/CD Integration

Add to your GitHub Actions:

```yaml
- name: Run Performance Tests
  run: |
    cd testing-monitoring-design
    npm install
    npm install -g artillery
    ./scripts/run-all-tests.sh
```

## 📚 Additional Resources

- [Artillery Documentation](https://www.artillery.io/docs)
- [Render Performance Best Practices](https://render.com/docs/performance)
- [Node.js Performance Monitoring](https://nodejs.org/en/docs/guides/performance/)
- [Database Query Optimization](https://docs.mongodb.com/manual/core/query-optimization/)

## 🤝 Contributing

To add new testing scenarios or improve existing ones:

1. Fork the repository
2. Create a feature branch
3. Add your tests
4. Update documentation
5. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review backend logs
- Check Render dashboard for resource usage
- Open an issue in the repository
