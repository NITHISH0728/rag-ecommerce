from backend.app.ingestion.hashing import calculate_text_hash, calculate_dict_hash

def test_text_hashing_stability():
    text = "  Hello World  "
    h1 = calculate_text_hash(text)
    h2 = calculate_text_hash("Hello World")
    assert h1 == h2
    assert len(h1) == 64

def test_dict_hashing_stability():
    d1 = {"a": 1, "b": 2, "c": [3, 4]}
    d2 = {"c": [3, 4], "b": 2, "a": 1} # different key ordering
    
    h1 = calculate_dict_hash(d1)
    h2 = calculate_dict_hash(d2)
    assert h1 == h2
    assert len(h1) == 64

def test_dict_hashing_ignore_volatile():
    d1 = {"a": 1, "createdAt": "2026-07-01", "updatedAt": "2026-08-01"}
    d2 = {"a": 1, "createdAt": "2026-07-05", "updatedAt": "2026-08-05"}
    
    # Hashing should match when volatile keys are ignored
    h1 = calculate_dict_hash(d1, ignore_keys=["createdAt", "updatedAt"])
    h2 = calculate_dict_hash(d2, ignore_keys=["createdAt", "updatedAt"])
    assert h1 == h2
