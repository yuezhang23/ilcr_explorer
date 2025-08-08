#!/usr/bin/env python3
"""
ICLR Data Validation Script
Validates 20,000+ papers for data integrity, schema compliance, and quality metrics.
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, count, isnan, isnull, when, udf
from pyspark.sql.types import StructType, StructField, StringType, ArrayType, DoubleType
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ICLRDataValidator:
    def __init__(self, spark_session):
        self.spark = spark_session
        self.validation_results = {}
        
    def validate_paper_schema(self, papers_df):
        """Validate paper schema and required fields"""
        logger.info("Starting paper schema validation...")
        
        # Define expected schema
        expected_schema = StructType([
            StructField("_id", StringType(), False),
            StructField("title", StringType(), False),
            StructField("authors", ArrayType(StringType()), False),
            StructField("abstract", StringType(), False),
            StructField("decision", StringType(), True),
            StructField("metareviews", ArrayType(StructType([
                StructField("rating", DoubleType(), True),
                StructField("confidence", DoubleType(), True)
            ])), True)
        ])
        
        # Check schema compliance
        schema_validation = {
            "total_papers": papers_df.count(),
            "schema_compliant": True,
            "missing_fields": [],
            "invalid_types": []
        }
        
        # Validate required fields
        required_fields = ["_id", "title", "authors", "abstract"]
        for field in required_fields:
            null_count = papers_df.filter(col(field).isNull()).count()
            if null_count > 0:
                schema_validation["missing_fields"].append({
                    "field": field,
                    "null_count": null_count,
                    "percentage": (null_count / schema_validation["total_papers"]) * 100
                })
                schema_validation["schema_compliant"] = False
        
        # Validate data types
        try:
            # Check if authors is an array
            authors_array_count = papers_df.filter(
                col("authors").isNotNull() & 
                (col("authors").cast("array<string>").isNull())
            ).count()
            
            if authors_array_count > 0:
                schema_validation["invalid_types"].append({
                    "field": "authors",
                    "invalid_count": authors_array_count,
                    "issue": "Not an array of strings"
                })
                schema_validation["schema_compliant"] = False
                
        except Exception as e:
            logger.error(f"Error validating authors field: {e}")
        
        self.validation_results["schema_validation"] = schema_validation
        logger.info(f"Schema validation completed. Compliant: {schema_validation['schema_compliant']}")
        
        return schema_validation
    
    def validate_data_quality(self, papers_df):
        """Validate data quality metrics"""
        logger.info("Starting data quality validation...")
        
        quality_metrics = {
            "total_papers": papers_df.count(),
            "quality_score": 0.0,
            "issues": []
        }
        
        # Check for duplicate titles
        duplicate_titles = papers_df.groupBy("title").count().filter(col("count") > 1)
        duplicate_count = duplicate_titles.count()
        if duplicate_count > 0:
            quality_metrics["issues"].append({
                "type": "duplicate_titles",
                "count": duplicate_count,
                "severity": "high"
            })
        
        # Check for empty or very short abstracts
        short_abstracts = papers_df.filter(
            (col("abstract").isNull()) | 
            (length(col("abstract")) < 50)
        ).count()
        
        if short_abstracts > 0:
            quality_metrics["issues"].append({
                "type": "short_abstracts",
                "count": short_abstracts,
                "severity": "medium"
            })
        
        # Check for papers without authors
        no_authors = papers_df.filter(
            (col("authors").isNull()) | 
            (size(col("authors")) == 0)
        ).count()
        
        if no_authors > 0:
            quality_metrics["issues"].append({
                "type": "no_authors",
                "count": no_authors,
                "severity": "high"
            })
        
        # Check for invalid decisions
        valid_decisions = ["accept", "reject", "borderline", "withdraw"]
        invalid_decisions = papers_df.filter(
            col("decision").isNotNull() & 
            ~col("decision").isin(valid_decisions)
        ).count()
        
        if invalid_decisions > 0:
            quality_metrics["issues"].append({
                "type": "invalid_decisions",
                "count": invalid_decisions,
                "severity": "medium"
            })
        
        # Calculate quality score
        total_issues = sum(issue["count"] for issue in quality_metrics["issues"])
        quality_metrics["quality_score"] = max(0, 100 - (total_issues / quality_metrics["total_papers"]) * 100)
        
        self.validation_results["quality_metrics"] = quality_metrics
        logger.info(f"Quality validation completed. Score: {quality_metrics['quality_score']:.2f}%")
        
        return quality_metrics
    
    def validate_metareviews(self, papers_df):
        """Validate metareview data"""
        logger.info("Starting metareview validation...")
        
        metareview_metrics = {
            "papers_with_metareviews": 0,
            "total_metareviews": 0,
            "average_rating": 0.0,
            "rating_distribution": {},
            "issues": []
        }
        
        # Count papers with metareviews
        papers_with_reviews = papers_df.filter(
            col("metareviews").isNotNull() & 
            (size(col("metareviews")) > 0)
        )
        
        metareview_metrics["papers_with_metareviews"] = papers_with_reviews.count()
        
        # Analyze metareview ratings
        if metareview_metrics["papers_with_metareviews"] > 0:
            # Explode metareviews to analyze individual reviews
            reviews_df = papers_with_reviews.select(
                col("_id").alias("paper_id"),
                explode(col("metareviews")).alias("review")
            )
            
            # Count total reviews
            metareview_metrics["total_metareviews"] = reviews_df.count()
            
            # Calculate average rating
            avg_rating = reviews_df.agg({"review.rating": "avg"}).collect()[0]["avg(review.rating)"]
            metareview_metrics["average_rating"] = avg_rating if avg_rating else 0.0
            
            # Check for invalid ratings
            invalid_ratings = reviews_df.filter(
                (col("review.rating").isNull()) |
                (col("review.rating") < 0) |
                (col("review.rating") > 10)
            ).count()
            
            if invalid_ratings > 0:
                metareview_metrics["issues"].append({
                    "type": "invalid_ratings",
                    "count": invalid_ratings,
                    "severity": "high"
                })
        
        self.validation_results["metareview_metrics"] = metareview_metrics
        logger.info(f"Metareview validation completed. Papers with reviews: {metareview_metrics['papers_with_metareviews']}")
        
        return metareview_metrics
    
    def validate_year_consistency(self, papers_df):
        """Validate year-based data consistency"""
        logger.info("Starting year consistency validation...")
        
        year_metrics = {
            "valid_years": [2024, 2025, 2026],
            "year_distribution": {},
            "issues": []
        }
        
        # Check if year field exists and analyze distribution
        if "year" in papers_df.columns:
            year_dist = papers_df.groupBy("year").count().collect()
            for row in year_dist:
                year_metrics["year_distribution"][row["year"]] = row["count"]
                
                # Check for invalid years
                if row["year"] not in year_metrics["valid_years"]:
                    year_metrics["issues"].append({
                        "type": "invalid_year",
                        "year": row["year"],
                        "count": row["count"],
                        "severity": "high"
                    })
        else:
            year_metrics["issues"].append({
                "type": "missing_year_field",
                "severity": "high"
            })
        
        self.validation_results["year_metrics"] = year_metrics
        logger.info(f"Year consistency validation completed")
        
        return year_metrics
    
    def generate_validation_report(self):
        """Generate comprehensive validation report"""
        logger.info("Generating validation report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "validation_summary": {
                "overall_status": "PASS" if self.is_validation_successful() else "FAIL",
                "total_issues": self.count_total_issues(),
                "critical_issues": self.count_critical_issues()
            },
            "detailed_results": self.validation_results
        }
        
        # Save report to S3
        report_json = json.dumps(report, indent=2)
        self.spark.sparkContext.parallelize([report_json]).saveAsTextFile(
            "s3://your-bucket/validation-reports/iclr-validation-report.json"
        )
        
        logger.info(f"Validation report generated and saved to S3")
        return report
    
    def is_validation_successful(self):
        """Check if validation passed all critical checks"""
        if "schema_validation" in self.validation_results:
            if not self.validation_results["schema_validation"]["schema_compliant"]:
                return False
        
        if "quality_metrics" in self.validation_results:
            if self.validation_results["quality_metrics"]["quality_score"] < 95:
                return False
        
        return True
    
    def count_total_issues(self):
        """Count total issues across all validations"""
        total = 0
        
        if "schema_validation" in self.validation_results:
            total += len(self.validation_results["schema_validation"]["missing_fields"])
            total += len(self.validation_results["schema_validation"]["invalid_types"])
        
        if "quality_metrics" in self.validation_results:
            total += len(self.validation_results["quality_metrics"]["issues"])
        
        if "metareview_metrics" in self.validation_results:
            total += len(self.validation_results["metareview_metrics"]["issues"])
        
        if "year_metrics" in self.validation_results:
            total += len(self.validation_results["year_metrics"]["issues"])
        
        return total
    
    def count_critical_issues(self):
        """Count critical issues (high severity)"""
        critical = 0
        
        for validation_type, results in self.validation_results.items():
            if "issues" in results:
                for issue in results["issues"]:
                    if issue.get("severity") == "high":
                        critical += 1
        
        return critical

def main():
    """Main execution function"""
    logger.info("Starting ICLR Data Validation Process")
    
    # Initialize Spark session
    spark = SparkSession.builder \
        .appName("ICLR-Data-Validation") \
        .config("spark.sql.adaptive.enabled", "true") \
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
        .getOrCreate()
    
    try:
        # Read papers data from MongoDB or exported JSON
        # For this example, we'll assume data is exported to S3 as JSON
        papers_df = spark.read.json("s3://your-bucket/iclr-data/papers/*.json")
        
        logger.info(f"Loaded {papers_df.count()} papers for validation")
        
        # Initialize validator
        validator = ICLRDataValidator(spark)
        
        # Run all validations
        validator.validate_paper_schema(papers_df)
        validator.validate_data_quality(papers_df)
        validator.validate_metareviews(papers_df)
        validator.validate_year_consistency(papers_df)
        
        # Generate and save report
        report = validator.generate_validation_report()
        
        # Log summary
        logger.info(f"Validation completed. Status: {report['validation_summary']['overall_status']}")
        logger.info(f"Total issues: {report['validation_summary']['total_issues']}")
        logger.info(f"Critical issues: {report['validation_summary']['critical_issues']}")
        
        # Exit with appropriate code
        if validator.is_validation_successful():
            logger.info("Validation PASSED - All critical checks passed")
            exit(0)
        else:
            logger.error("Validation FAILED - Critical issues found")
            exit(1)
            
    except Exception as e:
        logger.error(f"Validation process failed: {e}")
        exit(1)
    finally:
        spark.stop()

if __name__ == "__main__":
    main() 