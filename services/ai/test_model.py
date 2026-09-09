from app.model import DevelopmentAnalyzer, preprocess, detect_script

def test_no_fabricated_confidence():
    result = DevelopmentAnalyzer().analyze('I will kill you', 'auto')
    assert result.confidence is None
    assert result.validationStatus == 'NON_VALIDATED_DEVELOPMENT'

def test_no_false_safe_result():
    assert DevelopmentAnalyzer().analyze('hello', 'en').classification == 'UNASSESSED'

def test_unicode_preserved():
    text = 'සිංහල தமிழ்'
    assert preprocess(text) == text
    assert detect_script('தமிழ்') == 'ta'
    assert detect_script('සිංහල') == 'si'
