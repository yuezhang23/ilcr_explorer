#!/usr/bin/env python3
"""
ICLR Performance Analysis Script
Analyzes performance metrics for 20,000+ papers processing and database operations.
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, avg, min, max, stddev, expr
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType
import json
import logging
from datetime import datetime, timedelta
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ICLRPerformanceAnalyzer:
    def __init__(self, spark_session):
        self.spark = spark_session
        self.performance_results = {}
        
    def analyze_query_performance(self, papers_df):
        """Analyze performance of common queries"""
        logger.info("Starting query performance analysis...")
        
        query_metrics = {
            "total_papers": papers_df.count(),
            "queries": {}
        }
        
        # Test 1: Simple count query
        start_time = time.time()
        total_count = papers_df.count()
        count_time = time.time() - start_time
        
        query_metrics["queries"]["count_all"] = {
            "operation": "Count all papers",
            "execution_time_ms": count_time * 1000,
            "result_count": total_count,
            "performance_rating": "excellent" if count_time < 1 else "good" if count_time < 5 else "poor"
        }
        
        # Test 2: Filter by decision
        start_time = time.time()
        accepted_papers = papers_df.filter(col("decision") == "accept").count()
        filter_time = time.time() - start_time
        
        query_metrics["queries"]["filter_by_decision"] = {
            "operation": "Filter by decision (accept)",
            "execution_time_ms": filter_time * 1000,
            "result_count": accepted_papers,
            "performance_rating": "excellent" if filter_time < 1 else "good" if filter_time < 5 else "poor"
        }
        
        # Test 3: Search by title (text search simulation)
        start_time = time.time()
        ml_papers = papers_df.filter(col("title").contains("machine learning")).count()
        search_time = time.time() - start_time
        
        query_metrics["queries"]["title_search"] = {
            "operation": "Search by title (machine learning)",
            "execution_time_ms": search_time * 1000,
            "result_count": ml_papers,
            "performance_rating": "excellent" if search_time < 2 else "good" if search_time < 10 else "poor"
        }
        
        # Test 4: Group by year
        start_time = time.time()
        year_distribution = papers_df.groupBy("year").count().collect()
        group_time = time.time() - start_time
        
        query_metrics["queries"]["group_by_year"] = {
            "operation": "Group by year",
            "execution_time_ms": group_time * 1000,
            "result_count": len(year_distribution),
            "performance_rating": "excellent" if group_time < 2 else "good" if group_time < 10 else "poor"
        }
        
        # Test 5: Complex aggregation with metareviews
        start_time = time.time()
        papers_with_reviews = papers_df.filter(
            col("metareviews").isNotNull() & 
            (expr("size(metareviews)") > 0)
        )
        
        avg_rating = papers_with_reviews.select(
            expr("explode(metareviews) as review")
        ).select(
            avg("review.rating").alias("avg_rating")
        ).collect()[0]["avg_rating"]
        
        complex_time = time.time() - start_time
        
        query_metrics["queries"]["complex_aggregation"] = {
            "operation": "Complex aggregation (avg rating)",
            "execution_time_ms": complex_time * 1000,
            "result_count": 1,
            "avg_rating": avg_rating,
            "performance_rating": "excellent" if complex_time < 5 else "good" if complex_time < 20 else "poor"
        }
        
        self.performance_results["query_performance"] = query_metrics
        logger.info(f"Query performance analysis completed")
        
        return query_metrics
    
    def analyze_data_distribution(self, papers_df):
        """Analyze data distribution and patterns"""
        logger.info("Starting data distribution analysis...")
        
        distribution_metrics = {
            "total_papers": papers_df.count(),
            "distributions": {}
        }
        
        # Year distribution
        if "year" in papers_df.columns:
            year_dist = papers_df.groupBy("year").count().collect()
            distribution_metrics["distributions"]["year"] = {
                row["year"]: row["count"] for row in year_dist
            }
        
        # Decision distribution
        decision_dist = papers_df.groupBy("decision").count().collect()
        distribution_metrics["distributions"]["decision"] = {
            row["decision"]: row["count"] for row in decision_dist
        }
        
        # Authors count distribution
        authors_count_dist = papers_df.select(
            expr("size(authors) as author_count")
        ).groupBy("author_count").count().orderBy("author_count").collect()
        
        distribution_metrics["distributions"]["authors_per_paper"] = {
            row["author_count"]: row["count"] for row in authors_count_dist
        }
        
        # Abstract length distribution
        abstract_length_dist = papers_df.select(
            expr("length(abstract) as abstract_length")
        ).groupBy(
            expr("CASE " +
                 "WHEN abstract_length < 100 THEN 'short' " +
                 "WHEN abstract_length < 500 THEN 'medium' " +
                 "WHEN abstract_length < 1000 THEN 'long' " +
                 "ELSE 'very_long' END as length_category")
        ).count().collect()
        
        distribution_metrics["distributions"]["abstract_length"] = {
            row["length_category"]: row["count"] for row in abstract_length_dist
        }
        
        # Metareview distribution
        papers_with_reviews = papers_df.filter(
            col("metareviews").isNotNull() & 
            (expr("size(metareviews)") > 0)
        )
        
        review_count_dist = papers_with_reviews.select(
            expr("size(metareviews) as review_count")
        ).groupBy("review_count").count().orderBy("review_count").collect()
        
        distribution_metrics["distributions"]["reviews_per_paper"] = {
            row["review_count"]: row["count"] for row in review_count_dist
        }
        
        self.performance_results["data_distribution"] = distribution_metrics
        logger.info(f"Data distribution analysis completed")
        
        return distribution_metrics
    
    def analyze_index_efficiency(self, papers_df):
        """Analyze index efficiency and optimization opportunities"""
        logger.info("Starting index efficiency analysis...")
        
        index_metrics = {
            "recommendations": [],
            "performance_issues": []
        }
        
        # Check for frequently queried fields
        frequently_queried = ["year", "decision", "title"]
        
        for field in frequently_queried:
            if field in papers_df.columns:
                # Simulate index efficiency by measuring filter performance
                start_time = time.time()
                filtered_count = papers_df.filter(col(field).isNotNull()).count()
                filter_time = time.time() - start_time
                
                if filter_time > 2.0:  # More than 2 seconds
                    index_metrics["recommendations"].append({
                        "field": field,
                        "recommendation": f"Create index on {field}",
                        "reason": f"Filter operation took {filter_time:.2f}s",
                        "priority": "high" if filter_time > 5 else "medium"
                    })
        
        # Check for text search performance
        text_search_fields = ["title", "abstract"]
        for field in text_search_fields:
            if field in papers_df.columns:
                start_time = time.time()
                search_results = papers_df.filter(col(field).contains("the")).count()
                search_time = time.time() - start_time
                
                if search_time > 3.0:
                    index_metrics["recommendations"].append({
                        "field": field,
                        "recommendation": f"Create text index on {field}",
                        "reason": f"Text search took {search_time:.2f}s",
                        "priority": "high" if search_time > 10 else "medium"
                    })
        
        # Check for aggregation performance
        start_time = time.time()
        year_decision_agg = papers_df.groupBy("year", "decision").count().collect()
        agg_time = time.time() - start_time
        
        if agg_time > 5.0:
            index_metrics["recommendations"].append({
                "fields": ["year", "decision"],
                "recommendation": "Create compound index on year and decision",
                "reason": f"Group by operation took {agg_time:.2f}s",
                "priority": "high" if agg_time > 10 else "medium"
            })
        
        self.performance_results["index_efficiency"] = index_metrics
        logger.info(f"Index efficiency analysis completed")
        
        return index_metrics
    
    def analyze_resource_utilization(self):
        """Analyze resource utilization patterns"""
        logger.info("Starting resource utilization analysis...")
        
        resource_metrics = {
            "memory_usage": {},
            "cpu_usage": {},
            "storage_metrics": {},
            "recommendations": []
        }
        
        # Get Spark application metrics
        spark_context = self.spark.sparkContext
        
        # Memory metrics
        memory_metrics = spark_context.getStatusTracker().getExecutorMetrics()
        if memory_metrics:
            resource_metrics["memory_usage"] = {
                "total_memory_mb": memory_metrics.get("TotalMemoryMB", 0),
                "used_memory_mb": memory_metrics.get("UsedMemoryMB", 0),
                "memory_utilization_percent": (
                    memory_metrics.get("UsedMemoryMB", 0) / 
                    max(memory_metrics.get("TotalMemoryMB", 1), 1) * 100
                )
            }
        
        # Storage metrics (estimate based on data size)
        papers_count = self.spark.sql("SELECT COUNT(*) as count FROM papers").collect()[0]["count"]
        estimated_storage_mb = papers_count * 0.01  # Rough estimate: 10KB per paper
        
        resource_metrics["storage_metrics"] = {
            "estimated_storage_mb": estimated_storage_mb,
            "papers_per_mb": papers_count / max(estimated_storage_mb, 1)
        }
        
        # Generate recommendations based on metrics
        if resource_metrics["memory_usage"].get("memory_utilization_percent", 0) > 80:
            resource_metrics["recommendations"].append({
                "type": "memory",
                "recommendation": "Increase executor memory",
                "reason": "High memory utilization detected",
                "priority": "high"
            })
        
        if estimated_storage_mb > 1000:  # More than 1GB
            resource_metrics["recommendations"].append({
                "type": "storage",
                "recommendation": "Consider data partitioning",
                "reason": f"Large dataset size: {estimated_storage_mb:.2f}MB",
                "priority": "medium"
            })
        
        self.performance_results["resource_utilization"] = resource_metrics
        logger.info(f"Resource utilization analysis completed")
        
        return resource_metrics
    
    def analyze_scalability_patterns(self, papers_df):
        """Analyze scalability patterns and bottlenecks"""
        logger.info("Starting scalability analysis...")
        
        scalability_metrics = {
            "bottlenecks": [],
            "scalability_limits": {},
            "optimization_opportunities": []
        }
        
        # Test different data sizes
        sample_sizes = [1000, 5000, 10000, 20000]
        performance_by_size = {}
        
        for size in sample_sizes:
            if papers_df.count() >= size:
                sample_df = papers_df.limit(size)
                
                # Test count operation
                start_time = time.time()
                sample_df.count()
                count_time = time.time() - start_time
                
                # Test filter operation
                start_time = time.time()
                sample_df.filter(col("decision") == "accept").count()
                filter_time = time.time() - start_time
                
                performance_by_size[size] = {
                    "count_time_ms": count_time * 1000,
                    "filter_time_ms": filter_time * 1000
                }
        
        scalability_metrics["performance_by_size"] = performance_by_size
        
        # Identify bottlenecks
        if performance_by_size:
            largest_size = max(performance_by_size.keys())
            largest_performance = performance_by_size[largest_size]
            
            if largest_performance["count_time_ms"] > 5000:
                scalability_metrics["bottlenecks"].append({
                    "operation": "count",
                    "size": largest_size,
                    "time_ms": largest_performance["count_time_ms"],
                    "severity": "high"
                })
            
            if largest_performance["filter_time_ms"] > 3000:
                scalability_metrics["bottlenecks"].append({
                    "operation": "filter",
                    "size": largest_size,
                    "time_ms": largest_performance["filter_time_ms"],
                    "severity": "medium"
                })
        
        # Estimate scalability limits
        current_size = papers_df.count()
        if current_size > 15000:
            scalability_metrics["scalability_limits"] = {
                "current_size": current_size,
                "estimated_max_size": 50000,
                "recommended_optimizations": [
                    "Implement database sharding",
                    "Add read replicas",
                    "Optimize indexes",
                    "Implement caching layer"
                ]
            }
        
        self.performance_results["scalability_patterns"] = scalability_metrics
        logger.info(f"Scalability analysis completed")
        
        return scalability_metrics
    
    def generate_performance_report(self):
        """Generate comprehensive performance report"""
        logger.info("Generating performance report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "performance_summary": {
                "overall_performance": self.calculate_overall_performance(),
                "critical_issues": self.count_critical_performance_issues(),
                "optimization_opportunities": self.count_optimization_opportunities()
            },
            "detailed_results": self.performance_results
        }
        
        # Save report to S3
        report_json = json.dumps(report, indent=2)
        self.spark.sparkContext.parallelize([report_json]).saveAsTextFile(
            "s3://your-bucket/performance-reports/iclr-performance-report.json"
        )
        
        logger.info(f"Performance report generated and saved to S3")
        return report
    
    def calculate_overall_performance(self):
        """Calculate overall performance score"""
        score = 100
        
        # Deduct points for slow queries
        if "query_performance" in self.performance_results:
            for query_name, metrics in self.performance_results["query_performance"]["queries"].items():
                if metrics["performance_rating"] == "poor":
                    score -= 10
                elif metrics["performance_rating"] == "good":
                    score -= 5
        
        # Deduct points for resource issues
        if "resource_utilization" in self.performance_results:
            memory_util = self.performance_results["resource_utilization"]["memory_usage"].get("memory_utilization_percent", 0)
            if memory_util > 80:
                score -= 15
        
        return max(0, score)
    
    def count_critical_performance_issues(self):
        """Count critical performance issues"""
        critical_count = 0
        
        # Count poor performing queries
        if "query_performance" in self.performance_results:
            for query_name, metrics in self.performance_results["query_performance"]["queries"].items():
                if metrics["performance_rating"] == "poor":
                    critical_count += 1
        
        # Count high priority recommendations
        for result_type, results in self.performance_results.items():
            if "recommendations" in results:
                for rec in results["recommendations"]:
                    if rec.get("priority") == "high":
                        critical_count += 1
        
        return critical_count
    
    def count_optimization_opportunities(self):
        """Count optimization opportunities"""
        total_opportunities = 0
        
        for result_type, results in self.performance_results.items():
            if "recommendations" in results:
                total_opportunities += len(results["recommendations"])
        
        return total_opportunities

def main():
    """Main execution function"""
    logger.info("Starting ICLR Performance Analysis Process")
    
    # Initialize Spark session
    spark = SparkSession.builder \
        .appName("ICLR-Performance-Analysis") \
        .config("spark.sql.adaptive.enabled", "true") \
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
        .getOrCreate()
    
    try:
        # Read papers data
        papers_df = spark.read.json("s3://your-bucket/iclr-data/papers/*.json")
        
        logger.info(f"Loaded {papers_df.count()} papers for performance analysis")
        
        # Initialize analyzer
        analyzer = ICLRPerformanceAnalyzer(spark)
        
        # Run all analyses
        analyzer.analyze_query_performance(papers_df)
        analyzer.analyze_data_distribution(papers_df)
        analyzer.analyze_index_efficiency(papers_df)
        analyzer.analyze_resource_utilization()
        analyzer.analyze_scalability_patterns(papers_df)
        
        # Generate and save report
        report = analyzer.generate_performance_report()
        
        # Log summary
        logger.info(f"Performance analysis completed. Overall score: {report['performance_summary']['overall_performance']}")
        logger.info(f"Critical issues: {report['performance_summary']['critical_issues']}")
        logger.info(f"Optimization opportunities: {report['performance_summary']['optimization_opportunities']}")
        
        # Exit with appropriate code
        if report['performance_summary']['overall_performance'] >= 80:
            logger.info("Performance analysis PASSED - Good performance metrics")
            exit(0)
        else:
            logger.warning("Performance analysis WARNING - Performance issues detected")
            exit(0)  # Don't fail the job, just warn
            
    except Exception as e:
        logger.error(f"Performance analysis failed: {e}")
        exit(1)
    finally:
        spark.stop()

if __name__ == "__main__":
    main() 