import os
import json
import glob
from typing import Optional, List, Tuple
import hashlib

from .visualize import VisualResponse

# Get cache configuration from environment variables with defaults
TEMP_DIRECTORY = os.getenv("TEMP_DIRECTORY", "/tmp")
CACHE_DIR = os.getenv("DOC_VISUALIZER_CACHE_DIR", os.path.join(TEMP_DIRECTORY, "doc_visualizer_cache"))
MAX_CACHE_SIZE_MB = int(os.getenv("DOC_VISUALIZER_MAX_CACHE_SIZE_MB", "500"))

class VisualizationCache:
    """
    Caches visualization data to avoid expensive regeneration.
    """
    
    def __init__(self, cache_dir: str = CACHE_DIR, max_cache_size_mb: int = MAX_CACHE_SIZE_MB):
        """
        Initialize the cache service.
        
        Args:
            cache_dir: Directory to store cache files. Defaults to environment variable DOC_VISUALIZER_CACHE_DIR or a subdirectory in TEMP_DIRECTORY.
            max_cache_size_mb: Maximum cache size in MB. Defaults to environment variable DOC_VISUALIZER_MAX_CACHE_SIZE_MB or 500MB.
        """
        self.cache_dir = cache_dir
        self.max_cache_size_mb = max_cache_size_mb
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        print(f"Visualization cache initialized at {self.cache_dir} with max size {self.max_cache_size_mb}MB")
    
    def _get_cache_key(self, doc_id: str, model: str) -> str:
        """
        Generate a unique cache key for the document and model.
        
        Args:
            doc_id: Document ID
            model: Model used for generating the visualization
            
        Returns:
            A unique cache key
        """
        # Create a hash that includes the doc_id and model
        key = f"{doc_id}:{model}"
        return hashlib.md5(key.encode()).hexdigest()
    
    def _get_cache_path(self, doc_id: str, model: str) -> str:
        """
        Get the file path for a cache entry.
        
        Args:
            doc_id: Document ID
            model: Model used for generating the visualization
            
        Returns:
            Path to the cache file
        """
        cache_key = self._get_cache_key(doc_id, model)
        return os.path.join(self.cache_dir, f"{cache_key}.json")
    
    def get(self, doc_id: str, model: str) -> Optional[VisualResponse]:
        """
        Retrieve a cached visualization if available.
        
        Args:
            doc_id: Document ID
            model: Model used for generating the visualization
            
        Returns:
            Cached visualization data or None if not found
        """
        cache_path = self._get_cache_path(doc_id, model)
        
        if not os.path.exists(cache_path):
            return None
        
        try:
            # Update file access time
            os.utime(cache_path, None)
            
            with open(cache_path, 'r') as f:
                cache_data = json.load(f)
            
            print(f"Cache hit for document {doc_id} with model {model}")
            # Convert the cached JSON back to a VisualResponse
            return VisualResponse.model_validate(cache_data)
        except Exception as e:
            print(f"Error reading cache: {e}")
            return None
    
    def set(self, doc_id: str, model: str, visualization: VisualResponse) -> None:
        """
        Cache visualization data.
        
        Args:
            doc_id: Document ID
            model: Model used for generating the visualization
            visualization: The visualization data to cache
        """
        # Check if we need to cleanup the cache before adding new entries
        self._cleanup_cache_if_needed()
        
        cache_path = self._get_cache_path(doc_id, model)
        
        try:
            # Convert VisualResponse to a dictionary of JSON serializable types and save as JSON
            with open(cache_path, 'w') as f:
                json.dump(visualization.model_dump(mode="json"), f)
            print(f"Cached visualization for document {doc_id} with model {model}")
        except Exception as e:
            print(f"Error writing to cache: {e}")
    
    def _get_cache_size_mb(self) -> float:
        """
        Calculate the current size of the cache in MB.
        
        Returns:
            Cache size in MB
        """
        total_size = 0
        for path in glob.glob(os.path.join(self.cache_dir, "*.json")):
            total_size += os.path.getsize(path)
        
        return total_size / (1024 * 1024)  # Convert to MB
    
    def _get_cache_files_by_access_time(self) -> List[Tuple[str, float]]:
        """
        Get a list of cache files sorted by last access time.
        
        Returns:
            List of tuples containing file path and access time
        """
        files = []
        for path in glob.glob(os.path.join(self.cache_dir, "*.json")):
            access_time = os.path.getatime(path)
            files.append((path, access_time))
        
        # Sort by access time (oldest first)
        return sorted(files, key=lambda x: x[1])
    
    def _cleanup_cache_if_needed(self) -> None:
        """
        Remove oldest cache files if cache exceeds maximum size.
        """
        current_size_mb = self._get_cache_size_mb()
        
        # Only cleanup if we're exceeding the maximum size
        if current_size_mb <= self.max_cache_size_mb:
            return
        
        print(f"Cache size ({current_size_mb:.2f}MB) exceeds maximum ({self.max_cache_size_mb}MB). Cleaning up...")
        
        # Get files sorted by access time (oldest first)
        files = self._get_cache_files_by_access_time()
        
        # Remove oldest files until we're under the limit
        for file_path, _ in files:
            if current_size_mb <= self.max_cache_size_mb * 0.8:  # Target 80% of max size
                break
                
            file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
            try:
                os.remove(file_path)
                current_size_mb -= file_size_mb
                print(f"Removed cache file: {file_path}")
            except Exception as e:
                print(f"Error removing cache file {file_path}: {e}")
        
        print(f"Cache cleanup complete. New size: {current_size_mb:.2f}MB")
    
    def clear_cache(self) -> None:
        """
        Completely clear the cache directory by removing all cache files.
        This should be called during server shutdown.
        """
        try:
            files_removed = 0
            cache_size_before = self._get_cache_size_mb()
            
            for file_path in glob.glob(os.path.join(self.cache_dir, "*.json")):
                try:
                    os.remove(file_path)
                    files_removed += 1
                except Exception as e:
                    print(f"Error removing cache file {file_path}: {e}")
            
            print(f"Visualization cache cleared: removed {files_removed} files ({cache_size_before:.2f}MB)")
        except Exception as e:
            print(f"Error clearing visualization cache: {e}")

# Create a singleton instance
visualization_cache = VisualizationCache() 