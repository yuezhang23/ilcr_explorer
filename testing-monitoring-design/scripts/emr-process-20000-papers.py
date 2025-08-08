#!/usr/bin/env python3
"""
EMR Spark Script: Process 20,000 Papers from S3
This script runs on EMR cluster to process large paper datasets
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, avg, min, max, stddev, explode, size, when, lit
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, DoubleType, IntegerType
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ICLRPaperProcessor:
    def __init__(self, spark_session, s3_bucket, s3_prefix):
        self.spark = spark_session
        self.s3_bucket = s3_bucket
        self.s3_prefix = s3_prefix
        
    def load_papers_from_s3(self, timestamp=None):
        """Load papers from S3 into Spark DataFrame"""
        logger.info("Loading papers from S3...")
        
        if timestamp:
            # Load specific export
            papers_path = f"s3://{self.s3_bucket}/{self.s3_prefix}/papers/chunk_*_{timestamp}.json"
        else:
            # Load latest export
            papers_path = f"s3://{self.s3_bucket}/{self.s3_prefix}/papers/chunk_*.json"
        
        # Read JSON files from S3
        papers_df = self.spark.read.json(papers_path)
        
        # Extract papers from chunk structure
        papers_df = papers_df.select(explode("papers").alias("paper"))
        
        # Flatten paper structure
        papers_df = papers_df.select("paper.*")
        
        logger.info(f"Loaded {papers_df.count()} papers from S3")
        return papers_df
    
    def analyze_paper_distribution(self, papers_df):
        """Analyze distribution of papers by various criteria"""
        logger.info("Analyzing paper distribution...")
        
        # Year distribution
        year_dist = papers_df.groupBy("year").count().orderBy("year")
        logger.info("Year distribution:")
        year_dist.show()
        
        # Decision distribution
        decision_dist = papers_df.groupBy("decision").count().orderBy("count", ascending=False)
        logger.info("Decision distribution:")
        decision_dist.show()
        
        # Authors per paper distribution
        authors_dist = papers_df.select(
            size(col("authors")).alias("author_count")
        ).groupBy("author_count").count().orderBy("author_count")
        logger.info("Authors per paper distribution:")
        authors_dist.show()
        
        return {
            "year_distribution": year_dist,
            "decision_distribution": decision_dist,
            "authors_distribution": authors_dist
        }
    
    def validate_paper_quality(self, papers_df):
        """Validate paper data quality"""
        logger.info("Validating paper quality...")
        
        # Check for missing titles
        missing_titles = papers_df.filter(col("title").isNull() | (col("title") == "")).count()
        
        # Check for missing abstracts
        missing_abstracts = papers_df.filter(col("abstract").isNull() | (col("abstract") == "")).count()
        
        # Check for papers without authors
        no_authors = papers_df.filter(
            col("authors").isNull() | (size(col("authors")) == 0)
        ).count()
        
        # Check for duplicate titles
        duplicate_titles = papers_df.groupBy("title").count().filter(col("count") > 1).count()
        
        # Calculate quality metrics
        total_papers = papers_df.count()
        quality_score = 100 - (
            (missing_titles + missing_abstracts + no_authors + duplicate_titles) / total_papers * 100
        )
        
        quality_report = {
            "total_papers": total_papers,
            "missing_titles": missing_titles,
            "missing_abstracts": missing_abstracts,
            "no_authors": no_authors,
            "duplicate_titles": duplicate_titles,
            "quality_score": quality_score
        }
        
        logger.info(f"Quality Report: {quality_report}")
        return quality_report
    
    def analyze_metareviews(self, papers_df):
        """Analyze metareview data if available"""
        logger.info("Analyzing metareviews...")
        
        # Check if metareviews exist
        if "metareviews" not in papers_df.columns:
            logger.info("No metareviews found in papers")
            return None
        
        # Papers with metareviews
        papers_with_reviews = papers_df.filter(
            col("metareviews").isNotNull() & (size(col("metareviews")) > 0)
        )
        
        review_count = papers_with_reviews.count()
        logger.info(f"Papers with metareviews: {review_count}")
        
        if review_count > 0:
            # Explode metareviews for analysis
            reviews_df = papers_with_reviews.select(
                col("_id").alias("paper_id"),
                explode("metareviews").alias("review")
            )
            
            # Analyze ratings
            rating_stats = reviews_df.select("review.rating").summary("count", "mean", "stddev", "min", "max")
            logger.info("Rating statistics:")
            rating_stats.show()
            
            # Analyze confidence
            confidence_stats = reviews_df.select("review.confidence").summary("count", "mean", "stddev", "min", "max")
            logger.info("Confidence statistics:")
            confidence_stats.show()
            
            return {
                "papers_with_reviews": review_count,
                "rating_stats": rating_stats,
                "confidence_stats": confidence_stats
            }
        
        return None
    
    def generate_analytics_report(self, papers_df):
        """Generate comprehensive analytics report"""
        logger.info("Generating analytics report...")
        
        # Basic statistics
        total_papers = papers_df.count()
        
        # Year analysis
        year_stats = papers_df.groupBy("year").agg(
            count("*").alias("paper_count"),
            avg(size(col("authors"))).alias("avg_authors_per_paper")
        ).orderBy("year")
        
        # Decision analysis
        decision_stats = papers_df.groupBy("decision").agg(
            count("*").alias("paper_count"),
            avg(size(col("authors"))).alias("avg_authors_per_paper")
        ).orderBy("paper_count", ascending=False)
        
        # Author analysis
        author_stats = papers_df.select(explode("authors").alias("author")).groupBy("author").count().orderBy("count", ascending=False)
        
        # Create comprehensive report
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_papers": total_papers,
            "year_analysis": year_stats,
            "decision_analysis": decision_stats,
            "top_authors": author_stats.limit(20)
        }
        
        return report
    
    def save_results_to_s3(self, results, timestamp):
        """Save processing results back to S3"""
        logger.info("Saving results to S3...")
        
        # Save year distribution
        results["year_analysis"].write.mode("overwrite").json(
            f"s3://{self.s3_bucket}/{self.s3_prefix}/analytics/year_distribution_{timestamp}/"
        )
        
        # Save decision distribution
        results["decision_analysis"].write.mode("overwrite").json(
            f"s3://{self.s3_bucket}/{self.s3_prefix}/analytics/decision_distribution_{timestamp}/"
        )
        
        # Save top authors
        results["top_authors"].write.mode("overwrite").json(
            f"s3://{self.s3_bucket}/{self.s3_prefix}/analytics/top_authors_{timestamp}/"
        )
        
        # Save summary report
        summary = {
            "timestamp": timestamp,
            "total_papers": results["total_papers"],
            "processing_time": datetime.now().isoformat()
        }
        
        # Convert to RDD and save
        summary_rdd = self.spark.sparkContext.parallelize([json.dumps(summary)])
        summary_rdd.saveAsTextFile(
            f"s3://{self.s3_bucket}/{self.s3_prefix}/analytics/summary_{timestamp}/"
        )
        
        logger.info(f"Results saved to s3://{self.s3_bucket}/{self.s3_prefix}/analytics/")
    
    def process_papers(self, timestamp=None):
        """Main processing pipeline"""
        logger.info("Starting paper processing pipeline...")
        
        # Load papers
        papers_df = self.load_papers_from_s3(timestamp)
        
        # Cache DataFrame for multiple operations
        papers_df.cache()
        
        try:
            # Analyze distributions
            distributions = self.analyze_paper_distribution(papers_df)
            
            # Validate quality
            quality_report = self.validate_paper_quality(papers_df)
            
            # Analyze metareviews
            metareview_analysis = self.analyze_metareviews(papers_df)
            
            # Generate comprehensive report
            analytics_report = self.generate_analytics_report(papers_df)
            
            # Save results
            processing_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            self.save_results_to_s3(analytics_report, processing_timestamp)
            
            # Print summary
            logger.info(f"""
            📊 Processing Summary:
            - Papers processed: {papers_df.count():,}
            - Quality score: {quality_report['quality_score']:.2f}%
            - Processing timestamp: {processing_timestamp}
            - Results saved to S3
            """)
            
            return {
                "success": True,
                "papers_processed": papers_df.count(),
                "quality_score": quality_report['quality_score'],
                "timestamp": processing_timestamp
            }
            
        finally:
            # Uncache DataFrame
            papers_df.unpersist()

def main():
    """Main execution function"""
    logger.info("Starting EMR paper processing...")
    
    # Initialize Spark session
    spark = SparkSession.builder \
        .appName("ICLR-Paper-Processing") \
        .config("spark.sql.adaptive.enabled", "true") \
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
        .getOrCreate()
    
    # Configuration
    S3_BUCKET = "your-iclr-bucket"  # Replace with your bucket
    S3_PREFIX = "iclr-data"
    
    try:
        # Initialize processor
        processor = ICLRPaperProcessor(spark, S3_BUCKET, S3_PREFIX)
        
        # Process papers
        result = processor.process_papers()
        
        if result["success"]:
            logger.info("✅ Paper processing completed successfully!")
            exit(0)
        else:
            logger.error("❌ Paper processing failed!")
            exit(1)
            
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        exit(1)
    finally:
        spark.stop()

if __name__ == "__main__":
    main() 