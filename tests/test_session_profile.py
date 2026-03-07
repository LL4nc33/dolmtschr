"""Tests für profile_id in Sessions."""
import pytest
from backend.database.models import Session


def test_session_has_profile_id_column():
    """Session muss profile_id Column haben."""
    cols = {c.name for c in Session.__table__.columns}
    assert "profile_id" in cols


def test_session_profile_id_nullable():
    """profile_id ist optional (bestehende Sessions ohne Profil bleiben gültig)."""
    col = Session.__table__.c["profile_id"]
    assert col.nullable is True


def test_session_profile_id_default_medical():
    """Default-Profil ist 'medical' (OidaNice Health Kontext)."""
    col = Session.__table__.c["profile_id"]
    assert col.default.arg == "medical"
