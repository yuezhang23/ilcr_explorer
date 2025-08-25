#!/bin/bash

# ICLR Backend Testing Suite
# This script runs all testing tools for the Render backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RENDER_URL=${RENDER_BASE_URL:-"https://your-app-name.onrender.com"}
LOCAL_URL="http://localhost:4000"
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
RESULTS_DIR="$TEST_DIR/results"

echo -e "${BLUE}🚀 ICLR Backend Testing Suite${NC}"
echo -e "${BLUE}=============================${NC}"
echo -e "${YELLOW}Render URL: ${RENDER_URL}${NC}"
echo -e "${YELLOW}Local URL: ${LOCAL_URL}${NC}"
echo -e "${YELLOW}Test Directory: ${TEST_DIR}${NC}"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check dependencies
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
        exit 1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies check passed${NC}"
}

# Function to install testing tools
install_tools() {
    echo -e "${BLUE}📦 Installing testing tools...${NC}"
    
    cd "$TEST_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing npm dependencies...${NC}"
        npm install
    else
        echo -e "${GREEN}npm dependencies already installed${NC}"
    fi
    
    if ! command_exists artillery; then
        echo -e "${YELLOW}Installing Artillery globally...${NC}"
        npm install -g artillery
    else
        echo -e "${GREEN}Artillery already installed${NC}"
    fi
    
    echo -e "${GREEN}✅ Testing tools installed${NC}"
}

# Function to run speed test
run_speed_test() {
    echo -e "${BLUE}⚡ Running Speed Test...${NC}"
    
    cd "$TEST_DIR"
    
    # Set environment variable for Render URL
    export RENDER_BASE_URL="$RENDER_URL"
    
    # Run speed test
    npm run speed-test
    
    echo -e "${GREEN}✅ Speed test completed${NC}"
}

# Function to run load test
run_load_test() {
    echo -e "${BLUE}📊 Running Load Test...${NC}"
    
    cd "$TEST_DIR"
    
    # Update the load test config with actual Render URL
    sed -i.bak "s|https://your-app-name.onrender.com|$RENDER_URL|g" load-tests/load-test-render.yml
    
    # Run load test
    artillery run load-tests/load-test-render.yml
    
    # Restore original config
    mv load-tests/load-test-render.yml.bak load-tests/load-test-render.yml
    
    echo -e "${GREEN}✅ Load test completed${NC}"
}

# Function to run health check
run_health_check() {
    echo -e "${BLUE}🏥 Running Health Check...${NC}"
    
    # Test basic connectivity
    if curl -s --max-time 10 "$RENDER_URL/api/iclr/random" > /dev/null; then
        echo -e "${GREEN}✅ Render backend is responding${NC}"
    else
        echo -e "${RED}❌ Render backend is not responding${NC}"
        return 1
    fi
    
    # Test response time
    echo -e "${YELLOW}Testing response time...${NC}"
    start_time=$(date +%s%N)
    curl -s "$RENDER_URL/api/iclr/random" > /dev/null
    end_time=$(date +%s%N)
    
    response_time=$(( (end_time - start_time) / 1000000 ))
    echo -e "${GREEN}Response time: ${response_time}ms${NC}"
    
    echo -e "${GREEN}✅ Health check completed${NC}"
}

# Function to generate summary report
generate_report() {
    echo -e "${BLUE}📋 Generating Summary Report...${NC}"
    
    cd "$RESULTS_DIR"
    
    # Find the latest speed test results
    latest_speed_test=$(ls -t speed-test-results-*.json 2>/dev/null | head -1)
    
    if [ -n "$latest_speed_test" ]; then
        echo -e "${GREEN}Latest speed test results: ${latest_speed_test}${NC}"
    fi
    
    # Find the latest load test results
    latest_load_test=$(ls -t load-test-render-results*.json 2>/dev/null | head -1)
    
    if [ -n "$latest_load_test" ]; then
        echo -e "${GREEN}Latest load test results: ${latest_load_test}${NC}"
    fi
    
    echo -e "${GREEN}✅ Report generation completed${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -s, --speed-only    Run only speed test"
    echo "  -l, --load-only     Run only load test"
    echo "  -c, --health-only   Run only health check"
    echo "  -a, --all           Run all tests (default)"
    echo "  -i, --install       Install testing tools only"
    echo ""
    echo "Environment Variables:"
    echo "  RENDER_BASE_URL     Set your Render backend URL"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all tests"
    echo "  $0 --speed-only                      # Run only speed test"
    echo "  RENDER_BASE_URL=https://myapp.onrender.com $0  # Set custom URL"
}

# Main execution
main() {
    local test_type="all"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -s|--speed-only)
                test_type="speed"
                shift
                ;;
            -l|--load-only)
                test_type="load"
                shift
                ;;
            -c|--health-only)
                test_type="health"
                shift
                ;;
            -a|--all)
                test_type="all"
                shift
                ;;
            -i|--install)
                test_type="install"
                shift
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check dependencies
    check_dependencies
    
    # Install tools if needed
    if [ "$test_type" = "install" ]; then
        install_tools
        exit 0
    fi
    
    install_tools
    
    # Run tests based on type
    case $test_type in
        "speed")
            run_speed_test
            ;;
        "load")
            run_load_test
            ;;
        "health")
            run_health_check
            ;;
        "all")
            run_health_check
            run_speed_test
            run_load_test
            ;;
    esac
    
    # Generate summary report
    generate_report
    
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    echo -e "${BLUE}Check the results directory for detailed reports: ${RESULTS_DIR}${NC}"
}

# Run main function with all arguments
main "$@"
