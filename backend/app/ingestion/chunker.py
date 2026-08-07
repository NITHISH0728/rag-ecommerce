from typing import List, Dict, Any

class ChunkResult:
    def __init__(self, content: str, chunk_id: str, chunk_index: int, section_name: str):
        self.content = content
        self.chunk_id = chunk_id
        self.chunk_index = chunk_index
        self.section_name = section_name

def chunk_product_document(
    product_id: str,
    document_text: str,
    chunk_size: int = 1200
) -> List[ChunkResult]:
    """
    Splits the structured product document text into chunks.
    If the document fits in chunk_size, it remains a single chunk.
    Otherwise, it is split along double newline boundaries (paragraphs/sections)
    to keep logical units (e.g. Specifications, Descriptions) whole.
    """
    doc_len = len(document_text)
    
    # If the entire document fits within chunk_size, keep as single chunk
    if doc_len <= chunk_size:
        return [
            ChunkResult(
                content=document_text,
                chunk_id=f"{product_id}::chunk-000",
                chunk_index=0,
                section_name="full_document"
            )
        ]
        
    # Split text by double newlines into logical sections
    sections = [s.strip() for s in document_text.split("\n\n") if s.strip()]
    
    chunks: List[str] = []
    current_sections: List[str] = []
    current_length = 0
    
    for sec in sections:
        sec_len = len(sec)
        # If adding this section exceeds chunk_size, pack current chunk and start a new one
        if current_sections and (current_length + sec_len + 2 > chunk_size):
            chunks.append("\n\n".join(current_sections))
            current_sections = [sec]
            current_length = sec_len
        else:
            current_sections.append(sec)
            current_length += sec_len + (2 if current_length > 0 else 0)
            
    if current_sections:
        chunks.append("\n\n".join(current_sections))
        
    # Build typed chunk results
    chunk_results: List[ChunkResult] = []
    for idx, content in enumerate(chunks):
        # Determine a logical section name based on the content headers present
        section_name = "mixed"
        if idx == 0:
            section_name = "overview"
        elif "Key Specifications" in content:
            section_name = "specifications"
        elif "Full Description" in content:
            section_name = "description"
        elif "Recommended Use Cases" in content or "Search Tags" in content:
            section_name = "metadata_tags"
            
        chunk_results.append(
            ChunkResult(
                content=content,
                chunk_id=f"{product_id}::chunk-{idx:03d}",
                chunk_index=idx,
                section_name=section_name
            )
        )
        
    return chunk_results
