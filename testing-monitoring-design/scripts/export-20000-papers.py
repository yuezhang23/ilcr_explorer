#!/usr/bin/env python3
"""
Export 20,000 Papers from MongoDB to S3 for EMR Processing
This script efficiently exports large datasets from MongoDB to S3
"""

import os
import json
import boto3
from pymongo import MongoClient
from datetime import datetime
import logging
from concurrent.futures import ThreadPoolExecutor
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBToS3Exporter:
    def __init__(self, mongo_uri, db_name, collection_name, s3_bucket, s3_prefix):
        self.mongo_uri = mongo_uri
        self.db_name = db_name
        self.collection_name = collection_name
        self.s3_bucket = s3_bucket
        self.s3_prefix = s3_prefix
        self.s3_client = boto3.client('s3')
        
    def get_total_papers(self):
        """Get total count of papers in MongoDB"""
        client = MongoClient(self.mongo_uri)
        db = client[self.db_name]
        collection = db[self.collection_name]
        
        total_count = collection.count_documents({})
        logger.info(f"Total papers in MongoDB: {total_count}")
        return total_count
    
    def export_papers_in_chunks(self, chunk_size=1000, max_workers=4):
        """Export papers in parallel chunks for better performance"""
        client = MongoClient(self.mongo_uri)
        db = client[self.db_name]
        collection = db[self.collection_name]
        
        # Get total count
        total_papers = self.get_total_papers()
        
        # Calculate number of chunks
        num_chunks = (total_papers + chunk_size - 1) // chunk_size
        logger.info(f"Exporting {total_papers} papers in {num_chunks} chunks of {chunk_size}")
        
        # Create timestamp for this export
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Export chunks in parallel
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = []
            
            for chunk_num in range(num_chunks):
                skip = chunk_num * chunk_size
                future = executor.submit(
                    self.export_chunk,
                    collection,
                    skip,
                    chunk_size,
                    chunk_num,
                    timestamp
                )
                futures.append(future)
            
            # Wait for all chunks to complete
            for future in futures:
                future.result()
        
        logger.info(f"Export completed! All {num_chunks} chunks uploaded to S3")
        
        # Create export manifest
        self.create_export_manifest(timestamp, total_papers, num_chunks)
        
        return timestamp
    
    def export_chunk(self, collection, skip, limit, chunk_num, timestamp):
        """Export a single chunk of papers"""
        try:
            # Fetch chunk from MongoDB
            papers = list(collection.find({}).skip(skip).limit(limit))
            
            # Convert ObjectId to string for JSON serialization
            for paper in papers:
                paper['_id'] = str(paper['_id'])
            
            # Create chunk data with metadata
            chunk_data = {
                "chunk_number": chunk_num,
                "total_papers": len(papers),
                "export_timestamp": timestamp,
                "papers": papers
            }
            
            # Upload to S3
            s3_key = f"{self.s3_prefix}/papers/chunk_{chunk_num:04d}_{timestamp}.json"
            
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=s3_key,
                Body=json.dumps(chunk_data, indent=2),
                ContentType='application/json'
            )
            
            logger.info(f"Chunk {chunk_num}: Exported {len(papers)} papers to s3://{self.s3_bucket}/{s3_key}")
            
            return s3_key
            
        except Exception as e:
            logger.error(f"Error exporting chunk {chunk_num}: {e}")
            raise
    
    def create_export_manifest(self, timestamp, total_papers, num_chunks):
        """Create a manifest file with export metadata"""
        manifest = {
            "export_timestamp": timestamp,
            "total_papers": total_papers,
            "num_chunks": num_chunks,
            "s3_bucket": self.s3_bucket,
            "s3_prefix": self.s3_prefix,
            "export_status": "completed",
            "created_at": datetime.now().isoformat()
        }
        
        manifest_key = f"{self.s3_prefix}/manifests/export_manifest_{timestamp}.json"
        
        self.s3_client.put_object(
            Bucket=self.s3_bucket,
            Key=manifest_key,
            Body=json.dumps(manifest, indent=2),
            ContentType='application/json'
        )
        
        logger.info(f"Export manifest created: s3://{self.s3_bucket}/{manifest_key}")
    
    def verify_export(self, timestamp):
        """Verify that all chunks were exported correctly"""
        try:
            # List all chunks for this export
            response = self.s3_client.list_objects_v2(
                Bucket=self.s3_bucket,
                Prefix=f"{self.s3_prefix}/papers/chunk_*_{timestamp}.json"
            )
            
            if 'Contents' not in response:
                logger.error("No exported chunks found!")
                return False
            
            chunk_files = response['Contents']
            logger.info(f"Found {len(chunk_files)} chunk files in S3")
            
            # Verify each chunk
            total_papers_exported = 0
            for chunk_file in chunk_files:
                # Download and verify chunk
                response = self.s3_client.get_object(
                    Bucket=self.s3_bucket,
                    Key=chunk_file['Key']
                )
                
                chunk_data = json.loads(response['Body'].read())
                total_papers_exported += chunk_data['total_papers']
            
            logger.info(f"Verification complete: {total_papers_exported} papers exported")
            return True
            
        except Exception as e:
            logger.error(f"Error verifying export: {e}")
            return False

def main():
    """Main execution function"""
    # Configuration
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = os.getenv('DB_NAME', 'iclr_2024')
    COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'papers')
    S3_BUCKET = os.getenv('S3_BUCKET', 'your-iclr-bucket')
    S3_PREFIX = os.getenv('S3_PREFIX', 'iclr-data')
    
    logger.info("Starting MongoDB to S3 export for EMR processing...")
    
    # Initialize exporter
    exporter = MongoDBToS3Exporter(
        mongo_uri=MONGO_URI,
        db_name=DB_NAME,
        collection_name=COLLECTION_NAME,
        s3_bucket=S3_BUCKET,
        s3_prefix=S3_PREFIX
    )
    
    try:
        # Export papers
        start_time = time.time()
        timestamp = exporter.export_papers_in_chunks(chunk_size=1000, max_workers=4)
        export_time = time.time() - start_time
        
        logger.info(f"Export completed in {export_time:.2f} seconds")
        
        # Verify export
        if exporter.verify_export(timestamp):
            logger.info("✅ Export verification successful!")
        else:
            logger.error("❌ Export verification failed!")
            exit(1)
        
        # Print summary
        total_papers = exporter.get_total_papers()
        logger.info(f"""
        📊 Export Summary:
        - Total papers exported: {total_papers:,}
        - Export timestamp: {timestamp}
        - S3 bucket: s3://{S3_BUCKET}/{S3_PREFIX}/papers/
        - Export time: {export_time:.2f} seconds
        - Average speed: {total_papers/export_time:.0f} papers/second
        """)
        
    except Exception as e:
        logger.error(f"Export failed: {e}")
        exit(1)

if __name__ == "__main__":
    main() 