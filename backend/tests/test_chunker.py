from backend.app.ingestion.chunker import chunk_product_document

def test_chunker_single_chunk():
    text = "Short text under the threshold limit."
    chunks = chunk_product_document("LAP-001", text, chunk_size=100)
    assert len(chunks) == 1
    assert chunks[0].chunk_id == "LAP-001::chunk-000"
    assert chunks[0].content == text
    assert chunks[0].section_name == "full_document"

def test_chunker_split_logic():
    # Construct a multisection document
    text = "Header Info\n\nShort Description:\nThis is description text.\n\nKey Specifications:\n- RAM: 8GB\n\nSearch Tags:\n- tag"
    
    # Force a small chunk size to trigger logical splitting on \n\n boundaries
    chunks = chunk_product_document("LAP-001", text, chunk_size=50)
    assert len(chunks) > 1
    
    # Ensure IDs are stable and sequential
    for i, c in enumerate(chunks):
        assert c.chunk_id == f"LAP-001::chunk-{i:03d}"
        assert c.chunk_index == i
        
    # Verify specs section has correct name label
    spec_chunk = next((c for c in chunks if "Key Specifications" in c.content), None)
    assert spec_chunk is not None
    assert spec_chunk.section_name == "specifications"
