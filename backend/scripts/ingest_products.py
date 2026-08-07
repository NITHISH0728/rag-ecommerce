import os
import sys
import argparse
import logging

# Ensure project root is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.core.config import settings
from backend.app.core.logging_config import setup_logging, logger
from backend.app.ingestion.pipeline import IngestionPipeline

def main():
    parser = argparse.ArgumentParser(
        description="ShopSmart AI Catalog Ingestion Pipeline CLI"
    )
    parser.add_argument(
        "--data-path",
        type=str,
        help="Path to the product JSON or CSV catalog file (overrides config)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Execute pipeline without generating vector embeddings or writing to database"
    )
    parser.add_argument(
        "--force-reembed",
        action="store_true",
        help="Force re-generation of embeddings for all active documents, ignoring cache hashes"
    )
    parser.add_argument(
        "--provider",
        type=str,
        choices=["local", "openai", "gemini"],
        help="Embedding provider override ('local', 'openai', or 'gemini')"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        help="API batch sizing for embedding requests"
    )
    parser.add_argument(
        "--collection",
        type=str,
        help="Name of the target vector store collection"
    )
    parser.add_argument(
        "--delete-stale",
        action="store_true",
        default=True,
        help="Purge chunks from vector collection that are no longer present in source catalog"
    )
    parser.add_argument(
        "--no-delete-stale",
        dest="delete_stale",
        action="store_false",
        help="Do not purge stale chunks from vector collection"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logs"
    )

    args = parser.parse_args()

    # Apply configuration overrides
    if args.data_path:
        settings.PRODUCT_DATA_PATH = args.data_path
    if args.provider:
        settings.EMBEDDING_PROVIDER = args.provider
    if args.batch_size:
        settings.EMBEDDING_BATCH_SIZE = args.batch_size
    if args.collection:
        settings.VECTOR_COLLECTION_NAME = args.collection
    if args.verbose:
        settings.INGESTION_LOG_LEVEL = "DEBUG"

    # Setup Logging
    setup_logging()
    if args.verbose:
        logging.getLogger("shopsmart-ingestion").setLevel(logging.DEBUG)

    logger.info("Initializing Ingestion CLI...")
    logger.info(f"Target catalog: {settings.PRODUCT_DATA_PATH}")
    logger.info(f"Embedding provider: {settings.EMBEDDING_PROVIDER}")
    logger.info(f"Collection Name: {settings.VECTOR_COLLECTION_NAME}")
    logger.info(f"Dry run mode: {args.dry_run}")
    logger.info(f"Force re-embed: {args.force_reembed}")
    logger.info(f"Delete stale records: {args.delete_stale}")

    # Confirm key configurations if not in dry-run
    if not args.dry_run:
        # Check API key configuration for chosen provider
        provider = settings.EMBEDDING_PROVIDER.lower()
        if provider == "local":
            logger.info("Using local Sentence Transformer embeddings — no API key required.")

    try:
        pipeline = IngestionPipeline()
        report = pipeline.run(
            data_path=settings.PRODUCT_DATA_PATH,
            dry_run=args.dry_run,
            force_reembed=args.force_reembed,
            delete_stale=args.delete_stale
        )
        
        if report.success:
            logger.info("Pipeline executed successfully.")
            sys.exit(0)
        else:
            logger.error(f"Pipeline completed with errors: {report.errors}")
            sys.exit(1)
            
    except Exception as e:
        logger.exception(f"Unhandled exception during pipeline execution: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
